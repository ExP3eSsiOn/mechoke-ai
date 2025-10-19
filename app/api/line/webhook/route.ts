// app/api/line/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  verifyLineSignature,
  lineReplyMessages,
  lineReplyText,
  buildPromoFlex,
  buildCreditHelpFlex,
  LineMessage,
} from "@/lib/line";
import { buildPromoReplyFromText, promoSummary } from "@/lib/promos";

export const runtime = "nodejs"; // ใช้ Node runtime (ต้องใช้ HMAC)

const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";

// ---------- Quick Router -> คืนเป็น array ของข้อความ/เฟล็กซ์ ----------
function routeQuickAnswerToMessages(text: string): LineMessage[] | null {
  const t = text.toLowerCase().trim();

  // ขอ "รูปโปร" เป็น Flex
  if (/(รูปโปร|โปรภาพ|promotion image|โปรโมชั่นแบบรูป)/i.test(t)) {
    return [buildPromoFlex({ ctaUrl: "https://your-signup-link.example" })];
  }

  // โปรโมชัน (ดึงข้อมูลจริงจาก lib/promos.ts)
  if (/(โปร|promotion|โปรวันนี้|โปร พิเศษ|ฝาก 300|ของแถม|เช็คอิน|vip)/i.test(t)) {
    if (/(โปรวันนี้|promotion|โปร พิเศษ|โปร ทั้งหมด|มีโปรอะไรบ้าง)/i.test(t)) {
      return [{ type: "text", text: promoSummary() }];
    }
    const reply = buildPromoReplyFromText(text);
    if (reply) return [{ type: "text", text: reply }];
  }

  // เครดิตไม่เข้า → ส่ง Flex ช่วยกรอก + ข้อความชี้แจง
  if (/(เครดิต|เงิน|ยอด).*(ไม่เข้า|ไม่มา|หาย)/i.test(t)) {
    return [
      buildCreditHelpFlex(),
      {
        type: "text",
        text: [
          "ขออภัยในความไม่สะดวกนะคะ 🙏",
          "รบกวนแจ้ง 'ยูสเซอร์/เบอร์ที่สมัคร' + 'เวลา/ยอดฝาก' + 'ธนาคาร/สลิปย่อ'",
          "แอดมินจะตรวจสอบและอัปเดตให้โดยเร็วค่ะ 💬",
        ].join("\n"),
      },
    ];
  }

  // สมัครสมาชิก
  if (/(สมัคร|regis|register)/i.test(t)) {
    return [
      {
        type: "text",
        text: [
          "สมัครสมาชิกได้เลยค่ะ ✨",
          "ลิงก์สมัคร: https://your-signup-link.example (ใส่ลิงก์จริงของระบบ)",
          "ฝากครั้งแรกวันนี้ รับของแถมฟรีทันทีค่ะ 🎁",
        ].join("\n"),
      },
    ];
  }

  // ถอนขั้นต่ำ
  if (/(ถอน|withdraw).*(เท่าไหร่|min|ขั้นต่ำ)/i.test(t)) {
    return [{ type: "text", text: "ถอนได้ขั้นต่ำ 100 บาทค่ะ ระบบอัตโนมัติ 24 ชม. ⏱️" }];
  }

  // เวลาออกผล/ปิดรับ (ตัวอย่าง)
  if (/(หวย|ลาว|ฮานอย|หุ้น|เวลา|ออกผล|ปิดรับ)/i.test(t)) {
    return [
      {
        type: "text",
        text: [
          "⏰ เวลาออกผล (ตัวอย่าง):",
          "• ลาวพิเศษเที่ยง 12:30 น.",
          "• ลาวสบายดี 15:00 น.",
          "• ลาวก้าวหน้า 17:30 น.",
          "• ฮานอยปกติ 18:30 น.",
          "• หุ้นไทยรอบบ่าย 16:30 น.",
          `สอบถามเพิ่มเติมที่ ${LINE_HANDLE}`,
        ].join("\n"),
      },
    ];
  }

  return null; // ไม่ตรง pattern → ให้ AI ตอบ
}

// ---------- OpenAI (Fallback) ----------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function askAI(userMsg: string) {
  const systemPrompt = `
คุณคือแอดมินของแบรนด์ ${BRAND_NAME} (LINE OA ${LINE_HANDLE})
สไตล์การตอบ: สุภาพ มืออาชีพ กระชับ ใช้อิโมจิเล็กน้อย
ตอบเฉพาะเรื่อง: โปรโมชัน, วิธีสมัคร, ฝาก-ถอน, เครดิตไม่เข้า, เวลาออกผล/ปิดรับ, ช่องทางติดต่อ
กติกา:
- ถ้าลูกค้าพูดเรื่องเครดิตไม่เข้า: ขอ "ยูสเซอร์/เบอร์ที่สมัคร" + "เวลา/ยอดฝาก" + "ธนาคาร/สลิปย่อ"
- ถ้าเรื่องโปร: ให้ข้อมูลโปรฝาก 300 รับของแถม + เช็คอิน 7 วัน (ห้ามคุยเกินขอบเขต)
- ปิดท้ายด้วยการชวนติดต่อ LINE OA ${LINE_HANDLE} เมื่อเหมาะสม
ภาษาไทยเท่านั้น
  `.trim();

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.35,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMsg },
    ],
  });

  return ai.choices[0]?.message?.content?.trim() || "ขออภัยค่ะ ระบบขัดข้อง ลองใหม่อีกครั้งนะคะ 🙏";
}

// ---------- POST: LINE Webhook ----------
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") || undefined;
  const rawBody = await req.text();

  // Prod: บังคับตรวจลายเซ็น | Dev: ข้ามเพื่อเทสง่าย
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    const ok = verifyLineSignature(rawBody, signature);
    if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const events: any[] = body.events ?? [];

  for (const e of events) {
    try {
      if (e.type !== "message" || e.message?.type !== "text") continue;

      const userText: string = e.message.text || "";
      let msgs = routeQuickAnswerToMessages(userText);

      if (!msgs) {
        const aiText = await askAI(userText);
        msgs = [{ type: "text", text: aiText }];
      }

      await lineReplyMessages(e.replyToken, msgs);
    } catch (err) {
      try {
        await lineReplyText(e.replyToken, "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏");
      } catch {}
      console.error("[webhook error]", err);
    }
  }

  return NextResponse.json({ ok: true });
}

// ---------- GET: Health / เช็ก path จากเบราว์เซอร์ ----------
export function GET() {
  return NextResponse.json({
    ok: true,
    brand: BRAND_NAME,
    handle: LINE_HANDLE,
    hint: "LINE จะเรียก endpoint นี้ด้วย POST เท่านั้น",
  });
}