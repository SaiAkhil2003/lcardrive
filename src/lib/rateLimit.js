import { createHash } from "crypto";

const buckets = globalThis.__lcardriveRateLimitBuckets || new Map();
globalThis.__lcardriveRateLimitBuckets = buckets;

function hashIdentifier(identifier) {
  return createHash("sha256").update(identifier || "anonymous").digest("hex");
}

export function checkRateLimit(identifier, options = {}) {
  const limit = options.limit || 10;
  const windowMs = options.windowMs || 60 * 60 * 1000;
  const now = Date.now();
  const key = `${options.scope || "default"}:${hashIdentifier(identifier)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs
    });

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt
  };
}
