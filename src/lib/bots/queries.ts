import { and, desc, eq, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { bots, users, type Bot } from "../db/schema";

export interface BotListItem {
  id: string;
  name: string;
  publicId: string;
  accentColor: string;
  docCount: number;
}

export async function listBots(db: DB, userId: string): Promise<BotListItem[]> {
  const rows = await db
    .select({
      id: bots.id,
      name: bots.name,
      publicId: bots.publicId,
      accentColor: bots.accentColor,
      docCount: sql<number>`(select count(*) from documents d where d.bot_id = ${bots.id})`,
    })
    .from(bots)
    .where(eq(bots.userId, userId))
    .orderBy(desc(bots.createdAt));

  return rows.map((r) => ({ ...r, docCount: Number(r.docCount) }));
}

export async function getBotForUser(
  db: DB,
  userId: string,
  botId: string,
): Promise<Bot | null> {
  const [bot] = await db
    .select()
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .limit(1);
  return bot ?? null;
}

export async function getBotByPublicId(
  db: DB,
  publicId: string,
): Promise<Bot | null> {
  const [bot] = await db
    .select()
    .from(bots)
    .where(eq(bots.publicId, publicId))
    .limit(1);
  return bot ?? null;
}

/** Public lookup for the widget: bot + its owner's plan (for branding/limits). */
export async function getBotByPublicIdWithOwner(
  db: DB,
  publicId: string,
): Promise<{ bot: Bot; ownerPlan: string } | null> {
  const [row] = await db
    .select({ bot: bots, ownerPlan: users.plan })
    .from(bots)
    .innerJoin(users, eq(users.id, bots.userId))
    .where(eq(bots.publicId, publicId))
    .limit(1);
  return row ? { bot: row.bot, ownerPlan: row.ownerPlan } : null;
}
