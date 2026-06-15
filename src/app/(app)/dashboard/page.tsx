import Link from "next/link";
import { FileText, MessagesSquare } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listBots } from "@/lib/bots/queries";
import { getUsage } from "@/lib/usage";
import { getPlan } from "@/lib/plans";
import { CreateBotDialog } from "@/components/create-bot-dialog";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Chatbots" };

export default async function DashboardPage() {
  const user = await requireUser();
  const db = await getDb();
  const [bots, usage] = await Promise.all([
    listBots(db, user.id),
    getUsage(db, user.id),
  ]);
  const plan = getPlan(user.plan);
  const atLimit = usage.bots >= plan.limits.bots;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chatbots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {usage.bots} of {plan.limits.bots} used on the {plan.name} plan
          </p>
        </div>
        <CreateBotDialog disabled={atLimit} />
      </div>

      {bots.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center justify-center gap-3 border-dashed py-16 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessagesSquare className="size-6" />
          </div>
          <div>
            <p className="font-medium">No chatbots yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first chatbot and feed it your help docs.
            </p>
          </div>
          <CreateBotDialog disabled={atLimit} />
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Link key={bot.id} href={`/bots/${bot.id}`}>
              <Card className="h-full p-5 transition-colors hover:border-primary/40 hover:bg-accent/40">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-9 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: bot.accentColor }}
                  >
                    <MessagesSquare className="size-5" />
                  </span>
                  <span className="font-medium">{bot.name}</span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FileText className="size-4" />
                  {bot.docCount} source{bot.docCount === 1 ? "" : "s"}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
