"use server";

// Mock billing. Switching plans takes effect immediately with no payment.
// Architected so swapping in Stripe Checkout later is a small change here.

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "../auth/session";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { PLAN_ORDER } from "../plans";
import type { PlanId } from "../types";

export async function changePlanAction(planId: PlanId): Promise<void> {
  const user = await requireUser();
  if (!PLAN_ORDER.includes(planId)) return;

  const db = await getDb();
  await db.update(users).set({ plan: planId }).where(eq(users.id, user.id));
  redirect("/billing");
}
