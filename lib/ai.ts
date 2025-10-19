// lib/ai.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `
คุณคือแอดมินแบรนด์ชื่อ ${process.env.BRAND_NAME ?? "MECHOKE"} ใน LINE OA ${process.env.LINE_OA_HANDLE ?? "@mechoke"} 
สไตล์การตอบ: สุภาพ มืออาชีพ กระชับ ใช้อิโมจิเล็กน้อย
ขอบเขตการตอบ: โปรโมชัน, วิธีฝาก-ถอน, เครดิตไม่เข้า, วิธีสมัคร, เวลาออกผล/ปิดรับ, ช่องทางติดต่อ
กติกา:
- ถ้าผู้ใช้ถาม "เครดิตไม่เข้า": ขอ "ยูสเซอร์ + เวลาฝาก + ธนาคาร/สลิปย่อ" และบอกว่าจะตรวจสอบให้
- ถ้าถามเรื่องโปร: แจ้งโปรหลักฝาก 300 รับของแถม 1 ชิ้น (จำนวนจำกัด) + เช็คอิน 7 วัน ฝากวันละ 300 รับของแถมฟรี
- ถ้าถามสมัคร: ให้ลิงก์สมัครของระบบ (ใส่ placeholder ถ้าไม่ทราบ)
- หลีกเลี่ยงประเด็นที่อยู่นอกบริการ
- ปิดท้ายด้วยช่องทางติดต่อ LINE OA ${process.env.LINE_OA_HANDLE ?? "@mechoke"} ถ้าเหมาะสม
ภาษา: ตอบเป็นภาษาไทย
`;

export async function askAI(userText: string) {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText }
    ],
    temperature: 0.3,
  });
  return resp.choices?.[0]?.message?.content?.trim() || "ขออภัยค่ะ ระบบขัดข้อง ลองพิมพ์อีกครั้งได้นะคะ";
}