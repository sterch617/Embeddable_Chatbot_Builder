// Seed a demo workspace so the app shows a fully working chatbot out of the box.
// Run with the dev server STOPPED (PGlite allows a single connection):
//   npm run seed

import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db/client";
import { users, bots } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { ingestDocument } from "../src/lib/ingestion/ingest";

const DEMO_EMAIL = "demo@docent.app";
const DEMO_PASSWORD = "demodemo123";
const DEMO_PUBLIC_ID = "demo";

const HELP_CENTER = `
Getting started
Create your Acme account, verify your email, and you're ready to go. Most
customers are up and running in under five minutes. If you get stuck, our
in-app chat is always one click away.

Resetting your password
Forgot your password? Click "Forgot password" on the sign-in screen and enter
your email. We'll send a secure reset link that stays valid for one hour. Open
the link and choose a new password of at least 8 characters.

Billing and invoices
We bill monthly on the date you first subscribed. You can download every invoice
from Settings → Billing. To change your card, open the billing portal and update
your payment method — the new card is used from the next cycle onward.

Plans and upgrades
You can upgrade or downgrade at any time from Settings → Billing. Upgrades take
effect immediately and we prorate the difference. Downgrades take effect at the
start of your next billing cycle.

Cancelling your subscription
You can cancel anytime from Settings → Billing → Cancel plan. Your workspace
stays on the paid plan until the end of the current billing period, after which
it moves to the Free plan. We don't offer prorated refunds for partial months.

Shipping and delivery
Standard orders ship within 2 business days and arrive in 3 to 5 business days.
You'll receive a tracking link by email as soon as your order leaves our
warehouse. We currently ship to the US, Canada, the UK and the EU.

Returns and refunds
Not happy with a physical product? Return it within 30 days for a full refund.
Start a return from Settings → Orders → Return, print the prepaid label, and
drop it off. Refunds land back on your original payment method within 5 business
days of us receiving the item.

Contacting a human
Need a person? Email support@acme.com and we'll reply within one business day.
Pro and Business customers get priority responses.
`;

const PRODUCT_FAQ = `
Is there a free plan?
Yes. The Free plan is free forever and doesn't require a credit card. It's a
great way to try Acme on a side project before you upgrade.

Do you offer team accounts?
Team workspaces with multiple seats are on our roadmap. Today, one login owns a
workspace and can manage all of its chatbots.

Where is my data stored?
Your documents and conversations are stored in your workspace's database. You
can delete any source or chatbot at any time, and deleting it removes the
associated data.

What languages are supported?
The assistant answers in the language of your documents and the question asked.
`;

async function main() {
  const db = await getDb();

  // Fresh demo each run — cascades to the bot, its docs and chunks.
  await db.delete(users).where(eq(users.email, DEMO_EMAIL));

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const [user] = await db
    .insert(users)
    .values({ email: DEMO_EMAIL, passwordHash, plan: "pro" })
    .returning();

  const [bot] = await db
    .insert(bots)
    .values({
      userId: user.id,
      name: "Acme Support",
      publicId: DEMO_PUBLIC_ID,
      welcomeMessage:
        "Hi! I'm Acme's assistant. Ask me about your account, billing, shipping or returns.",
      accentColor: "#4f46e5",
      systemPrompt:
        "You are Acme's friendly support agent. Be concise, warm and accurate.",
    })
    .returning();

  console.log("Ingesting demo knowledge (first run loads the embedding model)…");
  await ingestDocument(db, {
    botId: bot.id,
    title: "Acme Help Center",
    sourceType: "text",
    text: HELP_CENTER,
  });
  await ingestDocument(db, {
    botId: bot.id,
    title: "Product FAQ",
    sourceType: "text",
    text: PRODUCT_FAQ,
  });

  console.log("\n✅ Seeded the demo workspace.\n");
  console.log(`   Sign in:  ${DEMO_EMAIL}  /  ${DEMO_PASSWORD}`);
  console.log(`   Widget:   /widget/${bot.publicId}`);
  console.log(
    `   Tip: set NEXT_PUBLIC_DEMO_BOT=${bot.publicId} in .env to show the live demo on the landing page.\n`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
