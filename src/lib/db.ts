import { promises as fs } from "fs";
import path from "path";

/**
 * JSON document store with two backends:
 *
 * - Upstash Redis (REST API, no npm dependency) when
 *   UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN are set.
 *   Required on Vercel — the serverless filesystem is read-only.
 * - Local JSON file otherwise (dev only).
 *
 * Every read/write goes through this module, so swapping backends —
 * e.g. to Postgres — stays a one-file migration.
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

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const REDIS_KEY = "sgbl:db";

// Atomic compare-and-swap: write only if the blob is unchanged since we
// read it. An empty ARGV[1] means "key did not exist" (GET returns false).
const CAS_SCRIPT =
  "local cur = redis.call('GET', KEYS[1]) " +
  "if (cur == false and ARGV[1] == '') or cur == ARGV[1] then " +
  "redis.call('SET', KEYS[1], ARGV[2]) return 1 end return 0";

function redisEnabled(): boolean {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis request failed with status ${res.status}`);
  }
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(`Redis error: ${data.error}`);
  return data.result;
}

function parse(raw: string | null): DB {
  if (!raw) return structuredClone(EMPTY);
  try {
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

async function loadRaw(): Promise<string | null> {
  if (redisEnabled()) {
    return (await redisCommand(["GET", REDIS_KEY])) as string | null;
  }
  try {
    return await fs.readFile(DB_PATH, "utf8");
  } catch {
    return null;
  }
}

async function persistFile(db: DB): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Serialise writes within this instance so concurrent requests do not
// clobber each other. Cross-instance conflicts are handled by the CAS
// retry loop in `mutate` when Redis is the backend.
let queue: Promise<unknown> = Promise.resolve();

/** Read-only access. */
export async function getDB(): Promise<DB> {
  return parse(await loadRaw());
}

/** Read–modify–write. Return a value from `fn` to get it back. */
export async function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    if (!redisEnabled()) {
      const db = parse(await loadRaw());
      const result = await fn(db);
      await persistFile(db);
      return result;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const raw = await loadRaw();
      const db = parse(raw);
      const result = await fn(db);
      const swapped = await redisCommand([
        "EVAL",
        CAS_SCRIPT,
        1,
        REDIS_KEY,
        raw ?? "",
        JSON.stringify(db),
      ]);
      if (swapped === 1) return result;
    }
    throw new Error("Database write conflict — please retry.");
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
