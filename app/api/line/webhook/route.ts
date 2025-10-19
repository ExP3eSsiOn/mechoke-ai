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

export const runtime = "nodejs";

const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";
const SIGNUP_URL = process.env.SIGNUP_URL || "https://www.mechoke.com/";
const LINE_ISSUE_URL = process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm";
const TELEGRAM_URL = process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9";

// ---------- Router (Quick answers – female tone) ----------
function routeQuickAnswerToMessages(text: string): LineMessage[] | null {
  const t = text.toLowerCase().trim();

  // รูปโปร (Flex)
  if (/(รูปโปร|โปรภาพ|promotion image|โปรโมชั่นแบบรูป)/i.test(t)) {
    return [buildPromoFlex({ ctaUrl: SIGNUP_URL })];
  }

  // โปรโมชัน
  if (/(โปร|promotion|โปรวันนี้|โปร พิเศษ|ฝาก 300|ของแถม|เช็คอิน|vip)/i.test(t)) {
    if (/(โปรวันนี้|มีโปรอะไรบ้าง|promotion)/i.test(t)) {
      return [{ type: "text", text: promoSummary() }];
    }
    const reply = buildPromoReplyFromText(text);
    if (reply) return [{ type: "text", text: reply }];
  }

  // เครดิตไม่เข้า
  if (/(เครดิต|เงิน|ยอด).*(ไม่เข้า|ไม่มา|หาย)/i.test(t)) {
    return [
      buildCreditHelpFlex(),
      {
        type: "text",
        text: [
          "ขออภัยในความไม่สะดวกนะคะ 🙏",
          "รบกวนแจ้ง 'ยูสเซอร์/เบอร์สมัคร' + 'เวลา/ยอดฝาก' + 'ธนาคาร/สลิปย่อ' ค่ะ",
          `แจ้งปัญหา: ${LINE_ISSUE_URL}`,
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
          `ลิงก์สมัคร: ${SIGNUP_URL}`,
          "ฝากครั้งแรกวันนี้ รับของแถมฟรีทันทีค่ะ 🎁",
        ].join("\n"),
      },
    ];
  }

  // ถอนขั้นต่ำ
  if (/(ถอน|withdraw).*(เท่าไหร่|min|ขั้นต่ำ)/i.test(t)) {
    return [{ type: "text", text: "ถอนได้ขั้นต่ำ 100 บาทค่ะ ระบบอัตโนมัติ 24 ชม. ⏱️" }];
  }

  // เวลาออกผล/ปิดรับ (ข้อความตัวอย่าง)
  if (/(หวย|ลาว|ฮานอย|หุ้น|เวลา|ออกผล|ปิดรับ)/i.test(t)) {
    return [
      {
        type: "text",
        text: [
          "⏰ เวลาออกผล/ปิดรับ (ตัวอย่าง) ค่ะ",
          "• ลาวพิเศษเที่ยง 12:30 น.",
          "• ลาวสบายดี 15:00 น.",
          "• ลาวก้าวหน้า 17:30 น.",
          "• ฮานอยปกติ 18:30 น.",
          "• หุ้นไทยรอบบ่าย 16:30 น.",
          `ประกาศผล: ${TELEGRAM_URL}`,
          `สอบถามเพิ่มเติมใน LINE OA ${LINE_HANDLE} ได้เลยค่ะ`,
        ].join("\n"),
      },
    ];
  }

  return null;
}

// ---------- POST: LINE Webhook ----------
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") || undefined;
  const rawBody = await req.text();

  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    const ok = verifyLineSignature(rawBody, signature);
    if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}");
  const events: any[] = body.events ?? [];

  for (const e of events) {
    try {
      await trackUserId(e?.source?.userId);

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

// ---------- GET: Health ----------
export function GET() {
  return NextResponse.json({
    ok: true,
    brand: BRAND_NAME,
    handle: LINE_HANDLE,
    signup: SIGNUP_URL,
    issue: LINE_ISSUE_URL,
    telegram: TELEGRAM_URL,
    hint: "LINE จะเรียก endpoint นี้ด้วย POST เท่านั้นค่ะ",
  });
}