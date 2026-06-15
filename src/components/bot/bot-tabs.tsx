"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KnowledgeTab } from "./knowledge-tab";
import { PlaygroundTab } from "./playground-tab";
import { EmbedTab } from "./embed-tab";
import { SettingsTab } from "./settings-tab";
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
  appUrl: string;
  canUseCustomColors: boolean;
}

export function BotTabs({
  bot,
  documents,
  appUrl,
  canUseCustomColors,
}: BotTabsProps) {
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
        <EmbedTab appUrl={appUrl} publicId={bot.publicId} accentColor={bot.accentColor} />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <SettingsTab bot={bot} canUseCustomColors={canUseCustomColors} />
      </TabsContent>
    </Tabs>
  );
}
