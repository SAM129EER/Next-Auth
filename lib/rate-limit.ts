import { redis } from "@/lib/db/redis";

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
};

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  try {
    // Use a Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Count requests in window
    pipeline.zcard(key);

    // Set expiry on the key
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();

    const requestCount = (results?.[2]?.[1] as number) || 0;
    const remaining = Math.max(0, limit - requestCount);
    const resetAt = new Date(now + windowMs);

    return {
      success: requestCount <= limit,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open — allow request if Redis is down
    return {
      success: true,
      remaining: limit,
      resetAt: new Date(now + windowMs),
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toISOString(),
  };
}
