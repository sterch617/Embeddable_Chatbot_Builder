// Ingestion orchestrator: create a document, chunk its text, embed the chunks
// and store them. Document status moves processing -> ready (or failed).

import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { documents, chunks, type Document } from "../db/schema";
import { embed } from "../ai/embeddings";
import { chunkText } from "./chunk";
import type { DocSourceType } from "../types";

export interface IngestInput {
  botId: string;
  title: string;
  sourceType: DocSourceType;
  sourceUrl?: string | null;
  text: string;
}

export async function ingestDocument(
  db: DB,
  input: IngestInput,
): Promise<Document> {
  const text = input.text.trim();

  const [doc] = await db
    .insert(documents)
    .values({
      botId: input.botId,
      title: input.title.trim() || "Untitled",
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl ?? null,
      charCount: text.length,
      status: "processing",
    })
    .returning();

  try {
    const pieces = chunkText(text);
    if (pieces.length === 0) {
      throw new Error("No readable text could be extracted from this source.");
    }

    const vectors = await embed(pieces);
    await db.insert(chunks).values(
      pieces.map((content, i) => ({
        documentId: doc.id,
        botId: input.botId,
        content,
        embedding: vectors[i],
        idx: i,
      })),
    );

    const [ready] = await db
      .update(documents)
      .set({ status: "ready", charCount: text.length })
      .where(eq(documents.id, doc.id))
      .returning();
    return ready;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Ingestion failed unexpectedly.";
    await db
      .update(documents)
      .set({ status: "failed", error: message })
      .where(eq(documents.id, doc.id));
    throw err;
  }
}
