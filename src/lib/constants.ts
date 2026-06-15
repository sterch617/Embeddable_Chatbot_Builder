// Shared, dependency-free constants. Imported by the Drizzle schema, the AI
// layer and the billing config, so it must not import anything heavy.

/**
 * Embedding dimensionality. Must match the default local embedding model
 * (Xenova/all-MiniLM-L6-v2 → 384). Changing this requires re-ingesting.
 */
export const EMBEDDING_DIM = 384;

/** One "page" of knowledge = this many characters of extracted text (plan limits). */
export const PAGE_CHARS = 2000;

/** Target size of a single retrievable chunk, in characters. */
export const CHUNK_CHARS = 1200;

/** Overlap between consecutive chunks, in characters (keeps context across splits). */
export const CHUNK_OVERLAP = 150;

/** How many chunks to retrieve per question for RAG context. */
export const RETRIEVAL_TOP_K = 6;

/** Minimum cosine similarity for a chunk to count as relevant context. */
export const MIN_RELEVANCE = 0.25;

/** Session lifetime, in days. */
export const SESSION_TTL_DAYS = 30;

// --- Brand ----------------------------------------------------------------
export const APP_NAME = "Docent";
export const APP_TAGLINE =
  "Turn your help docs into a support agent that answers customers in seconds.";
export const APP_DESCRIPTION =
  "Docent reads your help docs, FAQs and guides, then answers your customers 24/7 — in your app and as an embeddable widget on your site.";
