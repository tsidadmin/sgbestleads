import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { getDB, mutate, type Session, type User } from "./db";

export const SESSION_COOKIE = "sgbl_session";
const SESSION_DAYS = 30;

export type PublicUser = Omit<User, "passwordHash">;

function toPublic(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  company?: string;
}): Promise<{ user?: PublicUser; error?: string }> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!name || name.length < 2) return { error: "Enter your name." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid work email." };
  }
  if (password.length < 8) {
    return { error: "Password needs at least 8 characters." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return mutate((db) => {
    if (db.users.some((u) => u.email === email)) {
      return { error: "An account with this email already exists. Log in instead." };
    }
    const user: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash,
      company: input.company?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return { user: toPublic(user) };
  });
}

export async function verifyLogin(
  email: string,
  password: string
): Promise<PublicUser | null> {
  const db = await getDB();
  const user = db.users.find(
    (u) => u.email === email.trim().toLowerCase()
  );
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? toPublic(user) : null;
}

export async function createSession(
  userId: string
): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await mutate((db) => {
    // prune expired sessions while we are here
    db.sessions = db.sessions.filter(
      (s) => new Date(s.expiresAt) > new Date()
    );
    const session: Session = {
      token,
      userId,
      expiresAt: expires.toISOString(),
    };
    db.sessions.push(session);
  });
  return { token, expires };
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDB();
  const session = db.sessions.find((s) => s.token === token);
  if (!session || new Date(session.expiresAt) <= new Date()) return null;
  const user = db.users.find((u) => u.id === session.userId);
  return user ? toPublic(user) : null;
}

export async function destroySession(token: string): Promise<void> {
  await mutate((db) => {
    db.sessions = db.sessions.filter((s) => s.token !== token);
  });
}
