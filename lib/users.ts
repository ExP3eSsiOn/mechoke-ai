// lib/users.ts
/**
 * Lightweight in-memory user tracking for LINE userId.
 * - Works in Node & Edge (uses globalThis).
 * - Persists per runtime instance only (serverless note: not durable).
 * - Easy to swap with a real DB/KV later (see TODO at bottom).
 */

export type TrackedUser = {
    id: string;
    firstSeen: string; // ISO
    lastSeen: string;  // ISO
    count: number;     // number of seen events
  };
  
  type StoreShape = {
    byId: Map<string, TrackedUser>;
    lastUpdated: string; // ISO
  };
  
  /** Global singleton store (per runtime instance) */
  const G = globalThis as unknown as {
    __MECHOKE_USERS__?: StoreShape;
  };
  
  if (!G.__MECHOKE_USERS__) {
    G.__MECHOKE_USERS__ = {
      byId: new Map<string, TrackedUser>(),
      lastUpdated: new Date().toISOString(),
    };
  }
  
  const store = G.__MECHOKE_USERS__;
  
  /** Internal: get "today" in Asia/Bangkok for daily stats */
  function isSameDayInBangkok(isoA: string, isoB: string) {
    // Simple offset-less compare by using date strings in Bangkok time
    // (no heavy deps). Good enough for dashboard stats.
    const a = new Date(isoA).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
    const b = new Date(isoB).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
    return a === b;
  }
  
  /**
   * trackUserId
   * บันทึก/อัปเดตผู้ใช้เมื่อมี event เข้ามา
   * - ข้ามทันทีถ้า id ว่าง/ไม่ใช่ string
   */
  export async function trackUserId(id?: string | null): Promise<void> {
    if (!id || typeof id !== "string") return;
    const now = new Date().toISOString();
  
    const existing = store.byId.get(id);
    if (existing) {
      existing.count += 1;
      existing.lastSeen = now;
      store.byId.set(id, existing);
    } else {
      store.byId.set(id, {
        id,
        firstSeen: now,
        lastSeen: now,
        count: 1,
      });
    }
    store.lastUpdated = now;
  }
  
  /**
   * listUsers
   * ดึงรายการผู้ใช้ เรียงล่าสุดก่อน (lastSeen desc)
   * @param limit จำนวนสูงสุดที่ต้องการ (ค่าเริ่มต้น 100)
   */
  export function listUsers(limit = 100): TrackedUser[] {
    const arr = Array.from(store.byId.values());
    arr.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
    return arr.slice(0, limit);
  }
  
  /**
   * getStats
   * สรุปจำนวนผู้ใช้ทั้งหมด และผู้ใช้ที่ active วันนี้ (ตามโซน Asia/Bangkok)
   */
  export function getStats() {
    const all = store.byId.size;
    const nowIso = new Date().toISOString();
    let today = 0;
  
    for (const u of store.byId.values()) {
      if (isSameDayInBangkok(u.lastSeen, nowIso)) today += 1;
    }
  
    return {
      totalUsers: all,
      activeToday: today,
      lastUpdated: store.lastUpdated,
    };
  }
  
  /**
   * purgeOlderThan
   * ใช้ล้างข้อมูลผู้ใช้ที่ไม่ได้ active เกิน N วัน (ช่วยลดหน่วยความจำถ้าต้องการ)
   */
  export function purgeOlderThan(days = 90): number {
    const now = Date.now();
    const keepAfter = now - days * 24 * 60 * 60 * 1000;
    let removed = 0;
  
    for (const u of store.byId.values()) {
      if (new Date(u.lastSeen).getTime() < keepAfter) {
        store.byId.delete(u.id);
        removed++;
      }
    }
  
    if (removed > 0) store.lastUpdated = new Date().toISOString();
    return removed;
  }
  
  /**
   * clearAll
   * ล้างข้อมูลทั้งหมด (ควรใช้เฉพาะตอนทดสอบ)
   */
  export function clearAll() {
    store.byId.clear();
    store.lastUpdated = new Date().toISOString();
  }
  
  /* ============================================================
   * HOW TO USE
   * ------------------------------------------------------------
   * 1) ใน Webhook (Node runtime):
   *    await trackUserId(e?.source?.userId);
   *
   * 2) ใน /api/debug/users route:
   *    return NextResponse.json({
   *      ok: true,
   *      users: listUsers(200),
   *      stats: getStats(),
   *    });
   *
   * 3) ในหน้า Dashboard:
   *    fetch("/api/debug/users").then(res => res.json())
   *      -> แสดงรายชื่อ/สถิติได้ทันที
   *
   * NOTE: ข้อมูลนี้เป็น in-memory per instance.
   * หากต้องการความถาวร แนะนำเชื่อมฐานข้อมูล/Redis/Vercel KV:
   * - เมื่อมี ENV เช่น KV_REST_API_URL/ KV_REST_API_TOKEN
   *   สามารถปรับให้ trackUserId() ทำ POST/GET ไปยัง KV ได้
   * ============================================================ */