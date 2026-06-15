import { desc, eq, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { documents } from "../db/schema";
import type { DocSourceType, DocStatus } from "../types";

export interface DocumentListItem {
  id: string;
  title: string;
  sourceType: DocSourceType;
  sourceUrl: string | null;
  status: DocStatus;
  error: string | null;
  charCount: number;
  createdAt: Date;
  chunkCount: number;
}

export async function listDocuments(
  db: DB,
  botId: string,
): Promise<DocumentListItem[]> {
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      sourceType: documents.sourceType,
      sourceUrl: documents.sourceUrl,
      status: documents.status,
      error: documents.error,
      charCount: documents.charCount,
      createdAt: documents.createdAt,
      chunkCount: sql<number>`(select count(*) from chunks c where c.document_id = ${documents.id})`,
    })
    .from(documents)
    .where(eq(documents.botId, botId))
    .orderBy(desc(documents.createdAt));

  return rows.map((r) => ({
    ...r,
    sourceType: r.sourceType as DocSourceType,
    status: r.status as DocStatus,
    chunkCount: Number(r.chunkCount),
  }));
}
