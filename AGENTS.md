# Embeddable Chatbot Builder — agent notes

Stack: Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM · Postgres + pgvector (PGlite in dev, real Postgres in prod via `DATABASE_URL`).

Next.js 15 reminders:
- `params` / `searchParams` are async (`await` them).
- `cookies()` / `headers()` from `next/headers` are async (`await` them). Cookies can only be set in Route Handlers or Server Actions.
- Auth: opaque session token in DB + httpOnly cookie. Forms use Server Actions.
- All product-facing copy, code comments, and commit messages are in English.

UI: shadcn here is built on **Base UI** (`@base-ui/react`), not Radix. Use the `render`
prop for polymorphism — `<DialogTrigger render={<Button/>}>...`, `<Button render={<Link/>}>...` —
NOT `asChild` (it is silently ignored and produces nested buttons).
