// Shared domain types used across the app, the API and the widget.

export type PlanId = "free" | "pro" | "business";

export type DocSourceType = "file" | "text" | "url";
export type DocStatus = "processing" | "ready" | "failed";

export type ChatRole = "user" | "assistant";
export type ConversationChannel = "app" | "widget";

/** A grounded source attached to an assistant answer. */
export interface Citation {
  documentId: string;
  title: string;
  snippet: string;
}

/** Public, safe-to-expose subset of a bot (used by the widget + chat UI). */
export interface PublicBot {
  publicId: string;
  name: string;
  welcomeMessage: string;
  accentColor: string;
  showBranding: boolean;
}
