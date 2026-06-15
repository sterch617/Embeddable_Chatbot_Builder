// End-to-end ingestion + retrieval + mock-answer smoke test.
// Run: PGLITE_DIR=memory:// npx tsx scripts/ingest-smoke.ts

import { getDb } from "../src/lib/db/client";
import { users, bots } from "../src/lib/db/schema";
import { ingestDocument } from "../src/lib/ingestion/ingest";
import { searchChunks } from "../src/lib/retrieval";
import { embedOne } from "../src/lib/ai/embeddings";
import { streamAnswer } from "../src/lib/ai/chat";

const FAQ = `
Resetting your password
If you forgot your password, click "Forgot password" on the sign-in screen and
enter your email. We'll send you a secure reset link that stays valid for one
hour. Open the link and choose a new password of at least 8 characters.

Billing and invoices
We bill monthly on the date you first subscribed. You can download every invoice
from Settings → Billing. To change your card, open the billing portal and update
your payment method — the new card is used from the next cycle onward.

Cancelling your subscription
You can cancel any time from Settings → Billing → Cancel plan. Your workspace
stays on the paid plan until the end of the current billing period, after which
it moves to the Free plan. We don't offer prorated refunds for partial months.

Inviting teammates
Workspace owners can invite teammates from Settings → Team. Invited users receive
an email; once they accept, they can manage chatbots but cannot change billing.
`;

async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let out = "";
  for await (const t of gen) out += t;
  return out;
}

async function main() {
  const db = await getDb();
  const [user] = await db
    .insert(users)
    .values({ email: "owner@acme.com", passwordHash: "x" })
    .returning();
  const [bot] = await db
    .insert(bots)
    .values({ userId: user.id, name: "Acme Support" })
    .returning();

  const doc = await ingestDocument(db, {
    botId: bot.id,
    title: "Help Center FAQ",
    sourceType: "text",
    text: FAQ,
  });
  console.log(`✓ ingested "${doc.title}" — status=${doc.status}, chars=${doc.charCount}`);
  if (doc.status !== "ready") {
    console.log("❌ document not ready");
    process.exit(1);
  }

  const cases = [
    { q: "How do I reset my password?", expect: "password" },
    { q: "Can I get a refund if I cancel early?", expect: "refund" },
    { q: "How do I add my coworkers?", expect: "invite" },
  ];

  let ok = true;
  for (const c of cases) {
    const qv = await embedOne(c.q);
    const hits = await searchChunks(db, bot.id, qv, 3);
    const top = hits[0];
    const hit = top?.content.toLowerCase().includes(c.expect);
    console.log(
      `${hit ? "✓" : "✗"} "${c.q}" -> top score ${top?.score.toFixed(3)} ${hit ? "" : "(expected to mention " + c.expect + ")"}`,
    );
    if (!hit) ok = false;

    // Exercise the full mock answer path on the first case.
    if (c.expect === "password") {
      const answer = await collect(
        streamAnswer({
          question: c.q,
          history: [],
          botName: bot.name,
          context: hits.map((h) => ({ ...h, title: doc.title })),
        }),
      );
      console.log(`   mock answer: ${answer}`);
    }
  }

  if (ok) {
    console.log("\n✅ INGEST SMOKE PASSED — ingestion + retrieval + answer work.");
    process.exit(0);
  }
  console.log("\n❌ INGEST SMOKE FAILED — a query didn't retrieve the right chunk.");
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ INGEST SMOKE ERROR:", err);
  process.exit(1);
});
