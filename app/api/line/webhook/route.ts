// app/api/line/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  lineReplyMessages,
  lineReplyText,
  buildPromoFlex,
  buildCreditHelpFlex,
  LineMessage,
} from "@/lib/line";
import { buildPromoReplyFromText, promoSummary } from "@/lib/promos";
import { askAI } from "@/lib/ai";
import { trackUserId } from "@/lib/users";

export const runtime = "nodejs"; // ต้องใช้ Node เพื่อ verify HMAC

const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";

/** ---------------- Quick Router: คืนเป็น array ของข้อความ/เฟล็กซ์ ---------------- */
function routeQuickAnswerToMessages(text: string): LineMessage[] | null {
  const t = (text || "").trim().toLowerCase();

  // ขอ "รูปโปร" → ส่ง Flex โปรภาพ
  if (/(รูปโปร|โปรภาพ|promotion image|โปรโมชั่นแบบรูป)/i.test(t)) {
    return [buildPromoFlex({ ctaUrl: process.env.SIGNUP_URL || "https://www.mechoke.com/" })];
  }

  // โปรโมชัน
  if (/(โปร|promotion|โปรวันนี้|โปร พิเศษ|ฝาก 300|ของแถม|เช็คอิน|vip)/i.test(t)) {
    if (/(โปรวันนี้|โปร พิเศษ|มีโปรอะไรบ้าง|promotion)/i.test(t)) {
      return [{ type: "text", text: promoSummary() }];
    }
    const reply = buildPromoReplyFromText(text);
    if (reply) return [{ type: "text", text: reply }];
  }

  // เครดิตไม่เข้า
  if (/(เครดิต|เงิน|ยอด).*(ไม่เข้า|ไม่มา|หาย|ค้าง)/i.test(t)) {
    return [
      buildCreditHelpFlex(),
      {
        type: "text",
        text: [
          "น้องขออภัยในความไม่สะดวกนะคะ 🙏",
          "รบกวนแจ้ง 'ยูสเซอร์/เบอร์ที่สมัคร' + 'เวลา/ยอดฝาก' + 'ธนาคาร/สลิปย่อ'",
          `แอดมินจะตรวจสอบและอัปเดตให้โดยเร็วค่ะ ติดต่อ ${LINE_HANDLE}`,
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
          `ลิงก์สมัคร: ${process.env.SIGNUP_URL || "https://www.mechoke.com/"}`,
          "ฝากครั้งแรกวันนี้ รับของแถมฟรีทันทีค่ะ 🎁",
        ].join("\n"),
      },
    ];
  }

  // ถอนขั้นต่ำ
  if (/(ถอน|withdraw).*(เท่าไหร่|min|ขั้นต่ำ)/i.test(t)) {
    return [{ type: "text", text: "ถอนได้ขั้นต่ำ 100 บาทค่ะ ระบบอัตโนมัติ 24 ชม. ⏱️" }];
  }

  // เวลาออกผล/ปิดรับ (สรุปสั้น)
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

  return null; // ไม่เข้า Intent → ให้ Fallback ไป ChatGPT
}

/** ---------------- POST: LINE Webhook ---------------- */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") || undefined;
  const rawBody = await req.text();

  // Production: ตรวจลายเซ็น, Dev: ข้ามเพื่อเทสง่าย
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    const ok = verifyLineSignature(rawBody, signature);
    if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const events: any[] = body.events ?? [];

  for (const e of events) {
    try {
      // เก็บ userId ลงระบบ (สำหรับหน้า /push หรือ /api/debug/users)
      const uid =
        e?.source?.userId || e?.source?.roomId || e?.source?.groupId || undefined;
      if (uid) trackUserId(uid).catch(() => {});

      // รับเฉพาะ text message
      if (e.type !== "message" || e.message?.type !== "text") continue;

      const userText: string = e.message.text || "";
      console.info("[webhook] text:", userText);

      // 1) ตอบตาม Intent router ก่อน
      const intentMsgs = routeQuickAnswerToMessages(userText);
      if (intentMsgs && intentMsgs.length > 0) {
        console.info("[reply] via Router/Intent");
        await lineReplyMessages(e.replyToken, intentMsgs);
        continue;
      }

      // 2) Fallback → ChatGPT (ตอบทุกคำถามที่ไม่เข้า Intent)
      console.info("[reply] via ChatGPT Fallback");
      const aiText = await askAI(userText, {
        brandName: BRAND_NAME,
        lineHandle: LINE_HANDLE,
      });

      const finalText =
        (aiText && aiText.trim()) ||
        "น้องขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏";

      await lineReplyText(e.replyToken, finalText);
    } catch (err) {
      // แจ้งลูกค้าแบบสุภาพที่สุด
      try {
        await lineReplyText(
          e.replyToken,
          "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏"
        );
      } catch {}
      console.error("[webhook error]", err);
    }
  }

  return NextResponse.json({ ok: true });
}

/** ---------------- GET: Health ---------------- */
export function GET() {
  return NextResponse.json({
    ok: true,
    brand: BRAND_NAME,
    handle: LINE_HANDLE,
    hint: "LINE จะเรียก endpoint นี้ด้วย POST เท่านั้น",
  });
}