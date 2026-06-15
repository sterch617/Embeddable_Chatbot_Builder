import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessagesSquare } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getBotForUser } from "@/lib/bots/queries";
import { listDocuments } from "@/lib/knowledge/queries";
import { deleteBotAction } from "@/lib/bots/actions";
import { getPlan } from "@/lib/plans";
import { BotTabs } from "@/components/bot/bot-tabs";
import { Button } from "@/components/ui/button";

export default async function BotPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const user = await requireUser();
  const db = await getDb();
  const bot = await getBotForUser(db, user.id, botId);
  if (!bot) notFound();

  const documents = await listDocuments(db, bot.id);
  const plan = getPlan(user.plan);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Chatbots
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-lg text-white"
            style={{ backgroundColor: bot.accentColor }}
          >
            <MessagesSquare className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{bot.name}</h1>
        </div>
        <form action={deleteBotAction.bind(null, bot.id)}>
          <Button variant="outline" size="sm" type="submit">
            Delete
          </Button>
        </form>
      </div>

      <BotTabs
        bot={{
          id: bot.id,
          name: bot.name,
          publicId: bot.publicId,
          welcomeMessage: bot.welcomeMessage,
          accentColor: bot.accentColor,
          systemPrompt: bot.systemPrompt,
        }}
        documents={documents}
        canUseCustomColors={plan.customColors}
      />
    </div>
  );
}
