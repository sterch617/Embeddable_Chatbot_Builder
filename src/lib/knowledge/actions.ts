"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import { getDb } from "../db/client";
import type { DB } from "../db/client";
import { bots, documents, type Bot, type User } from "../db/schema";
import { ingestDocument } from "../ingestion/ingest";
import { parsePdf, parsePlainText, parseUrl } from "../ingestion/parse";
import { getUsage } from "../usage";
import { getPlan, charsToPages } from "../plans";

export type SourceState = { error: string } | { ok: true } | null;

async function ownedBot(
  userId: string,
  botId: string,
): Promise<{ db: DB; bot: Bot }> {
  const db = await getDb();
  const [bot] = await db
    .select()
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .limit(1);
  if (!bot) throw new Error("Chatbot not found");
  return { db, bot };
}

async function pageLimitError(
  db: DB,
  user: User,
  addedChars: number,
): Promise<string | null> {
  const usage = await getUsage(db, user.id);
  const plan = getPlan(user.plan);
  const projected = usage.pages + charsToPages(addedChars);
  if (projected > plan.limits.pages) {
    return `This would exceed your ${plan.name} plan limit of ${plan.limits.pages} pages. Upgrade for more room.`;
  }
  return null;
}

const textSchema = z.object({
  botId: z.string().min(1),
  title: z.string().trim().min(1, "Add a title").max(120),
  text: z.string().trim().min(1, "Paste some content"),
});

export async function addTextSourceAction(
  _prev: SourceState,
  formData: FormData,
): Promise<SourceState> {
  const user = await requireUser();
  const parsed = textSchema.safeParse({
    botId: formData.get("botId"),
    title: formData.get("title"),
    text: formData.get("text"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { db, bot } = await ownedBot(user.id, parsed.data.botId);
  const limit = await pageLimitError(db, user, parsed.data.text.length);
  if (limit) return { error: limit };

  await ingestDocument(db, {
    botId: bot.id,
    title: parsed.data.title,
    sourceType: "text",
    text: parsed.data.text,
  });
  revalidatePath(`/bots/${bot.id}`);
  return { ok: true };
}

const urlSchema = z.object({
  botId: z.string().min(1),
  url: z.url("Enter a valid URL (including https://)"),
});

export async function addUrlSourceAction(
  _prev: SourceState,
  formData: FormData,
): Promise<SourceState> {
  const user = await requireUser();
  const parsed = urlSchema.safeParse({
    botId: formData.get("botId"),
    url: formData.get("url"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid URL" };

  const { db, bot } = await ownedBot(user.id, parsed.data.botId);
  let source;
  try {
    source = await parseUrl(parsed.data.url);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not fetch that URL" };
  }
  const limit = await pageLimitError(db, user, source.text.length);
  if (limit) return { error: limit };

  try {
    await ingestDocument(db, {
      botId: bot.id,
      title: source.title,
      sourceType: "url",
      sourceUrl: parsed.data.url,
      text: source.text,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ingestion failed" };
  }
  revalidatePath(`/bots/${bot.id}`);
  return { ok: true };
}

export async function addFileSourceAction(
  _prev: SourceState,
  formData: FormData,
): Promise<SourceState> {
  const user = await requireUser();
  const botId = String(formData.get("botId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF, TXT or Markdown file" };
  }

  const { db, bot } = await ownedBot(user.id, botId);
  const name = file.name.toLowerCase();
  let source;
  try {
    if (name.endsWith(".pdf")) {
      source = await parsePdf(await file.arrayBuffer(), file.name);
    } else if (/\.(txt|md|markdown)$/.test(name)) {
      source = parsePlainText(await file.text(), file.name);
    } else {
      return { error: "Unsupported file type. Upload a PDF, TXT or Markdown file." };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not read that file" };
  }

  const limit = await pageLimitError(db, user, source.text.length);
  if (limit) return { error: limit };

  try {
    await ingestDocument(db, {
      botId: bot.id,
      title: source.title,
      sourceType: "file",
      text: source.text,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ingestion failed" };
  }
  revalidatePath(`/bots/${bot.id}`);
  return { ok: true };
}

export async function deleteDocumentAction(documentId: string): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const [row] = await db
    .select({ botId: documents.botId, ownerId: bots.userId })
    .from(documents)
    .innerJoin(bots, eq(bots.id, documents.botId))
    .where(eq(documents.id, documentId))
    .limit(1);
  if (!row || row.ownerId !== user.id) return;

  await db.delete(documents).where(eq(documents.id, documentId));
  revalidatePath(`/bots/${row.botId}`);
}
