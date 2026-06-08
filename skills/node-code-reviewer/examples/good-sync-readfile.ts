/**
 * Good counterpart of sync-readfile.ts.
 */

import * as fs from "node:fs/promises";


export async function loadConfig(): Promise<unknown> {
  // Fix 1 (async IO): use the fs/promises API so the file read is awaited
  // instead of blocking the event loop. The bad version's
  // fs.readFileSync halted the worker until the OS call returned, so
  // every other request on the same worker stalled.
  const buf = await fs.readFile("/etc/order/config.json");
  return JSON.parse(buf.toString("utf8"));
}
