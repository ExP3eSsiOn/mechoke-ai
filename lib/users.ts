// lib/users.ts

export type TrackedUser = {
  id: string;
  firstSeen: number; // epoch ms
  lastSeen: number;  // epoch ms
  count: number;     // จำนวนครั้งที่พบใน webhook
};

type UsersMemory = {
  map: Map<string, TrackedUser>;
  updatedAt: number; // epoch ms
};

const memory: UsersMemory = {
  map: new Map<string, TrackedUser>(),
  updatedAt: Date.now(),
};

/** บันทึก/อัปเดต userId (เรียกจาก webhook ทุกครั้งที่มีข้อความ) */
export function trackUserId(id: string) {
  if (!id) return Promise.resolve();
  const now = Date.now();
  const cur = memory.map.get(id);
  if (cur) {
    cur.lastSeen = now;
    cur.count += 1;
    memory.map.set(id, cur);
  } else {
    memory.map.set(id, { id, firstSeen: now, lastSeen: now, count: 1 });
  }
  memory.updatedAt = now;
  return Promise.resolve();
}

/** คืนรายการผู้ใช้เรียงตาม lastSeen (ใหม่ → เก่า) รองรับ limit */
export function listUsers(limit?: number): TrackedUser[] {
  const arr = Array.from(memory.map.values()).sort((a, b) => b.lastSeen - a.lastSeen);
  if (typeof limit === "number" && limit > 0) return arr.slice(0, limit);
  return arr;
}

/** สถิติสำหรับ /api/debug/users */
export function getStats() {
  const total = memory.map.size;
  const updatedAt = memory.updatedAt;
  const mostRecent = listUsers(1)[0];
  const sample = listUsers(10).map(u => u.id);
  return {
    total,
    updatedAt,
    updatedAtISO: new Date(updatedAt).toISOString(),
    mostRecent: mostRecent
      ? {
          id: mostRecent.id,
          lastSeen: mostRecent.lastSeen,
          lastSeenISO: new Date(mostRecent.lastSeen).toISOString(),
          count: mostRecent.count,
        }
      : null,
    sample, // แสดงตัวอย่าง id 10 รายการแรก
  };
}