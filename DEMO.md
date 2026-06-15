# Docent — Demo Walkthrough

A guided tour of the product. It doubles as a script for a ~90-second demo
video. Screenshots are marked `📸` — capture them as you follow along.

**Setup**

```bash
npm install
npm run seed        # demo workspace + a ready "Acme Support" bot
npm run dev         # http://localhost:3000
```

Demo login: `demo@docent.app` / `demodemo123`

---

## 1. Landing page  📸

Open `http://localhost:3000`.

- Clear value prop: *"Your docs, answering customers in seconds."*
- A **live demo chatbot** is embedded right on the page — ask it
  *"What's your return policy?"* and watch it answer from the sample help
  center, with the **source cited**.
- Scroll through features, the 3-step "how it works", pricing, and FAQ.

## 2. Sign up  📸

Click **Start free** → create an account (any email + an 8+ char password).
You land in the dashboard. (Or sign in with the demo account above to skip ahead
to a pre-built bot.)

## 3. Create a chatbot  📸

Click **New chatbot**, name it (e.g. *"Acme Support"*), and you're taken to the
bot workspace with four tabs: **Playground · Knowledge · Embed · Settings**.

## 4. Add knowledge  📸

On the **Knowledge** tab, add a source three ways:

- **Text** — paste an FAQ or policy.
- **URL** — fetch a public help-center page.
- **File** — upload a PDF, Markdown, or TXT.

Each source is parsed, chunked, embedded, and shown with a **ready** badge and a
chunk count.

## 5. Chat in the playground  📸 (the key moment)

Open the **Playground** tab and ask a real question, e.g.
*"How do I reset my password?"*

- The answer **streams in**, ChatGPT-style.
- It's **grounded** in your uploaded docs and shows a **citation chip** for the
  source it used.
- Ask something off-topic (*"What's the capital of France?"*) — it **declines
  gracefully** instead of making something up. This is what separates it from
  generic "AI slop".

## 6. Customize  📸

On **Settings**, change the welcome message, add custom instructions (tone), and
pick an accent color (a Pro feature — gated on the Free plan). Save.

## 7. Embed on a website  📸

Open the **Embed** tab:

- Copy the one-line `<script>` snippet.
- A **live preview** of the widget is shown right there.
- Paste the snippet into any HTML page before `</body>` → a floating chat bubble
  appears in the corner. Click it to chat — scoped only to this bot's knowledge.

## 8. Pricing & billing  📸

Go to **Plan & usage** (top nav):

- See usage meters (chatbots, pages, messages) against your plan's limits.
- Click **Upgrade to Pro** → a **mock checkout** confirms (no real charge) → your
  plan and limits update instantly. Gated features (custom colors, badge removal)
  unlock.

---

## Recording the demo video (~90s)

Record against the **live deployment** — http://134.122.59.176 — so it's clearly a
running product (or use `npm run dev` locally). Tool: **Loom** (gives a shareable
link, perfect to attach to the application) or QuickTime / OBS. Record the browser
at ~1280×720. Voiceover in **English**; the same lines double as on-screen captions
if you'd rather not narrate.

**Before you hit record**

- Make sure the demo workspace exists (`npm run seed` if running locally; it's
  already seeded on the live server).
- Open the site **logged out** — you'll show the landing + live widget first.
- Have the demo login ready to paste: `demo@docent.app` / `demodemo123`.

**Shot list** (trim dead air; aim to land under 90s)

| Time | On screen | Voiceover / caption |
|------|-----------|---------------------|
| 0:00–0:12 | Landing hero, then scroll to the **live demo widget**; type *"What's your return policy?"* | "Docent turns your help docs into a support agent. This bot is live right on the page — ask it anything, and it answers grounded in real docs, with the source cited." |
| 0:12–0:22 | Click **Sign in** → paste the demo login → land on the dashboard | "Let's build one. I'll sign in to the demo workspace." |
| 0:22–0:34 | Open **Acme Support** → **Knowledge** tab → show the sources | "A chatbot's knowledge is just docs — paste text, add a URL, or upload a PDF. It chunks and embeds them, and it's ready." |
| 0:34–0:54 | **Playground** → ask *"How do I reset my password?"* (watch it stream + citation), then *"What's the capital of France?"* (it declines) | "Answers stream in, grounded, with citations. Ask something off-topic and it declines instead of making things up — exactly how good support should behave." |
| 0:54–1:06 | **Embed** tab → click copy on the one-line snippet → show the live widget preview / open the bubble | "To add it to any website, copy one script tag. A chat bubble appears in the corner — same bot, same grounded answers." |
| 1:06–1:20 | **Plan & usage** → show the usage meters → **Upgrade to Pro** → mock checkout → confirm | "Pricing and billing are built in — Free, Pro, Business, with real limits. Here's a mock checkout; no card needed." |
| 1:20–1:28 | Back to the dashboard or landing | "Docent — your docs, answering customers in seconds. Built with Next.js and deployed live." |

**Tips:** rehearse once; move the cursor deliberately; type the questions live (it
feels real); keep each shot tight. No voiceover? Turn the right column into short
on-screen captions and add light background music.
