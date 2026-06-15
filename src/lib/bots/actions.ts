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

export type BotActionState = { error: string } | null;

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
