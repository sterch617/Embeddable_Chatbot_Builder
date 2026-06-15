// Smoke test for local embeddings: loads the model, checks dimensionality and
// that semantically related texts score higher than unrelated ones.
// Run: npx tsx scripts/ai-smoke.ts

import { embed, EMBEDDING_DIM } from "../src/lib/ai/embeddings";
import { cosineSimilarity } from "../src/lib/retrieval";

async function main() {
  console.log("Loading local embedding model (first run downloads weights)...");
  const t0 = Date.now();
  const [dog, puppy, car] = await embed([
    "How do I reset my password?",
    "I forgot my password and need to recover access to my account.",
    "What is the capital of France?",
  ]);
  console.log(`✓ embedded 3 texts in ${Date.now() - t0}ms`);

  console.log(`✓ vector dimension: ${dog.length} (expected ${EMBEDDING_DIM})`);
  if (dog.length !== EMBEDDING_DIM) {
    console.log("❌ unexpected dimension");
    process.exit(1);
  }

  const related = cosineSimilarity(dog, puppy); // both about passwords
  const unrelated = cosineSimilarity(dog, car); // password vs France
  console.log(`✓ similarity (password↔password) = ${related.toFixed(3)}`);
  console.log(`✓ similarity (password↔unrelated) = ${unrelated.toFixed(3)}`);

  if (related > unrelated) {
    console.log("\n✅ AI SMOKE PASSED — semantic embeddings behave correctly.");
    process.exit(0);
  }
  console.log("\n❌ AI SMOKE FAILED — related text did not score higher.");
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ AI SMOKE ERROR:", err);
  process.exit(1);
});
