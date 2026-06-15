// Database client with a driver switch:
//   - DATABASE_URL set  -> real Postgres (node-postgres), for production.
//   - DATABASE_URL empty -> in-process PGlite (file-backed), for zero-config dev.
// Both run the same Drizzle schema and the same SQL migrations. Migrations are
// applied automatically on first access, so `npm run dev` just works.

import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// node-postgres and PGlite drivers expose the same query API; we type both as
// this single canonical type for clean downstream usage.
export type DB = NodePgDatabase<typeof schema>;

const MIGRATIONS_DIR = path.join(process.cwd(), "src", "lib", "db", "migrations");

declare global {
  // eslint-disable-next-line no-var
  var __ecbDb: DB | undefined;
  // eslint-disable-next-line no-var
  var __ecbDbInit: Promise<DB> | undefined;
}

async function createDb(): Promise<DB> {
  const url = process.env.DATABASE_URL?.trim();

  if (url) {
    // Production: real Postgres (e.g. on the DigitalOcean VPS).
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: url });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
    return db;
  }

  // Dev / zero-config: in-process PGlite, file-backed.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DIR?.trim() || ".pglite";
  const client = new PGlite({ dataDir });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db as unknown as DB;
}

/** Returns the shared, migrated database instance (created once per process). */
export async function getDb(): Promise<DB> {
  if (globalThis.__ecbDb) return globalThis.__ecbDb;
  if (!globalThis.__ecbDbInit) {
    globalThis.__ecbDbInit = createDb().then((db) => {
      globalThis.__ecbDb = db;
      return db;
    });
  }
  return globalThis.__ecbDbInit;
}
