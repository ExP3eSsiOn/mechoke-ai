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

export const runtime = "nodejs"; // ต้องใช้ Node เพื่อตรวจลายเซ็น HMAC

const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";
const SIGNUP_URL = process.env.SIGNUP_URL || "https://www.mechoke.com/";

/** ---------------- Admin-only: ข้อความที่ "บอทห้ามตอบ" ----------------
 * กรณีข้อความลักษณะนี้ควรเป็นแอดมินจริง ๆ ที่ส่งให้ลูกค้า ไม่ใช่บอท
 * ถ้าลูกค้าพิมพ์มาแบบนี้ บอทจะ "ไม่ตอบกลับ" (skip)
 */
const ADMIN_ONLY_PHRASES = [
  "เครดิตเข้าเรียบร้อย",
  "เครดิตเข้าเรียบร้อยแล้ว",
  "ขอให้เฮงๆ ปังๆ",
  "รอแอดมิน",
  "ดำเนินการให้แล้ว",
  "ตรวจสอบให้เรียบร้อย",
];

/** ---------------- Sensitive: เรื่องรหัสผ่าน/ยูส/เบอร์โทร ----------------
 * ข้อความที่ไม่ให้ AI ตอบ ให้ใช้สคริปต์แอดมินเท่านั้น
 */
const SENSITIVE_KEYWORDS = [
  "ขอรหัสผ่าน",
  "ลืมรหัสผ่าน",
  "จำรหัสผ่านไม่ได้",
  "ลืมยูส",
  "ยูสเซอร์",
  "ขอยูส",
  "รีเซ็ตรหัส",
  "เบอร์โทร",
  "เบอร์โทรศัพท์",
];

/** ---------------- Quick Router: คืนเป็น array ของข้อความ/เฟล็กซ์ ---------------- */
function routeQuickAnswerToMessages(text: string): LineMessage[] | null {
  const t = (text || "").trim().toLowerCase();

  // ขอ "รูปโปร" → ส่ง Flex โปรภาพ
  if (/(รูปโปร|โปรภาพ|promotion image|โปรโมชั่นแบบรูป)/i.test(t)) {
    return [buildPromoFlex({ ctaUrl: SIGNUP_URL })];
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

  // เวลาออกผล/ปิดรับ (สรุปสั้นตัวอย่าง)
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

/** ---------------- Helpers ---------------- */
function includesAny(text: string, list: string[]): boolean {
  const s = (text || "").toLowerCase();
  return list.some((kw) => s.includes(kw.toLowerCase()));
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
      // เก็บ userId/roomId/groupId ใช้กับ debug & push console
      const uid =
        e?.source?.userId || e?.source?.roomId || e?.source?.groupId || undefined;
      if (uid) trackUserId(uid).catch(() => {});

      // รับเฉพาะ text message
      if (e.type !== "message" || e.message?.type !== "text") continue;

      const userText: string = e.message.text || "";
      console.info("[webhook] text:", userText);

      // 0) Admin-only phrases → ไม่ตอบ (ให้เป็นข้อความที่แอดมินส่งเองเท่านั้น)
      if (includesAny(userText, ADMIN_ONLY_PHRASES)) {
        console.info("[skip] admin-only phrase detected. no bot reply.");
        continue;
      }

      // 1) Sensitive (รหัสผ่าน/ยูส/เบอร์โทร) → ไม่ส่งให้ AI ให้ใช้สคริปต์แอดมิน
      if (includesAny(userText, SENSITIVE_KEYWORDS)) {
        console.info("[reply] via Sensitive/Admin script");
        await lineReplyMessages(e.replyToken, [
          {
            type: "text",
            text:
              "แอดมินรบกวนขอเบอร์โทรคุณพี่หน่อยนะคะ 📞 เพื่อใช้ตรวจสอบและสะดวกรวดเร็วในการให้บริการค่ะ",
          },
          {
            type: "text",
            text: "รบกวนลูกค้ารอแอดมินดำเนินการสักครู่นะคะ 🙏",
          },
        ]);
        continue;
      }

      // 2) Intent router
      const intentMsgs = routeQuickAnswerToMessages(userText);
      if (intentMsgs && intentMsgs.length > 0) {
        console.info("[reply] via Router/Intent");
        await lineReplyMessages(e.replyToken, intentMsgs);
        continue;
      }

      // 3) Fallback → ChatGPT (ให้ AI ตอบทุกเรื่องที่เหลือ)
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