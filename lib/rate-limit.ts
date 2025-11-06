// lib/rate-limit.ts
// Simple in-memory rate limiter สำหรับป้องกัน abuse

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory store: userId -> RateLimitEntry
const store = new Map<string, RateLimitEntry>();

// ทำความสะอาด entries ที่หมดอายุทุก 5 นาที
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  maxRequests: number; // จำนวน request สูงสุด
  windowMs: number; // ระยะเวลา window (milliseconds)
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * ตรวจสอบ rate limit สำหรับ user ID
 * @param userId LINE user ID
 * @param config Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
  userId: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 } // default: 10 req/min
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(userId);

  // ถ้ายังไม่มี entry หรือหมดอายุแล้ว -> สร้างใหม่
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(userId, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // ยังอยู่ใน window -> เพิ่ม count
  entry.count += 1;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit สำหรับ user ID (ใช้กรณี admin override)
 */
export function resetRateLimit(userId: string): void {
  store.delete(userId);
}

/**
 * ดูสถิติ rate limit ทั้งหมด (สำหรับ debug)
 */
export function getRateLimitStats() {
  const now = Date.now();
  const active = Array.from(store.entries())
    .filter(([_, entry]) => entry.resetAt > now)
    .map(([userId, entry]) => ({
      userId: userId.substring(0, 12) + "...", // ซ่อนบางส่วนเพื่อ privacy
      count: entry.count,
      resetAt: new Date(entry.resetAt).toISOString(),
    }));

  return {
    total: store.size,
    active: active.length,
    entries: active,
  };
}
