import type { Config } from "drizzle-kit";

// Used only for `drizzle-kit generate` (schema -> SQL migrations).
// Migrations are applied at runtime by the db client (src/lib/db/client.ts),
// so no live DB credentials are needed here.
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
} satisfies Config;
