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

## Suggested 90-second video flow

1. **0:00** Landing page — read the headline, ask the live demo widget a question. (15s)
2. **0:15** Sign in with the demo account → dashboard → open the Acme bot. (10s)
3. **0:25** Knowledge tab — show the sources; add one quickly. (15s)
4. **0:40** Playground — ask a question, highlight the streamed, cited answer; then an off-topic one to show it declines. (20s)
5. **1:00** Embed tab — copy the snippet, show the live widget bubble on a test page. (15s)
6. **1:15** Billing — usage meters, run the mock upgrade. (15s)
7. **1:30** Done.
