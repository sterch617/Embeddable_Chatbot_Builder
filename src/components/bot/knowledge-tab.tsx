"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  FileText,
  Globe,
  Type,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  addTextSourceAction,
  addUrlSourceAction,
  addFileSourceAction,
  deleteDocumentAction,
  type SourceState,
} from "@/lib/knowledge/actions";
import type { DocumentListItem } from "@/lib/knowledge/queries";

function useSourceFeedback(state: SourceState, formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state && "ok" in state) {
      toast.success("Source added to your chatbot");
      formRef.current?.reset();
    }
  }, [state, formRef]);
}

function errorOf(state: SourceState): string | undefined {
  return state && "error" in state ? state.error : undefined;
}

function SubmitRow({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Processing…" : label}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

function AddText({ botId }: { botId: string }) {
  const [state, action, pending] = useActionState(addTextSourceAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useSourceFeedback(state, ref);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="botId" value={botId} />
      <div className="space-y-1.5">
        <Label htmlFor="t-title">Title</Label>
        <Input id="t-title" name="title" placeholder="Shipping & returns policy" maxLength={120} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-text">Content</Label>
        <Textarea id="t-text" name="text" rows={7} required placeholder="Paste an FAQ, a policy, or any knowledge your customers ask about…" />
      </div>
      <FieldError message={errorOf(state)} />
      <SubmitRow pending={pending} label="Add text" />
    </form>
  );
}

function AddUrl({ botId }: { botId: string }) {
  const [state, action, pending] = useActionState(addUrlSourceAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useSourceFeedback(state, ref);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="botId" value={botId} />
      <div className="space-y-1.5">
        <Label htmlFor="u-url">Page URL</Label>
        <Input id="u-url" name="url" type="url" placeholder="https://help.acme.com/getting-started" required />
        <p className="text-xs text-muted-foreground">We&apos;ll fetch the page and extract its text.</p>
      </div>
      <FieldError message={errorOf(state)} />
      <SubmitRow pending={pending} label="Fetch & add" />
    </form>
  );
}

function AddFile({ botId }: { botId: string }) {
  const [state, action, pending] = useActionState(addFileSourceAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useSourceFeedback(state, ref);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="botId" value={botId} />
      <div className="space-y-1.5">
        <Label htmlFor="f-file">File</Label>
        <Input id="f-file" name="file" type="file" accept=".pdf,.txt,.md,.markdown" required />
        <p className="text-xs text-muted-foreground">PDF, TXT or Markdown, up to 12&nbsp;MB.</p>
      </div>
      <FieldError message={errorOf(state)} />
      <SubmitRow pending={pending} label="Upload & add" />
    </form>
  );
}

const STATUS_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  processing: "secondary",
  ready: "default",
  failed: "destructive",
};

function DocRow({ doc }: { doc: DocumentListItem }) {
  const Icon = doc.sourceType === "url" ? Globe : doc.sourceType === "file" ? FileText : Type;
  return (
    <div className="flex items-center gap-3 p-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{doc.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {doc.chunkCount} chunk{doc.chunkCount === 1 ? "" : "s"}
          {doc.status === "failed" && doc.error ? ` · ${doc.error}` : ""}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[doc.status] ?? "secondary"} className="capitalize">
        {doc.status}
      </Badge>
      <form action={deleteDocumentAction.bind(null, doc.id)}>
        <Button variant="ghost" size="icon-sm" type="submit" aria-label="Delete source">
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function KnowledgeTab({
  botId,
  documents,
}: {
  botId: string;
  documents: DocumentListItem[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="h-fit p-4 lg:col-span-2">
        <h3 className="font-medium">Add knowledge</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Feed your chatbot the docs your customers ask about.
        </p>
        <Tabs defaultValue="text" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <Type className="size-4" /> Text
            </TabsTrigger>
            <TabsTrigger value="url">
              <Globe className="size-4" /> URL
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload className="size-4" /> File
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-4">
            <AddText botId={botId} />
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <AddUrl botId={botId} />
          </TabsContent>
          <TabsContent value="file" className="mt-4">
            <AddFile botId={botId} />
          </TabsContent>
        </Tabs>
      </Card>

      <div className="space-y-3 lg:col-span-3">
        <h3 className="font-medium">Sources ({documents.length})</h3>
        {documents.length === 0 ? (
          <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
            No sources yet. Add text, a URL, or upload a file to get started.
          </Card>
        ) : (
          <Card className="divide-y p-0">
            {documents.map((doc) => (
              <DocRow key={doc.id} doc={doc} />
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
