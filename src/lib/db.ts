import { promises as fs } from "fs";
import path from "path";

/**
 * Lightweight JSON file store for the MVP.
 * Swap for Postgres/Supabase/Prisma in production — every read/write
 * goes through this module, so it is a one-file migration.
 */

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  company?: string;
  createdAt: string;
};

export type Session = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type SubscriptionStatus = "active" | "cancelled";

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  interval: "month" | "year";
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
};

type DB = {
  users: User[];
  sessions: Session[];
  subscriptions: Subscription[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const EMPTY: DB = { users: [], sessions: [], subscriptions: [] };

// Serialise writes so concurrent requests do not clobber each other.
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      subscriptions: parsed.subscriptions ?? [],
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

async function persist(db: DB): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

/** Read-only access. */
export async function getDB(): Promise<DB> {
  return load();
}

/** Read–modify–write with a serialised queue. Return a value from `fn` to get it back. */
export async function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** True if the subscription currently grants access to its feed(s). */
export function hasAccess(sub: Subscription): boolean {
  if (sub.status === "active") return true;
  return new Date(sub.currentPeriodEnd) > new Date();
}

/** Idempotently activate (or refresh) a subscription. */
export async function activateSubscription(opts: {
  userId: string;
  planId: string;
  interval: "month" | "year";
  stripeSubscriptionId?: string;
}): Promise<Subscription> {
  return mutate((db) => {
    const now = new Date();
    const periodEnd = addMonths(now, opts.interval === "month" ? 1 : 12);

    const existing = db.subscriptions.find(
      (s) =>
        (opts.stripeSubscriptionId &&
          s.stripeSubscriptionId === opts.stripeSubscriptionId) ||
        (s.userId === opts.userId &&
          s.planId === opts.planId &&
          s.status === "active")
    );

    if (existing) {
      existing.status = "active";
      existing.interval = opts.interval;
      existing.currentPeriodEnd = periodEnd.toISOString();
      if (opts.stripeSubscriptionId) {
        existing.stripeSubscriptionId = opts.stripeSubscriptionId;
      }
      return existing;
    }

    const sub: Subscription = {
      id: `sub_${Math.random().toString(36).slice(2, 10)}`,
      userId: opts.userId,
      planId: opts.planId,
      interval: opts.interval,
      status: "active",
      startedAt: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      stripeSubscriptionId: opts.stripeSubscriptionId,
    };
    db.subscriptions.push(sub);
    return sub;
  });
}

export async function subscriptionsFor(userId: string): Promise<Subscription[]> {
  const db = await getDB();
  return db.subscriptions
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function accessibleSubsFor(userId: string): Promise<Subscription[]> {
  return (await subscriptionsFor(userId)).filter(hasAccess);
}

export async function cancelSubscription(
  id: string,
  userId: string
): Promise<Subscription | null> {
  return mutate((db) => {
    const sub = db.subscriptions.find(
      (s) => s.id === id && s.userId === userId
    );
    if (!sub) return null;
    sub.status = "cancelled";
    return sub;
  });
}

export async function cancelByStripeId(
  stripeSubscriptionId: string
): Promise<void> {
  await mutate((db) => {
    const sub = db.subscriptions.find(
      (s) => s.stripeSubscriptionId === stripeSubscriptionId
    );
    if (sub) sub.status = "cancelled";
  });
}
