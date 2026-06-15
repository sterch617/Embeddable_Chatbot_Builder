// Text embeddings. Runs a local sentence-transformer (all-MiniLM-L6-v2, 384-dim)
// via transformers.js — no API key, real semantic vectors. Model weights are
// downloaded once to MODEL_CACHE_DIR on first use, then cached on disk.

import { EMBEDDING_DIM } from "../constants";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

// Minimal shape of the transformers.js feature-extraction pipeline we use.
type Extractor = (
  texts: string[],
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ tolist: () => number[][] }>;

// Cache the loaded pipeline on globalThis so Next.js hot-reloads (and repeated
// imports) reuse the same in-memory model instead of reloading it.
declare global {
  // eslint-disable-next-line no-var
  var __ecbExtractor: Promise<Extractor> | undefined;
}

async function getExtractor(): Promise<Extractor> {
  if (!globalThis.__ecbExtractor) {
    globalThis.__ecbExtractor = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.cacheDir = process.env.MODEL_CACHE_DIR?.trim() || ".cache";
      const extractor = await pipeline("feature-extraction", MODEL_ID);
      return extractor as unknown as Extractor;
    })();
  }
  return globalThis.__ecbExtractor;
}

/** Embed a batch of texts. Returns one normalized 384-dim vector per input. */
export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const extractor = await getExtractor();
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}

/** Embed a single text. */
export async function embedOne(text: string): Promise<number[]> {
  const [vector] = await embed([text]);
  return vector;
}

export { EMBEDDING_DIM };
