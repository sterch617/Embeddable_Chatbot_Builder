# Embeddable Chatbot Builder — agent notes

Stack: Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM · Postgres + pgvector (PGlite in dev, real Postgres in prod via `DATABASE_URL`).

Next.js 15 reminders:
- `params` / `searchParams` are async (`await` them).
- `cookies()` / `headers()` from `next/headers` are async (`await` them). Cookies can only be set in Route Handlers or Server Actions.
- Auth: opaque session token in DB + httpOnly cookie. Forms use Server Actions.
- All product-facing copy, code comments, and commit messages are in English.
