// lib/promos.ts
const SIGNUP_URL = process.env.SIGNUP_URL || "https://www.mechoke.com/";
const LINE_ISSUE_URL = process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm";
const TELEGRAM_URL = process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9";

export function promoSummary(): string {
  return [
    "🎁 โปรหลักวันนี้ (สรุปสั้น ๆ) ค่ะ",
    "• เช็คอิน 7 วัน: ฝากวันละ 300 บาท เลือกรับของแถมฟรี 1 ชิ้น",
    `• สมัครสมาชิก: ${SIGNUP_URL}`,
    `• แจ้งปัญหา: ${LINE_ISSUE_URL}`,
    `• กลุ่มเทเลแกรมผลรางวัล: ${TELEGRAM_URL}`,
  ].join("\n");
}

export function buildPromoReplyFromText(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("เช็คอิน") || t.includes("7 วัน") || t.includes("ฝาก 300")) {
    return [
      "โปรเช็คอิน 7 วันค่ะ 🎯",
      "ฝากเล่นวันละ 300 บาท ครบ 7 วัน เลือกรับของแถมฟรี 1 ชิ้นนะคะ",
      `เริ่มได้ที่: ${SIGNUP_URL}`,
    ].join("\n");
  }
  if (t.includes("สมาชิกใหม่") || t.includes("ครั้งแรก")) {
    return [
      "โปรต้อนรับสมาชิกใหม่ค่ะ ✨",
      "ฝากครั้งแรกวันนี้ รับของแถมทันทีนะคะ",
      `ลิงก์สมัคร: ${SIGNUP_URL}`,
    ].join("\n");
  }
  return null;
}