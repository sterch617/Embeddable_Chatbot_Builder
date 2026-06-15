// Usage counters for plan gating: chatbots, pages of knowledge, and messages
// answered this calendar month. Computed on the fly from existing tables.

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import type { DB } from "./db/client";
import { bots, documents, conversations, messages } from "./db/schema";
import { PAGE_CHARS } from "./constants";

export interface Usage {
  bots: number;
  pages: number;
  messages: number;
}

export async function getUsage(db: DB, userId: string): Promise<Usage> {
  const botRows = await db
    .select({ id: bots.id })
    .from(bots)
    .where(eq(bots.userId, userId));
  const botIds = botRows.map((b) => b.id);
  if (botIds.length === 0) return { bots: 0, pages: 0, messages: 0 };

  const [pageRow] = await db
    .select({ chars: sql<number>`coalesce(sum(${documents.charCount}), 0)` })
    .from(documents)
    .where(inArray(documents.botId, botIds));

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [msgRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        inArray(conversations.botId, botIds),
        eq(messages.role, "user"),
        gte(messages.createdAt, monthStart),
      ),
    );

  return {
    bots: botIds.length,
    pages: Math.ceil(Number(pageRow?.chars ?? 0) / PAGE_CHARS),
    messages: Number(msgRow?.count ?? 0),
  };
}
