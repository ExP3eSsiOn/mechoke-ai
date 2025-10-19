// lib/promos.ts

export type Promo = {
    id: string;
    title: string;
    active: boolean;
    keywords: string[];        // คำที่ลูกค้าพิมพ์มาแล้วควรเจอโปรนี้
    lines: string[];           // ข้อความที่จะส่งให้ลูกค้า
    limitNote?: string;        // บันทึกจำนวนจำกัด/เงื่อนไข (แสดงท้ายข้อความ)
  };
  
  const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";
  const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
  
  // ===== โปรที่ใช้บ่อย =====
  export const PROMOS: Promo[] = [
    {
      id: "first-deposit-300-gift",
      title: "ฝากครั้งแรก 300 รับของแถมฟรี",
      active: true,
      keywords: [
        "โปร", "โปรวันนี้", "promotion", "ฝาก 300", "ของแถม", "โปรพิเศษ", "โปรฝากแรก",
      ],
      lines: [
        "🎁 โปรฝากแรกพิเศษ!",
        "• ฝาก 300 บาท เลือกรับของแถมฟรี 1 ชิ้น (ของแท้ ส่งฟรีถึงบ้าน)",
        "• สำหรับสมาชิกใหม่เท่านั้น",
        `สอบถามเพิ่มเติมที่ LINE OA 👉 ${LINE_HANDLE}`,
      ],
      limitNote: "※ ของมีจำนวนจำกัด โปรดใช้สิทธิ์ภายในวันนี้ค่ะ",
    },
    {
      id: "checkin-7days",
      title: "เช็คอิน 7 วัน ฝากวันละ 300 รับของแถม",
      active: true,
      keywords: [
        "เช็คอิน", "เช็คอิน7วัน", "check in", "โปรเช็คอิน", "7 วัน", "โปรต่อเนื่อง",
      ],
      lines: [
        "📅 เช็คอินครบ 7 วัน รับของแถมฟรีทันที!",
        "• เงื่อนไข: ฝากวันละ 300 บาท ต่อเนื่องครบ 7 วัน",
        "• ของแท้ ส่งฟรีถึงบ้าน",
        `ติดต่อแอดมินได้ที่ ${LINE_HANDLE}`,
      ],
      limitNote: "※ สิทธิ์มีจำนวนจำกัด/ตรวจสอบสถานะทุกวัน",
    },
    {
      id: "vip-monthly",
      title: "สะสมยอดเป็น VIP ประจำเดือน",
      active: true,
      keywords: ["vip", "สะสม", "โกลด์", "ซิลเวอร์", "สิทธิ์พิเศษ"],
      lines: [
        "🏆 สะสมยอดครบตามเกณฑ์ รับสิทธิ์ VIP รายเดือน",
        "• รับโบนัส/ของขวัญเพิ่ม และดูแลพิเศษโดยทีมงาน",
        `แอดไลน์เพื่อดูเกณฑ์ล่าสุดได้ที่ ${LINE_HANDLE}`,
      ],
    },
  ];
  
  // ===== ตัวช่วย: คืนข้อความสรุปโปรที่กำลัง Active ทั้งหมด =====
  export function promoSummary(): string {
    const actives = PROMOS.filter(p => p.active);
    const list = actives.map(p => `• ${p.title}`).join("\n");
    return [
      `🎉 โปรปัจจุบันของ ${BRAND_NAME}`,
      list || "ยังไม่มีโปรที่เปิดอยู่ในขณะนี้",
      `สอบถามเพิ่มเติมได้ที่ ${LINE_HANDLE}`,
    ].join("\n");
  }
  
  // ===== ตัวช่วย: หาโปรจากข้อความลูกค้า (แมตช์คีย์เวิร์ดแบบง่าย) =====
  export function promoFromText(text: string): Promo | null {
    const t = text.toLowerCase();
    for (const p of PROMOS) {
      if (!p.active) continue;
      const hit = p.keywords.some(k => t.includes(k.toLowerCase()));
      if (hit) return p;
    }
    // ไม่เจอ keyword ใด ๆ ให้ fallback โปรหลัก
    const defaultPromo = PROMOS.find(p => p.active && p.id === "first-deposit-300-gift");
    return defaultPromo || null;
  }
  
  // ===== ตัวช่วย: ทำข้อความตอบกลับโปรตามข้อความลูกค้า =====
  export function buildPromoReplyFromText(text: string): string | null {
    const promo = promoFromText(text);
    if (!promo) return null;
    const body = [...promo.lines];
    if (promo.limitNote) body.push(promo.limitNote);
    return body.join("\n");
  }