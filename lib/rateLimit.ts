// lib/rateLimit.ts
// Simple Redis-based rate limiter using the existing ioredis connection.
// Uses a sliding window counter with TTL.

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL || process.env.KV_URL;
}

function createRedisClient() {
  const Redis = require("ioredis");
  const url = getRedisUrl()!;
  const tls = url?.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined;
  return new Redis(url, {
    tls,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
  });
}

/**
 * Check rate limit for a given key.
 * Returns { allowed: true } if under limit, { allowed: false, retryAfter } if over.
 *
 * @param key       Unique key (e.g. "ai:1.2.3.4")
 * @param limit     Max requests allowed in the window
 * @param windowSec Window size in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  // If no Redis, allow everything (local dev without Redis)
  if (!getRedisUrl()) {
    return { allowed: true, remaining: limit };
  }

  const client = createRedisClient();
  try {
    const redisKey = `rl:${key}`;
    const current = await client.incr(redisKey);

    if (current === 1) {
      // First request in window — set TTL
      await client.expire(redisKey, windowSec);
    }

    if (current > limit) {
      const ttl = await client.ttl(redisKey);
      return { allowed: false, remaining: 0, retryAfter: ttl > 0 ? ttl : windowSec };
    }

    return { allowed: true, remaining: Math.max(0, limit - current) };
  } catch {
    // If Redis fails, allow the request — never block users due to rate limit errors
    return { allowed: true, remaining: limit };
  } finally {
    client.disconnect();
  }
}

/**
 * Get IP from NextRequest headers.
 */
export function getIP(req: Request): string {
  const forwarded = (req.headers as any).get?.("x-forwarded-for") ||
    (req.headers as any)["x-forwarded-for"] || "";
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
