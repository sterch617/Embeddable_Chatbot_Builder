// Database schema (Drizzle ORM). Postgres dialect — runs on PGlite in dev and
// on real Postgres in prod. The `vector` column requires the pgvector extension
// (enabled by the db client on startup).

import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import type { Citation } from "../types";

const uuid = () => crypto.randomUUID();

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(uuid),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  // The session token itself (opaque, random) — stored as the primary key.
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bots = pgTable("bots", {
  id: text("id").primaryKey().$defaultFn(uuid),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Unguessable public id used in the embeddable widget URL.
  publicId: text("public_id").notNull().unique().$defaultFn(uuid),
  systemPrompt: text("system_prompt"),
  welcomeMessage: text("welcome_message")
    .notNull()
    .default("Hi! How can I help you today?"),
  accentColor: text("accent_color").notNull().default("#4f46e5"),
  status: text("status").notNull().default("ready"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey().$defaultFn(uuid),
  botId: text("bot_id")
    .notNull()
    .references(() => bots.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull(), // file | text | url
  sourceUrl: text("source_url"),
  charCount: integer("char_count").notNull().default(0),
  status: text("status").notNull().default("processing"), // processing | ready | failed
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chunks = pgTable(
  "chunks",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    // Denormalized for fast per-bot vector filtering.
    botId: text("bot_id")
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    // Embedding stored as a float array. Cosine similarity is computed in JS at
    // query time (see lib/retrieval) — identical on PGlite and Postgres, no
    // extension required. Swap to pgvector here if you need ANN at large scale.
    embedding: jsonb("embedding").$type<number[]>().notNull(),
    idx: integer("idx").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("chunks_bot_id_idx").on(t.botId)],
);

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(uuid),
  botId: text("bot_id")
    .notNull()
    .references(() => bots.id, { onDelete: "cascade" }),
  channel: text("channel").notNull().default("app"), // app | widget
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(uuid),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  citations: jsonb("citations").$type<Citation[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Chunk = typeof chunks.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
