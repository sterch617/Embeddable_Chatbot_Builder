// Chat answer generation. Provider is selected from env:
//   - ANTHROPIC_API_KEY -> Claude   (wired when a key is configured)
//   - OPENAI_API_KEY     -> OpenAI   (wired when a key is configured)
//   - otherwise          -> "preview" mock that answers extractively from the
//                           retrieved context (no key, still grounded + cited).
// Embeddings are always real (local), so retrieval quality is identical in
// every mode; only the final wording differs.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RetrievedContext {
  documentId: string;
  title: string;
  content: string;
  score: number;
}

export interface AnswerInput {
  question: string;
  history: ChatMessage[];
  context: RetrievedContext[];
  botName: string;
  systemPrompt?: string | null;
}

export interface ProviderInfo {
  id: "mock" | "anthropic" | "openai";
  label: string;
  live: boolean; // true when backed by a real LLM
}

export function activeProvider(): ProviderInfo {
  if (process.env.ANTHROPIC_API_KEY?.trim())
    return { id: "anthropic", label: "Claude", live: true };
  if (process.env.OPENAI_API_KEY?.trim())
    return { id: "openai", label: "OpenAI", live: true };
  return { id: "mock", label: "Preview", live: false };
}

/** System prompt for real LLM providers (ready for when a key is added). */
export function buildSystemPrompt(input: AnswerInput): string {
  const ctx = input.context
    .map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`)
    .join("\n\n");
  return [
    `You are ${input.botName}, a friendly and concise support assistant.`,
    input.systemPrompt?.trim() ?? "",
    "Answer the user's question using ONLY the context below. If the answer is not in the context, say you don't have that information and suggest contacting a human. Never invent facts.",
    "Respond directly with the answer — no preamble and no meta-commentary about your reasoning.",
    "",
    "Context:",
    ctx || "(no relevant context found)",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Streams an answer as text chunks. */
export async function* streamAnswer(input: AnswerInput): AsyncGenerator<string> {
  if (activeProvider().id === "anthropic") {
    let produced = false;
    try {
      for await (const token of streamAnthropic(input)) {
        produced = true;
        yield token;
      }
      return;
    } catch (err) {
      // If Claude fails before producing any output (bad key, rate limit),
      // fall back to the grounded mock so the chat never breaks. A mid-stream
      // failure is re-thrown for the caller to surface.
      if (produced) throw err;
      console.error("Anthropic provider failed, using grounded fallback:", err);
    }
  }
  yield* streamMock(input);
}

// --- Anthropic (Claude) provider -----------------------------------------

async function* streamAnthropic(input: AnswerInput): AsyncGenerator<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  const model = process.env.CHAT_MODEL?.trim() || "claude-opus-4-8";

  const messages = [
    ...input.history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: input.question },
  ];

  const stream = client.messages.stream({
    model,
    max_tokens: 1024,
    system: buildSystemPrompt(input),
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// --- Mock (keyless) extractive answerer ----------------------------------

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "do", "does", "did", "how", "what", "why",
  "when", "where", "can", "i", "you", "my", "your", "it", "this", "that",
]);

function keywords(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  return words.filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return (cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildMockAnswer(input: AnswerInput): string {
  if (input.context.length === 0) {
    return `I don't have anything about that in ${input.botName}'s knowledge base yet. Try rephrasing your question, or add a document that covers this topic.`;
  }

  const kws = keywords(input.question);
  const candidates: { sentence: string; score: number }[] = [];
  for (const chunk of input.context.slice(0, 3)) {
    for (const sentence of splitSentences(chunk.content)) {
      if (sentence.length < 25) continue;
      const lower = sentence.toLowerCase();
      const score = kws.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0);
      candidates.push({ sentence, score });
    }
  }

  const ranked = candidates.sort((a, b) => b.score - a.score);
  const hits = ranked.filter((c) => c.score > 0).slice(0, 3);

  let body: string;
  if (hits.length > 0) {
    const seen = new Set<string>();
    body = hits
      .map((h) => h.sentence)
      .filter((s) => (seen.has(s) ? false : (seen.add(s), true)))
      .join(" ");
  } else {
    // No keyword overlap — summarize the opening of the most relevant chunk.
    body = splitSentences(input.context[0].content).slice(0, 2).join(" ");
  }

  return body;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* streamMock(input: AnswerInput): AsyncGenerator<string> {
  const answer = buildMockAnswer(input);
  const tokens = answer.match(/\S+\s*/g) ?? [answer];
  for (const token of tokens) {
    yield token;
    await sleep(14); // gentle typing effect
  }
}
