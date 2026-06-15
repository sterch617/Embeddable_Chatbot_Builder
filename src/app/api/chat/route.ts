import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getBotForUser } from "@/lib/bots/queries";
import { getUsage } from "@/lib/usage";
import { getPlan } from "@/lib/plans";
import { answerStream } from "@/lib/chat/answer";
import type { ChatMessage } from "@/lib/ai/chat";

// Authenticated playground chat endpoint (owner-scoped by botId).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const botId = typeof body?.botId === "string" ? body.botId : "";
  if (!message || !botId) return new Response("Bad request", { status: 400 });

  const db = await getDb();
  const bot = await getBotForUser(db, user.id, botId);
  if (!bot) return new Response("Not found", { status: 404 });

  const usage = await getUsage(db, user.id);
  const plan = getPlan(user.plan);
  if (usage.messages >= plan.limits.messagesPerMonth) {
    return Response.json(
      {
        error: `You've reached your ${plan.name} plan limit of ${plan.limits.messagesPerMonth} messages this month.`,
      },
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
    channel: "app",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
