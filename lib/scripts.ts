// lib/scripts.ts
/**
 * Female-tone scripts for phone calls & LINE broadcast templates.
 * คำลงท้ายคะ/ค่ะ พร้อมอีโมจิเล็กน้อย
 */
const SIGNUP_URL = process.env.SIGNUP_URL || "https://www.mechoke.com/";
const LINE_ISSUE_URL = process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm";
const TELEGRAM_URL = process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9";

export type CallScript = { title: string; open: string[]; body: string[]; close: string[] };
export type BroadcastTpl = { key: string; title: string; lines: string[]; cta?: { label: string; url: string } };

// 1) โทรครั้งแรก – สมัครแล้วแต่ยังไม่ฝาก
export const CALL_FIRST_CONTACT: CallScript = {
  title: "โทรครั้งแรก – สมัครแล้วแต่ยังไม่ฝาก",
  open: [
    "สวัสดีค่ะ คุณ{name} ใช่ไหมคะ นี่{agent} โทรจาก {brand} ค่ะ 🙋‍♀️",
    "ขอรบกวนเวลาสั้น ๆ ประมาณ 10 วินาที พอจะสะดวกคุยสักครู่ไหมคะ",
  ],
  body: [
    "เห็นว่าคุณ{name} สมัครสมาชิกไว้แล้ว แต่ยังไม่ได้ฝากเข้าระบบค่ะ",
    "ตอนนี้มีโปรพิเศษ ฝาก 300 บาทต่อเนื่อง 7 วัน เลือกรับของแถมฟรี 1 ชิ้นค่ะ 🎁",
    `ถ้าสนใจ หนูส่งลิงก์สมัคร/เริ่มใช้งานให้เลยนะคะ: ${SIGNUP_URL}`,
  ],
  close: [
    "ถ้ายังไม่สะดวก เดี๋ยวหนูส่งรายละเอียดให้ทาง LINE ไว้ก่อนนะคะ",
    `มีปัญหาอะไรแจ้งแอดมินได้ที่ ${LINE_ISSUE_URL} และเช็กประกาศผลที่ ${TELEGRAM_URL} ค่ะ`,
  ],
};

// 2) ลูกค้ายังลังเล / ไม่ว่างตอนนี้
export const CALL_HESITATE: CallScript = {
  title: "ลูกค้ายังลังเล / ไม่ว่างตอนนี้",
  open: ["เข้าใจเลยค่ะ ช่วงนี้อาจจะไม่สะดวกใช่ไหมคะ 😊"],
  body: [
    "ขอสรุปสั้น ๆ เก็บไว้ก่อนนะคะ",
    "โปรหลัก: ฝาก 300 ต่อเนื่อง 7 วัน เลือกรับของแถมฟรี 1 ชิ้นค่ะ",
    `พร้อมเมื่อไหร่กดเริ่มได้ที่ ${SIGNUP_URL} ค่ะ`,
  ],
  close: [
    `ถ้ามีคำถามทักหาแอดมินได้ที่ ${LINE_ISSUE_URL} นะคะ`,
    "ขอบคุณที่ให้เวลาค่ะ ขอให้มีโชคนะคะ 🍀",
  ],
};

// 3) ลูกค้าเก่า – โปรชวนกลับมา
export const CALL_RETURNING: CallScript = {
  title: "ลูกค้าเก่า – โปรชวนกลับมา",
  open: ["สวัสดีค่ะ คุณ{name} หนู{agent} จาก {brand} ค่ะ 🙋‍♀️"],
  body: [
    "มีโปรเช็คอิน 7 วัน และโปรฝากสะสมสำหรับสมาชิกเก่าด้วยค่ะ",
    "เล่นวันนี้ รับโบนัสเพิ่มสูงสุด 500 บาทนะคะ ✨",
  ],
  close: [
    `เดี๋ยวหนูส่งรายละเอียดทาง LINE ให้ค่ะ / ลิงก์สมัคร ${SIGNUP_URL}`,
  ],
};

// -------- LINE Broadcast Templates --------
export const BC_CHECKIN_7D: BroadcastTpl = {
  key: "bc_checkin_7d",
  title: "โปรเช็คอิน 7 วัน 🎯",
  lines: [
    "เช็คอินครบ 7 วัน ฝากวันละ 300 บาท",
    "รับของแถมฟรี 1 ชิ้น เลือกได้เลยค่ะ 🎁",
    `เริ่มเลย: ${SIGNUP_URL}`,
  ],
  cta: { label: "กดรับโปร", url: SIGNUP_URL },
};

export const BC_WELCOME_NEW: BroadcastTpl = {
  key: "bc_welcome_new",
  title: "ยินดีต้อนรับสมาชิกใหม่ ✨",
  lines: [
    "ฝากครั้งแรกวันนี้ มีของแถมให้ทันทีค่ะ",
    `เริ่มใช้งานที่: ${SIGNUP_URL}`,
    `แจ้งปัญหา: ${LINE_ISSUE_URL} • กลุ่มผลรางวัล: ${TELEGRAM_URL}`,
  ],
  cta: { label: "เริ่มใช้งาน", url: SIGNUP_URL },
};

export const BC_CREDIT_HELP: BroadcastTpl = {
  key: "bc_credit_help",
  title: "เครดิตไม่เข้า แก้ยังไงดีคะ? 🛠️",
  lines: [
    "แจ้งแอดมินด้วยข้อมูล 3 อย่างนี้นะคะ:",
    "1) ยูสเซอร์/เบอร์สมัคร  2) เวลา/ยอดฝาก  3) ธนาคาร/สลิปย่อ",
    `ลิงก์แจ้งปัญหา: ${LINE_ISSUE_URL}`,
  ],
  cta: { label: "แจ้งปัญหา (LINE)", url: LINE_ISSUE_URL },
};

export const CALL_SCRIPTS = { CALL_FIRST_CONTACT, CALL_HESITATE, CALL_RETURNING };
export const BROADCAST_TEMPLATES = { BC_CHECKIN_7D, BC_WELCOME_NEW, BC_CREDIT_HELP };

export function renderBroadcast(tpl: BroadcastTpl): string {
  const body = [tpl.title, ...tpl.lines].join("\n");
  return tpl.cta ? `${body}\n\n${tpl.cta.label}: ${tpl.cta.url}` : body;
}