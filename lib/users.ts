// lib/users.ts

type UsersMemory = {
  users: Set<string>;
  updatedAt: number; // epoch ms
};

const memory: UsersMemory = {
  users: new Set<string>(),
  updatedAt: Date.now(),
};

/** บันทึก userId (จาก webhook) */
export function trackUserId(id: string) {
  if (!id) return Promise.resolve();
  memory.users.add(id);
  memory.updatedAt = Date.now();
  return Promise.resolve();
}

/** คืน array ของ userId ทั้งหมด (รองรับ limit) */
export function listUsers(limit?: number): string[] {
  const all = Array.from(memory.users);
  if (typeof limit === "number" && limit > 0) {
    return all.slice(0, limit);
  }
  return all;
}

/** สถิติสำหรับหน้า /api/debug/users */
export function getStats() {
  const total = memory.users.size;
  const sample = Array.from(memory.users).slice(0, 10);
  return {
    total,
    sample,
    updatedAt: memory.updatedAt,
    updatedAtISO: new Date(memory.updatedAt).toISOString(),
  };
}