"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { KnowledgeTab } from "./knowledge-tab";
import { PlaygroundTab } from "./playground-tab";
import type { DocumentListItem } from "@/lib/knowledge/queries";

export interface BotTabsProps {
  bot: {
    id: string;
    name: string;
    publicId: string;
    welcomeMessage: string;
    accentColor: string;
    systemPrompt: string | null;
  };
  documents: DocumentListItem[];
  canUseCustomColors: boolean;
}

function ComingSoon({ label }: { label: string }) {
  return (
    <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
      {label}
    </Card>
  );
}

export function BotTabs({ bot, documents }: BotTabsProps) {
  return (
    <Tabs defaultValue={documents.length ? "playground" : "knowledge"}>
      <TabsList>
        <TabsTrigger value="playground">Playground</TabsTrigger>
        <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
        <TabsTrigger value="embed">Embed</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="playground" className="mt-6">
        <PlaygroundTab bot={bot} />
      </TabsContent>
      <TabsContent value="knowledge" className="mt-6">
        <KnowledgeTab botId={bot.id} documents={documents} />
      </TabsContent>
      <TabsContent value="embed" className="mt-6">
        <ComingSoon label="Embed snippet — coming up." />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <ComingSoon label="Settings — coming up." />
      </TabsContent>
    </Tabs>
  );
}
