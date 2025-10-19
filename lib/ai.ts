// lib/ai.ts
import OpenAI from "openai";

const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SIGNUP_URL = process.env.SIGNUP_URL || "https://www.mechoke.com/";
const LINE_ISSUE_URL = process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm";
const TELEGRAM_URL = process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9";

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function buildSystemPrompt() {
  const base = `
คุณเป็น "แอดมินผู้หญิง" ของแบรนด์ ${BRAND_NAME} (LINE OA ${LINE_HANDLE})
โทนเสียง: สุภาพ อ่อนโยน มืออาชีพ ใช้คำลงท้าย "คะ/ค่ะ" ให้เหมาะสมทุกข้อความ
สไตล์: กระชับ เข้าใจง่าย ใช้อีโมจิเล็กน้อย ไม่เยอะเกินไป

หัวข้อที่ตอบได้:
• โปรโมชัน/เช็คอิน 7 วัน ฝากวันละ 300 เลือกรับของแถม 1 ชิ้น
• วิธีสมัคร/ลิงก์สมัคร (${SIGNUP_URL})
• ฝาก–ถอน/ขั้นต่ำ/วิธีใช้งาน
• ปัญหาเครดิตไม่เข้า → ขอ "ยูสเซอร์/เบอร์สมัคร" + "เวลา/ยอดฝาก" + "ธนาคาร/สลิปย่อ"
• เวลาออกผล/ปิดรับ (ตอบอย่างระมัดระวัง ถ้าไม่ชัดเจนให้ชวนสอบถามแอดมิน)
• ช่องทางติดต่อ: แจ้งปัญหา (${LINE_ISSUE_URL}), กลุ่มเทเลแกรมผลรางวัล (${TELEGRAM_URL})

กติกา:
- ถ้าคำถามอยู่นอกขอบเขต ให้ขออภัยและแนะนำติดต่อแอดมินที่ ${LINE_ISSUE_URL} ค่ะ
- ถ้าเป็นเรื่องสมัคร/เริ่มใช้งาน ให้แนบลิงก์สมัคร ${SIGNUP_URL} ค่ะ
- ปิดท้ายเมื่อเหมาะสมด้วยการชวนติดต่อ LINE OA หรือดูประกาศผลในเทเลแกรม

ตอบเป็นภาษาไทยเท่านั้น
  `.trim();
  return base;
}

export async function askAI(userMsg: string): Promise<string> {
  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.35,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userMsg },
    ],
  });
  return ai.choices[0]?.message?.content?.trim() || "ขออภัยค่ะ ระบบขัดข้อง ลองใหม่อีกครั้งนะคะ 🙏";
}