import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use native/WASM assets and must NOT be bundled by webpack —
  // they are required at runtime on the server instead. Without this, PGlite's
  // WASM and transformers.js fail to load inside the Next.js server bundle.
  serverExternalPackages: [
    "@electric-sql/pglite",
    "@huggingface/transformers",
    "pg",
  ],
};

export default nextConfig;
