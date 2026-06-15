import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getBotForUser } from "@/lib/bots/queries";
import { deleteBotAction } from "@/lib/bots/actions";
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{bot.name}</h1>
        <form action={deleteBotAction.bind(null, bot.id)}>
          <Button variant="outline" size="sm" type="submit">
            Delete
          </Button>
        </form>
      </div>
      <p className="mt-2 text-muted-foreground">
        Knowledge, chat playground, embed snippet and settings land in the next
        step.
      </p>
    </div>
  );
}
