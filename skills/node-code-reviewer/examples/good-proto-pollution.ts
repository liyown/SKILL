/**
 * Good counterpart of proto-pollution.ts.
 */

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function mergeConfig(input: string): Record<string, unknown> {
  const parsed = JSON.parse(input) as Record<string, unknown>;
  // Fix 1 (denylist): reject the keys that would let an attacker
  // mutate the prototype chain via Object.assign. The bad version
  // trusted the input keys verbatim, so passing
  // {"__proto__":{"isAdmin":true}} polluted every later object.
  for (const k of Object.keys(parsed)) {
    if (FORBIDDEN_KEYS.has(k)) {
      throw new Error(`forbidden config key: ${k}`);
    }
  }
  // Fix 2 (null-prototype target): even if a future regression adds
  // a new dangerous key, the target has no prototype so pollution
  // has nowhere to land. Defence in depth.
  return Object.assign(Object.create(null), parsed);
}
