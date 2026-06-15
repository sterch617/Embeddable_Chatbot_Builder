// Semantic retrieval over stored chunks. Embeddings are real (local MiniLM or a
// provider); similarity is computed in JS so it works identically on PGlite and
// Postgres with no extension. Adequate for MVP scale; swap to pgvector for ANN.

import { eq } from "drizzle-orm";
import type { DB } from "./db/client";
import { chunks, documents } from "./db/schema";
import { RETRIEVAL_TOP_K } from "./constants";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  title: string;
  content: string;
  score: number; // cosine similarity in [-1, 1]
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Returns the top-k most similar chunks for a bot, highest score first. */
export async function searchChunks(
  db: DB,
  botId: string,
  queryEmbedding: number[],
  k: number = RETRIEVAL_TOP_K,
): Promise<RetrievedChunk[]> {
  const rows = await db
    .select({
      id: chunks.id,
      documentId: chunks.documentId,
      title: documents.title,
      content: chunks.content,
      embedding: chunks.embedding,
    })
    .from(chunks)
    .innerJoin(documents, eq(documents.id, chunks.documentId))
    .where(eq(chunks.botId, botId));

  return rows
    .map((r) => ({
      id: r.id,
      documentId: r.documentId,
      title: r.title,
      content: r.content,
      score: cosineSimilarity(queryEmbedding, r.embedding as number[]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
