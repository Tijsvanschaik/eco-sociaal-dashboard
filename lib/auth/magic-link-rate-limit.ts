type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

/** Sliding-window rate limit. Returns true when the request is allowed. */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}

export function resetRateLimitsForTests(): void {
  buckets.clear();
}
