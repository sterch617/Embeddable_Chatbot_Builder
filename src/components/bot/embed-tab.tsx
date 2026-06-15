"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmbedTab({
  appUrl,
  publicId,
  accentColor,
}: {
  appUrl: string;
  publicId: string;
  accentColor: string;
}) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${appUrl}/embed.js" data-docent="${publicId}" data-color="${accentColor}" async></script>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Snippet copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — select the snippet and copy manually.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Add the widget to your site</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Paste this snippet before the closing{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              &lt;/body&gt;
            </code>{" "}
            tag on any page. A chat bubble appears in the corner.
          </p>
        </div>

        <Card className="relative overflow-hidden p-0">
          <pre className="overflow-x-auto bg-muted p-4 pr-12 text-xs leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={copy}
            aria-label="Copy snippet"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </Card>

        <a
          href={`${appUrl}/widget/${publicId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Open the widget in a new tab <ExternalLink className="size-3.5" />
        </a>

        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>Works on any website — no framework required.</li>
          <li>Answers only from this chatbot&apos;s knowledge.</li>
          <li>Loads lazily, so it never slows down your page.</li>
        </ul>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Live preview</p>
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <iframe
            src={`${appUrl}/widget/${publicId}`}
            title="Widget preview"
            className="h-[520px] w-full"
          />
        </div>
      </div>
    </div>
  );
}
