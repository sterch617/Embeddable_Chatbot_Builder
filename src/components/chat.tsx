"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Citation } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  pending?: boolean;
  error?: boolean;
}

export interface ChatProps {
  /** POST endpoint that returns a newline-delimited JSON event stream. */
  endpoint: string;
  /** Extra fields merged into the request body (e.g. { botId }). */
  bodyExtras?: Record<string, unknown>;
  welcomeMessage: string;
  accentColor?: string;
  showBranding?: boolean;
  placeholder?: string;
  className?: string;
}

export function Chat({
  endpoint,
  bodyExtras = {},
  welcomeMessage,
  accentColor = "#4f46e5",
  showBranding = false,
  placeholder = "Ask a question…",
  className,
}: ChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function appendToLast(token: string) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant") {
        next[next.length - 1] = {
          ...last,
          content: last.content + token,
          pending: false,
        };
      }
      return next;
    });
  }

  function patchLast(patch: Partial<Msg>) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant") next[next.length - 1] = { ...last, ...patch };
      return next;
    });
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const history = messages
      .filter((m) => !m.error && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    setInput("");
    setStreaming(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", pending: true },
    ]);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          conversationId: conversationId.current,
          ...bodyExtras,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        patchLast({
          content: data?.error ?? "Sorry, something went wrong.",
          error: true,
          pending: false,
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { type: string; [k: string]: unknown };
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.type === "meta") conversationId.current = evt.conversationId as string;
          else if (evt.type === "token") appendToLast(evt.v as string);
          else if (evt.type === "citations") patchLast({ citations: evt.items as Citation[] });
          else if (evt.type === "error")
            patchLast({ content: evt.message as string, error: true, pending: false });
          else if (evt.type === "done") patchLast({ pending: false });
        }
      }
    } catch {
      patchLast({
        content: "Sorry, the connection dropped. Please try again.",
        error: true,
        pending: false,
      });
    } finally {
      setStreaming(false);
      patchLast({ pending: false });
    }
  }

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        <Bubble role="assistant" accentColor={accentColor}>
          {welcomeMessage}
        </Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} accentColor={accentColor} error={m.error}>
            {m.role === "assistant" ? (
              m.pending && !m.content ? (
                <TypingDots />
              ) : (
                <>
                  <div className="text-sm leading-relaxed [&_a]:underline [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5">
                    <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                  </div>
                  {m.citations && m.citations.length > 0 && (
                    <Citations items={m.citations} />
                  )}
                </>
              )
            ) : (
              m.content
            )}
          </Bubble>
        ))}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="h-9 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Send"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
        >
          <Send className="size-4" />
        </button>
      </form>

      {showBranding && (
        <div className="border-t py-1.5 text-center text-[11px] text-muted-foreground">
          Powered by Docent
        </div>
      )}
    </div>
  );
}

function Bubble({
  role,
  accentColor,
  error,
  children,
}: {
  role: "user" | "assistant";
  accentColor: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white"
          style={{ backgroundColor: accentColor }}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-foreground",
          error && "bg-destructive/10 text-destructive",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-foreground/40"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

function Citations({ items }: { items: Citation[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 border-t pt-2">
      {items.map((c) => (
        <span
          key={c.documentId}
          title={c.snippet}
          className="inline-flex max-w-[200px] items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border"
        >
          <FileText className="size-3 shrink-0" />
          <span className="truncate">{c.title}</span>
        </span>
      ))}
    </div>
  );
}
