export function mergeConfig(input: string): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  return Object.assign(defaults, JSON.parse(input));
}
