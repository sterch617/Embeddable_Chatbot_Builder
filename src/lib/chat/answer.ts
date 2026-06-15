// Shared RAG answer flow, used by both the in-app playground and the public
// widget. Retrieves relevant context, streams the answer, persists the turn,
// and emits newline-delimited JSON events the client can parse incrementally.

import type { DB } from "../db/client";
import type { Bot } from "../db/schema";
import { conversations, messages } from "../db/schema";
import { embedOne } from "../ai/embeddings";
import { searchChunks, type RetrievedChunk } from "../retrieval";
import { streamAnswer, type ChatMessage } from "../ai/chat";
import { MIN_RELEVANCE, RETRIEVAL_TOP_K } from "../constants";
import type { Citation, ConversationChannel } from "../types";

function buildCitations(hits: RetrievedChunk[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const h of hits) {
    if (seen.has(h.documentId)) continue;
    seen.add(h.documentId);
    const snippet = h.content.slice(0, 160).trim();
    out.push({
      documentId: h.documentId,
      title: h.title,
      snippet: snippet + (h.content.length > 160 ? "…" : ""),
    });
    if (out.length >= 3) break;
  }
  return out;
}

export interface AnswerOptions {
  db: DB;
  bot: Bot;
  question: string;
  history: ChatMessage[];
  conversationId?: string | null;
  channel: ConversationChannel;
}

/** Builds a streaming response body of newline-delimited JSON events. */
export async function answerStream(opts: AnswerOptions): Promise<ReadableStream<Uint8Array>> {
  const { db, bot, question, history, channel } = opts;

  const queryVector = await embedOne(question);
  const hits = (await searchChunks(db, bot.id, queryVector, RETRIEVAL_TOP_K)).filter(
    (h) => h.score >= MIN_RELEVANCE,
  );
  const citations = buildCitations(hits);
  const context = hits.map((h) => ({
    documentId: h.documentId,
    title: h.title,
    content: h.content,
    score: h.score,
  }));

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        let conversationId = opts.conversationId ?? null;
        if (!conversationId) {
          const [conv] = await db
            .insert(conversations)
            .values({ botId: bot.id, channel })
            .returning();
          conversationId = conv.id;
        }
        await db
          .insert(messages)
          .values({ conversationId, role: "user", content: question });
        send({ type: "meta", conversationId });

        let full = "";
        for await (const token of streamAnswer({
          question,
          history,
          context,
          botName: bot.name,
          systemPrompt: bot.systemPrompt,
        })) {
          full += token;
          send({ type: "token", v: token });
        }

        if (citations.length > 0) send({ type: "citations", items: citations });

        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: full,
          citations: citations.length > 0 ? citations : null,
        });
        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      } finally {
        controller.close();
      }
    },
  });
}
