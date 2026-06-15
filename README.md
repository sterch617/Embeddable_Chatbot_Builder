# Docent — Embeddable Chatbot Builder

Turn your help docs into a support agent that answers customers in seconds —
inside your app and as a one-line embeddable widget on your website.

Upload your knowledge (PDF, Markdown, text, or a URL), and Docent turns it into a
chatbot that answers questions **grounded in your content, with the source
cited**. Drop a single `<script>` tag on any site to get a polished chat bubble.

> Built as a focused, launch-ready MVP. It runs **with zero configuration** — no
> Docker, no database server, and no AI API keys required.

---

## Highlights

- **ChatGPT-style playground** — chat with your bot, streamed answers, source citations.
- **Embeddable widget** — one `<script>` tag → floating chat bubble on any website.
- **Real semantic search, no API key** — embeddings run locally (all-MiniLM-L6-v2 via transformers.js), so retrieval is genuinely semantic out of the box.
- **Grounded answers** — replies come only from your docs; off-topic questions are declined instead of hallucinated.
- **Pricing & billing** — Free / Pro / Business plans with real, server-side gating (chatbots, pages, monthly messages, branding, custom colors) and a mock checkout flow.
- **Multi-source ingestion** — paste text, fetch a URL, or upload PDF / Markdown / TXT.
- **Polished, accessible UI** — Tailwind v4 + shadcn/ui (Base UI).

## Tech stack

| Layer        | Choice |
|--------------|--------|
| Framework    | Next.js 15 (App Router, Server Actions, route handlers) |
| Language     | TypeScript |
| UI           | Tailwind CSS v4 · shadcn/ui (Base UI) |
| Database     | Postgres — **PGlite** in dev (in-process, zero-config), real Postgres in prod |
| ORM          | Drizzle ORM + drizzle-kit migrations |
| Embeddings   | `@huggingface/transformers` (local MiniLM, 384-dim) |
| Auth         | Email/password, bcrypt, opaque DB session tokens in an httpOnly cookie |

## Quick start

```bash
npm install
npm run seed     # optional: creates a demo workspace with a ready chatbot
npm run dev      # http://localhost:3000
```

That's it. No `.env` needed — defaults work. The first chat downloads the
embedding model (~25 MB) once and caches it.

**Demo account** (after `npm run seed`):

```
Email:    demo@docent.app
Password: demodemo123
```

The seed also creates a public widget at `/widget/demo`. Set
`NEXT_PUBLIC_DEMO_BOT=demo` in `.env` to show it live on the landing page.

## Using a real LLM (optional)

Embeddings and retrieval are always real. By default, answers are composed
**extractively** from the retrieved passages (a grounded "preview" mode) so the
app works with no keys. To switch answer generation to a real model, set a key:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...   # or
OPENAI_API_KEY=sk-...
```

The provider abstraction lives in [`src/lib/ai/chat.ts`](src/lib/ai/chat.ts).

## How it works

1. **Ingest** — a source is parsed to text, split into overlapping chunks, and
   each chunk is embedded locally and stored.
   ([`src/lib/ingestion`](src/lib/ingestion))
2. **Retrieve** — a question is embedded; the most similar chunks are found by
   cosine similarity. ([`src/lib/retrieval.ts`](src/lib/retrieval.ts))
3. **Answer** — relevant chunks become the context for a streamed, cited answer,
   and the turn is persisted. ([`src/lib/chat/answer.ts`](src/lib/chat/answer.ts))

> **On pgvector:** the suggested stack uses pgvector, but PGlite's pgvector
> packaging is in flux, so embeddings are stored as `jsonb` and scored in JS.
> This keeps dev and prod identical with zero extensions and is plenty fast at
> MVP scale. The retrieval call is the single place to swap in pgvector for ANN.

## Project structure

```
src/
  app/
    (auth)/            login + signup
    (app)/             dashboard, bot workspace, billing  (auth-guarded)
    widget/[publicId]/ standalone embeddable chat page
    api/chat           authed playground chat (streaming)
    api/widget/.../chat public widget chat (streaming)
    page.tsx           marketing landing page
  components/          UI: chat, bot tabs, billing, marketing, shadcn/ui
  lib/
    ai/                local embeddings + chat provider
    auth/              password, sessions, server actions
    bots/ knowledge/   queries + server actions
    chat/              shared RAG answer flow
    db/                Drizzle schema + client (PGlite/Postgres switch)
    ingestion/         parse + chunk + ingest
    plans.ts usage.ts  pricing config + gating counters
public/embed.js        the embeddable widget loader
```

## Production / deployment

The app runs as a standard Node server and self-hosts on a single VPS:

```bash
npm run build
npm run start          # serves on $PORT (default 3000), behind a reverse proxy
```

- Dev uses a file-backed PGlite database (`.pglite/`). For production set
  `DATABASE_URL` to a Postgres instance and the app uses it automatically.
- Put it behind nginx or Caddy for HTTPS, and set `NEXT_PUBLIC_APP_URL` to your
  public URL so the embed snippet points at the right host.

See [`.env.example`](.env.example) for all options.

---

*A demo product. Billing is a mock — no real payments are processed.*
