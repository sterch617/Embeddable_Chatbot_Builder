"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import { getDb } from "../db/client";
import { bots } from "../db/schema";
import { getUsage } from "../usage";
import { getPlan } from "../plans";

export type BotActionState = { error: string } | { ok: true } | null;

const nameSchema = z.string().trim().min(1, "Enter a name").max(60);

export async function createBotAction(
  _prev: BotActionState,
  formData: FormData,
): Promise<BotActionState> {
  const user = await requireUser();
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  const db = await getDb();
  const usage = await getUsage(db, user.id);
  const plan = getPlan(user.plan);
  if (usage.bots >= plan.limits.bots) {
    return {
      error: `Your ${plan.name} plan includes ${plan.limits.bots} chatbot${plan.limits.bots > 1 ? "s" : ""}. Upgrade to add more.`,
    };
  }

  const [bot] = await db
    .insert(bots)
    .values({ userId: user.id, name: parsed.data })
    .returning();
  redirect(`/bots/${bot.id}`);
}

export async function deleteBotAction(botId: string): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  await db.delete(bots).where(and(eq(bots.id, botId), eq(bots.userId, user.id)));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const settingsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  welcomeMessage: z.string().trim().min(1, "Add a welcome message").max(200),
  accentColor: z.string().regex(HEX_COLOR).optional(),
  systemPrompt: z.string().trim().max(2000).optional(),
});

export async function updateBotAction(
  botId: string,
  _prev: BotActionState,
  formData: FormData,
): Promise<BotActionState> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    welcomeMessage: formData.get("welcomeMessage"),
    accentColor: formData.get("accentColor") || undefined,
    systemPrompt: formData.get("systemPrompt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const db = await getDb();
  const [bot] = await db
    .select()
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, user.id)))
    .limit(1);
  if (!bot) return { error: "Chatbot not found" };

  const plan = getPlan(user.plan);
  const update: Partial<typeof bots.$inferInsert> = {
    name: parsed.data.name,
    welcomeMessage: parsed.data.welcomeMessage,
    systemPrompt: parsed.data.systemPrompt ?? null,
  };
  // Custom colors are a paid feature — ignore the field on plans without it.
  if (plan.customColors && parsed.data.accentColor) {
    update.accentColor = parsed.data.accentColor;
  }

  await db.update(bots).set(update).where(eq(bots.id, botId));
  revalidatePath(`/bots/${botId}`);
  return { ok: true };
}
