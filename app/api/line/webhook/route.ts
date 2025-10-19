// app/api/line/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  lineReplyMessages,
  lineReplyText,
  buildPromoFlex,
  buildCreditHelpFlex,
  LineMessage,
  buildLuckyNewsFlex,
} from "@/lib/line";
import { buildPromoReplyFromText, promoSummary } from "@/lib/promos";
import { findTimesByText, formatDrawList } from "@/lib/lotto-times";
import { answerLotteryAI, fetchLuckyNews } from "@/lib/ai";

export const runtime = "nodejs"; // HMAC ต้อง Node runtime

const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";

/** ---------------- Quick Router ---------------- */
function routeQuickAnswerToMessages(text: string): LineMessage[] | null {
  const t = (text || "").toLowerCase().trim();

  // ข่าวเลขเด็ดล่าสุด → ให้ handler หลักไปดึงข่าวแล้วส่ง Flex
  if (/(ข่าวหวย|ข่าวเลขเด็ด|เลขเด็ดจากข่าว|ข่าวล่าสุด.*(หวย|เลข)|ข่าว.*หวย|ข่าวหวยวันนี้)/i.test(t)) {
    return [{ type: "text", text: "__INTENT_NEWS__" } as any];
  }

  // ขอ "รูปโปร" เป็น Flex
  if (/(รูปโปร|โปรภาพ|promotion image|โปรโมชั่นแบบรูป)/i.test(t)) {
    return [buildPromoFlex({ ctaUrl: "https://your-signup-link.example" })];
  }

  // โปรโมชัน
  if (/(โปร|promotion|โปรวันนี้|โปร พิเศษ|ฝาก 300|ของแถม|เช็คอิน|vip)/i.test(t)) {
    if (/(โปรวันนี้|promotion|โปร พิเศษ|โปร ทั้งหมด|มีโปรอะไรบ้าง)/i.test(t)) {
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

  // เวลาออกผล/ปิดรับ
  if (/(เวลา|ออกผล|ปิดรับ|เปิดปิด|ตาราง).*(หวย|ลาว|ฮานอย|หุ้น|รัฐบาล|ยี่กี|ต่างประเทศ|ทั้งหมด)?/i.test(t)) {
    const list = findTimesByText(text);
    if (list.length) {
      return [{ type: "text", text: formatDrawList(list) }];
    }
    return [
      {
        type: "text",
        text: [
          "พิมพ์ชื่อกลุ่มที่ต้องการดูเวลาได้เลยค่ะ เช่น:",
          "• เวลาออกผล ลาว",
          "• เวลาออกผล ฮานอย",
          "• เวลาออกผล หุ้นไทย / หุ้นต่างประเทศ",
          "หรือพิมพ์: เวลาออกผลทั้งหมด",
        ].join("\n"),
      },
    ];
  }

  return null; // ไม่ตรง pattern → ให้ AI ตอบ
}

/** ---------------- POST: LINE Webhook ---------------- */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") || undefined;
  const rawBody = await req.text();

  // prod: ตรวจลายเซ็น / dev: ข้ามเพื่อเทสง่าย
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
      console.log("[webhook] text:", userText);

      let msgs = routeQuickAnswerToMessages(userText);

      // Intent ข่าว → ดึงข่าว & ส่ง Flex
      if (msgs && msgs.length === 1 && (msgs[0] as any).text === "__INTENT_NEWS__") {
        const news = await fetchLuckyNews();
        if (news.length > 0) {
          console.log("[reply] via Flex News");
          await lineReplyMessages(e.replyToken, [buildLuckyNewsFlex(news)]);
          continue;
        } else {
          console.log("[reply] news empty → AI text");
          const aiText = await answerLotteryAI("เลขเด็ดจากข่าวล่าสุด", new Date());
          await lineReplyMessages(e.replyToken, [{ type: "text", text: aiText }]);
          continue;
        }
      }

      // Router ตอบปกติ
      if (msgs && msgs.length > 0) {
        console.log("[reply] via Router/Intent");
        await lineReplyMessages(e.replyToken, msgs);
        continue;
      }

      // AI fallback (ข่าว/โซเชียล/ฝัน/มงคล/ทั่วไป)
      const aiText = await answerLotteryAI(userText, new Date());
      console.log("[reply] via AI");
      msgs = [{ type: "text", text: aiText }];
      await lineReplyMessages(e.replyToken, msgs);
    } catch (err) {
      console.error("[webhook error]", err);
      try {
        await lineReplyText(e.replyToken, "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏");
      } catch {}
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