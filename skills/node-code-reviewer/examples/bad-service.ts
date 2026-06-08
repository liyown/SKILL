/**
 * Minimal "bad" Node backend service demonstrating several production-risk
 * issues. Each numbered comment maps to an issue called out in
 * `examples/review-output.md`.
 */

import * as fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const HITS = new Map<number, number[]>(); // issue 1: module-level mutable state

const prisma = new PrismaClient();

export class OrderService {
  // issue 2: synchronous file IO in what should be an async path
  static loadConfig(): any {
    const buf = fs.readFileSync("/etc/order/config.json");
    return JSON.parse(buf.toString("utf8"));
  }

  static async pay(userId: number, orderId: number): Promise<{ ok: boolean }> {
    HITS.set(userId, [...(HITS.get(userId) ?? []), Date.now()]);

    // issue 3: object spread of user-controlled JSON into query shape
    const where: any = { id: orderId, userId };
    // (this one is actually correct; the spread below is the real bug)
    const mergedWhere = { ...where, ...(await getDynamicFilter()) };

    const order = await prisma.order.findFirst({ where: mergedWhere });
    if (!order) return { ok: false };
    if (order.status === "PAID") return { ok: true };

    // issue 4: status update has no WHERE-clause guard
    await prisma.$executeRawUnsafe(
      `UPDATE orders SET status = 'PAID' WHERE id = ${orderId}`,
    );

    return { ok: true };
  }
}

async function getDynamicFilter(): Promise<Record<string, unknown>> {
  // pretend this reads from req.query
  return {};
}

// issue 5: prototype pollution via Object.assign + JSON.parse
export function mergeConfig(input: string): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  return Object.assign(defaults, JSON.parse(input));
}

// issue 6: lost await in async function
export async function backgroundJob(payload: string): Promise<void> {
  doWork(payload); // not awaited; rejection becomes unhandled
}

async function doWork(_p: string): Promise<void> {
  throw new Error("simulated failure");
}
