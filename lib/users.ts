// lib/users.ts

// เก็บ userId แบบ in-memory (อาศัย module scope ของฟังก์ชันบน Vercel/Node runtime)
type UsersMemory = {
    users: Set<string>;
    updatedAt: number; // epoch ms ล่าสุดที่มีการอัปเดต
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
  
  /** คืน array ของ userId ทั้งหมด */
  export function listUsers(): string[] {
    return Array.from(memory.users);
  }
  
  /** สถิติสำหรับหน้า /api/debug/users */
  export function getStats() {
    const total = memory.users.size;
    const sample = Array.from(memory.users).slice(0, 10); // ตัวอย่าง 10 รายการแรก
    return {
      total,
      sample,
      updatedAt: memory.updatedAt,
      updatedAtISO: new Date(memory.updatedAt).toISOString(),
    };
  }