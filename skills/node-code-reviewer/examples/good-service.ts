/**
 * Minimal "good" counterpart of `bad-service.ts`.
 * Each fix is annotated with a tag that maps to the issue list in
 * `examples/review-output.md` so bad → good is traceable 1:1.
 */

import * as fs from "node:fs/promises";
import { Prisma, PrismaClient } from "@prisma/client";


class RateLimiter {
  private buckets = new Map<number, number[]>();
  constructor(private max: number, private windowMs: number) {}

  hit(key: number, now: number): boolean {
    const arr = this.buckets.get(key) ?? [];
    const cutoff = now - this.windowMs;
    const next = arr.filter((t) => t >= cutoff);
    if (next.length >= this.max) {
      this.buckets.set(key, next);
      return false;
    }
    next.push(now);
    this.buckets.set(key, next);
    return true;
  }
}


const prisma = new PrismaClient();
const limiter = new RateLimiter(100, 60_000);


export class OrderService {
  // Fix 1 (sync IO): async file read so the event loop is not blocked
  // by fs.readFileSync; the call awaits the OS-level completion.
  static async loadConfig(): Promise<unknown> {
    const buf = await fs.readFile("/etc/order/config.json");
    return JSON.parse(buf.toString("utf8"));
  }

  static async pay(userId: number, orderId: number, now: number): Promise<{ ok: boolean }> {
    // Fix 2 (module-level state): rate limit goes through a class
    // instance, not a module-level Map; per-process LRU. For multi-host
    // deployments swap in Redis.
    if (!limiter.hit(userId, now)) return { ok: false, reason: "rate_limited" };

    // Fix 3 (filter allowlist): explicit where shape, no spread of a
    // dynamic object that could include arbitrary fields.
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) return { ok: false, reason: "not_found" };
    // Fix 4 (idempotency): the paid-state short-circuit precedes any
    // side effect so a redelivery is a no-op.
    if (order.status === "PAID") return { ok: true };

    // Fix 5 (status race + bound SQL): Prisma.sql template tag binds
    // the parameter; the WHERE clause guards on old status so two
    // concurrent pay calls cannot both flip the row.
    const result = await prisma.$executeRaw(
      Prisma.sql`UPDATE orders SET status = 'PAID' WHERE id = ${orderId} AND status = 'UNPAID'`,
    );
    if (result !== 1) {
      return { ok: false, reason: "concurrent_update" };
    }
    return { ok: true };
  }
}

// Fix 6 (prototype pollution): refuse __proto__ / constructor /
// prototype keys before they reach Object.assign, and use a
// null-prototype target as defence in depth.
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function mergeConfig(input: string): Record<string, unknown> {
  const parsed = JSON.parse(input) as Record<string, unknown>;
  for (const k of Object.keys(parsed)) {
    if (FORBIDDEN_KEYS.has(k)) {
      throw new Error(`forbidden config key: ${k}`);
    }
  }
  return Object.assign(Object.create(null), parsed);
}

// Fix 7 (lost await): await the work so the rejection surfaces as a
// real Promise rejection the caller can handle, not as an
// unhandledRejection event.
export async function backgroundJob(payload: string): Promise<void> {
  try {
    await doWork(payload);
  } catch (err) {
    // Re-throw so the caller / task supervisor sees the failure.
    throw err;
  }
}

async function doWork(_p: string): Promise<void> {
  throw new Error("simulated failure");
}
