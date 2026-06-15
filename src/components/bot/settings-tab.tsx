"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { updateBotAction } from "@/lib/bots/actions";

interface SettingsTabProps {
  bot: {
    id: string;
    name: string;
    welcomeMessage: string;
    accentColor: string;
    systemPrompt: string | null;
  };
  canUseCustomColors: boolean;
}

export function SettingsTab({ bot, canUseCustomColors }: SettingsTabProps) {
  const [state, action, pending] = useActionState(
    updateBotAction.bind(null, bot.id),
    null,
  );

  useEffect(() => {
    if (state && "ok" in state) toast.success("Settings saved");
  }, [state]);

  const error = state && "error" in state ? state.error : undefined;

  return (
    <Card className="max-w-2xl p-6">
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="s-name">Name</Label>
          <Input id="s-name" name="name" defaultValue={bot.name} maxLength={60} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="s-welcome">Welcome message</Label>
          <Input
            id="s-welcome"
            name="welcomeMessage"
            defaultValue={bot.welcomeMessage}
            maxLength={200}
            required
          />
          <p className="text-xs text-muted-foreground">
            The first thing visitors see when they open the chat.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="s-prompt">
            Custom instructions{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="s-prompt"
            name="systemPrompt"
            defaultValue={bot.systemPrompt ?? ""}
            rows={4}
            maxLength={2000}
            placeholder="e.g. Answer in a friendly, concise tone. If you're unsure, suggest emailing support@acme.com."
          />
          <p className="text-xs text-muted-foreground">
            Guides tone and behaviour. Used once a model API key is configured.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="s-color">Accent color</Label>
          <div className="flex items-center gap-3">
            <input
              id="s-color"
              name="accentColor"
              type="color"
              defaultValue={bot.accentColor}
              disabled={!canUseCustomColors}
              className="h-9 w-14 cursor-pointer rounded-md border bg-background disabled:cursor-not-allowed disabled:opacity-50"
            />
            {!canUseCustomColors && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" /> Custom colors are a{" "}
                <Link href="/billing" className="underline underline-offset-2">
                  Pro feature
                </Link>
                .
              </span>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
