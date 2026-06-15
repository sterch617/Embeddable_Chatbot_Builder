"use client";

import { Chat } from "@/components/chat";
import { Card } from "@/components/ui/card";

export function PlaygroundTab({
  bot,
}: {
  bot: { id: string; name: string; welcomeMessage: string; accentColor: string };
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="h-[600px] overflow-hidden p-0">
        <Chat
          endpoint="/api/chat"
          bodyExtras={{ botId: bot.id }}
          welcomeMessage={bot.welcomeMessage}
          accentColor={bot.accentColor}
          placeholder={`Ask ${bot.name} a question…`}
        />
      </Card>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        This is exactly what your customers see in the embedded widget.
      </p>
    </div>
  );
}
