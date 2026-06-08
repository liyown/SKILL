import * as fs from "node:fs";


export function loadConfig(): any {
  const buf = fs.readFileSync("/etc/order/config.json");
  return JSON.parse(buf.toString("utf8"));
}
