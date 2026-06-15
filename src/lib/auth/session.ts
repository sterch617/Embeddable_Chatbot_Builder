// Session management: opaque random tokens stored in the DB, referenced by an
// httpOnly cookie. Tokens are revocable (delete the row) — unlike stateless JWTs.

import { cookies } from "next/headers";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "../db/client";
import { sessions, users, type User } from "../db/schema";
import { SESSION_TTL_DAYS } from "../constants";

const COOKIE_NAME = "ecb_session";

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Create a session for a user and set the cookie. */
export async function createSession(userId: string): Promise<void> {
  const db = await getDb();
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: token, userId, expiresAt });

  // Mark the cookie Secure only when actually served over HTTPS. Browsers drop
  // Secure cookies on plain HTTP, which would silently break sessions on an
  // http://IP deployment. Tie it to the public URL scheme instead of NODE_ENV.
  const secure = (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://");

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Delete the current session and clear the cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.id, token));
    jar.delete(COOKIE_NAME);
  }
}

/**
 * The currently authenticated user, or null. Cached per request so it can be
 * called from both a layout and a page without hitting the DB twice.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = await getDb();
  const [row] = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, token))
    .limit(1);

  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) return null;
  return row.user;
});

/** Require an authenticated user, or redirect to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
