import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// Exported for convenience — lazily initialized
export const redis = new Proxy({} as Redis, {
  get: (_, prop) => (getRedis() as never)[prop as never],
});

// ─── Rate limiters ─────────────────────────────────────────────────────────────

function makeRatelimit(prefix: string, requests: number, window: string): Ratelimit {
  return new Ratelimit({
    redis: new Proxy({} as Redis, { get: (_, p) => (getRedis() as never)[p as never] }),
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix,
  });
}

export const authRateLimit = makeRatelimit("rl:auth", 10, "15 m");
export const apiRateLimit = makeRatelimit("rl:api", 100, "1 m");
export const uploadRateLimit = makeRatelimit("rl:upload", 20, "1 h");

// ─── Cache helpers ─────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await getRedis().get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  try {
    if (ttlSeconds) {
      await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      await getRedis().set(key, JSON.stringify(value));
    }
  } catch {
    // Redis failures are non-fatal for caching
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {}
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) await getRedis().del(...keys);
  } catch {}
}

export const CacheKeys = {
  userProfile: (id: string) => `user:profile:${id}`,
  userPortfolio: (id: string) => `user:portfolio:${id}`,
  adminStats: () => "admin:stats",
  platformSettings: () => "platform:settings",
  exchangeTicker: (symbol: string) => `ticker:${symbol}`,
} as const;
