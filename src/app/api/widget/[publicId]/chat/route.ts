import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { getBotByPublicIdWithOwner } from "@/lib/bots/queries";
import { getUsage } from "@/lib/usage";
import { getPlan } from "@/lib/plans";
import { answerStream } from "@/lib/chat/answer";
import type { ChatMessage } from "@/lib/ai/chat";

// Public widget chat endpoint, scoped by the bot's publicId. Usage is metered
// against the bot owner's plan.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await ctx.params;

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return new Response("Bad request", { status: 400 });

  const db = await getDb();
  const found = await getBotByPublicIdWithOwner(db, publicId);
  if (!found) return new Response("Not found", { status: 404 });
  const { bot, ownerPlan } = found;

  const usage = await getUsage(db, bot.userId);
  const plan = getPlan(ownerPlan);
  if (usage.messages >= plan.limits.messagesPerMonth) {
    return Response.json(
      { error: "This assistant has hit its monthly message limit. Please try again later." },
      { status: 429 },
    );
  }

  const history: ChatMessage[] = Array.isArray(body?.history)
    ? body.history
        .filter(
          (m: unknown): m is ChatMessage =>
            !!m &&
            typeof (m as ChatMessage).content === "string" &&
            ((m as ChatMessage).role === "user" ||
              (m as ChatMessage).role === "assistant"),
        )
        .slice(-8)
    : [];
  const conversationId =
    typeof body?.conversationId === "string" ? body.conversationId : null;

  const stream = await answerStream({
    db,
    bot,
    question: message,
    history,
    conversationId,
    channel: "widget",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
