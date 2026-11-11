const inflight = new Map<string, Promise<unknown>>();

export function dedupe<T>(key: string, run: () => Promise<T>): Promise<T> {
  const current = inflight.get(key) as Promise<T> | undefined;
  if (current) return current;
  const next = run().finally(() => inflight.delete(key));
  inflight.set(key, next);
  return next;
}
