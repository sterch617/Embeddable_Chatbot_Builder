// Throwaway smoke test for the DB layer: boots the client (runs migrations),
// inserts a user/bot/document/chunks, then runs JS cosine retrieval.
// Run: PGLITE_DIR=memory:// npx tsx scripts/db-smoke.ts

import { getDb } from "../src/lib/db/client";
import { users, bots, documents, chunks } from "../src/lib/db/schema";
import { searchChunks } from "../src/lib/retrieval";
import { EMBEDDING_DIM } from "../src/lib/constants";

// Build a one-hot-ish vector with a "spike" at a given index.
function spike(at: number): number[] {
  const v = new Array(EMBEDDING_DIM).fill(0);
  v[at % EMBEDDING_DIM] = 1;
  return v;
}

async function main() {
  const db = await getDb();
  console.log("✓ db initialized + migrated");

  const [user] = await db
    .insert(users)
    .values({ email: "smoke@test.dev", passwordHash: "x" })
    .returning();
  const [bot] = await db
    .insert(bots)
    .values({ userId: user.id, name: "Smoke Bot" })
    .returning();
  const [doc] = await db
    .insert(documents)
    .values({ botId: bot.id, title: "Doc", sourceType: "text", status: "ready" })
    .returning();
  console.log("✓ inserted user/bot/document");

  await db.insert(chunks).values([
    { documentId: doc.id, botId: bot.id, content: "alpha", embedding: spike(0), idx: 0 },
    { documentId: doc.id, botId: bot.id, content: "beta", embedding: spike(10), idx: 1 },
    { documentId: doc.id, botId: bot.id, content: "gamma", embedding: spike(20), idx: 2 },
  ]);
  console.log("✓ inserted 3 chunks with embeddings");

  const results = await searchChunks(db, bot.id, spike(10), 3); // should match "beta"
  console.log("✓ retrieval results (nearest first):");
  console.table(results.map((r) => ({ content: r.content, score: r.score.toFixed(3) })));

  if (results[0]?.content === "beta" && results[0].score > 0.99) {
    console.log("\n✅ SMOKE PASSED — retrieval returns the expected nearest chunk.");
    process.exit(0);
  }
  console.log("\n❌ SMOKE FAILED — unexpected top result:", results[0]);
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ SMOKE ERROR:", err);
  process.exit(1);
});
