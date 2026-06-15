import { notFound } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { getBotByPublicIdWithOwner } from "@/lib/bots/queries";
import { getPlan } from "@/lib/plans";
import { Chat } from "@/components/chat";

export const metadata = {
  robots: { index: false, follow: false },
};

// Standalone page rendered inside the embeddable iframe. Public, scoped by
// the bot's unguessable publicId.
export default async function WidgetPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const db = await getDb();
  const found = await getBotByPublicIdWithOwner(db, publicId);
  if (!found) notFound();

  const { bot, ownerPlan } = found;
  const showBranding = !getPlan(ownerPlan).removeBranding;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header
        className="flex items-center gap-2 px-4 py-3 text-white"
        style={{ backgroundColor: bot.accentColor }}
      >
        <MessagesSquare className="size-5" />
        <span className="font-medium">{bot.name}</span>
      </header>
      <div className="min-h-0 flex-1">
        <Chat
          endpoint={`/api/widget/${bot.publicId}/chat`}
          welcomeMessage={bot.welcomeMessage}
          accentColor={bot.accentColor}
          showBranding={showBranding}
        />
      </div>
    </div>
  );
}
