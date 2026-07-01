// src/lib/upstash.ts
// Upstash Redis — Rate Limiting, Caching, Visitor Tracking
// Serverless-friendly REST API (কোনো persistent connection লাগে না)

import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL
const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN

// ========================
// Redis Client
// ========================
export const redis: Redis | null =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null

// ========================
// Rate Limiter — Contact Form
// প্রতি IP থেকে ঘণ্টায় ৫টি মেসেজ
// ========================
export const contactFormLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:contact",
    })
  : null

// ========================
// Rate Limiter — CV Download
// প্রতি IP থেকে দিনে ২০টি download
// ========================
export const cvDownloadLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(20, "1 d"),
      analytics: true,
      prefix: "ratelimit:cv",
    })
  : null

// ========================
// Cache Helpers
// ========================

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

/**
 * Redis এ data cache করো
 * @param key - cache key
 * @param data - cacheable data
 * @param ttlSeconds - TTL in seconds (default 1 hour)
 */
export async function cacheSet<T>(key: string, data: T, ttlSeconds: number = 3600): Promise<void> {
  if (!redis) return
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlSeconds * 1000 }
    await redis.setex(key, ttlSeconds, JSON.stringify(entry))
  } catch (err) {
    console.warn("[Redis] cacheSet failed:", err)
  }
}

/**
 * Redis থেকে cached data পাও
 * @returns cached data বা null (expire হলে ও null)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const raw = await redis.get<string>(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      await redis.del(key)
      return null
    }
    return entry.data
  } catch (err) {
    console.warn("[Redis] cacheGet failed:", err)
    return null
  }
}

/**
 * Redis এ key delete করো (cache invalidate)
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch (err) {
    console.warn("[Redis] cacheDelete failed:", err)
  }
}

/**
 * GitHub API cache key generate করো
 */
export function githubCacheKey(type: string, username: string): string {
  return `cache:github:${type}:${username}`
}

// ========================
// Visitor Tracking
// ========================

/**
 * লাইভ visitor count পাও (real-time)
 */
export async function getVisitorCount(): Promise<number> {
  if (!redis) return 0
  try {
    const count = await redis.get<number>("visitors:live_count")
    return count || 0
  } catch {
    return 0
  }
}

/**
 * Visitor count increment করো
 */
export async function incrementVisitorCount(): Promise<number> {
  if (!redis) return 0
  try {
    const count = await redis.incr("visitors:total")
    return count
  } catch {
    return 0
  }
}

/**
 * CV download count পাও
 */
export async function getCvDownloadCount(): Promise<number> {
  if (!redis) return 0
  try {
    const count = await redis.get<number>("cv:downloads")
    return count || 0
  } catch {
    return 0
  }
}

/**
 * CV download count increment করো
 */
export async function incrementCvDownload(): Promise<number> {
  if (!redis) return 0
  try {
    return await redis.incr("cv:downloads")
  } catch {
    return 0
  }
}
