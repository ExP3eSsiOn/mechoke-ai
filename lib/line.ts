// lib/line.ts
import { createHmac } from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const CHANNEL_TOKEN  = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

const LINE_API_REPLY = "https://api.line.me/v2/bot/message/reply";
const LINE_API_PUSH  = "https://api.line.me/v2/bot/message/push";

// ---------- Types ----------
export type LineTextMessage = { type: "text"; text: string };
export type LineFlexMessage = {
  type: "flex";
  altText: string;
  contents: any; // Flex Bubble/Carousel JSON
};
export type LineMessage = LineTextMessage | LineFlexMessage;

// ---------- Verify Signature ----------
export function verifyLineSignature(bodyRaw: string, signatureHeader?: string) {
  if (!signatureHeader) return false;
  const hmac = createHmac("sha256", CHANNEL_SECRET).update(bodyRaw).digest("base64");
  return hmac === signatureHeader;
}

// ---------- Reply (array) ----------
export async function lineReplyMessages(replyToken: string, messages: LineMessage[]) {
  const res = await fetch(LINE_API_REPLY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CHANNEL_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const err = await res.text().catch(()=>"");
    throw new Error(`LINE reply error: ${res.status} ${err}`);
  }
}

// ---------- Reply (text shorthand) ----------
export async function lineReplyText(replyToken: string, text: string) {
  return lineReplyMessages(replyToken, [{ type: "text", text }]);
}

// ---------- Push (ส่งเชิงรุกไปยัง userId) ----------
export async function linePush(userId: string, messages: LineMessage[]) {
  const res = await fetch(LINE_API_PUSH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CHANNEL_TOKEN}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });
  if (!res.ok) {
    const err = await res.text().catch(()=>"");
    throw new Error(`LINE push error: ${res.status} ${err}`);
  }
}

// ---------- Flex Builders ----------
const BRAND = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";

// โปรฝาก 300 รับของแถม (Flex Bubble)
export function buildPromoFlex(options?: {
  giftTitle?: string; // ชื่อของแถม เช่น "Powerbank 10,000 mAh"
  ctaUrl?: string;    // ลิงก์สมัคร/โปร
}) : LineFlexMessage {
  const gift = options?.giftTitle ?? "ของแถมฟรี 1 ชิ้น";
  const url  = options?.ctaUrl ?? "https://your-signup-link.example";

  return {
    type: "flex",
    altText: "โปรฝาก 300 รับของแถมฟรี",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://placehold.co/1200x630?text=MECHOKE%20PROMO",
        size: "full",
        aspectRatio: "20:9",
        aspectMode: "cover"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: `${BRAND}`, weight: "bold", size: "xl" },
          { type: "text", text: "โปรฝากแรกพิเศษ!", size: "sm", color: "#888888" },
          { type: "separator", margin: "md" },
          {
            type: "box", layout: "vertical", spacing: "sm", margin: "md",
            contents: [
              { type: "text", text: "• ฝาก 300 บาท", size: "md" },
              { type: "text", text: `• เลือกรับ ${gift}`, size: "md" },
              { type: "text", text: `• ติดต่อ ${HANDLE}`, size: "sm", color: "#888888" },
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            action: { type: "uri", label: "รับสิทธิ์", uri: url }
          },
          {
            type: "button",
            style: "secondary",
            action: { type: "uri", label: "ติดต่อแอดมิน", uri: "https://line.me/R/ti/p/" }
          }
        ]
      }
    }
  };
}

// กรณีเครดิตไม่เข้า (Flex Bubble)
export function buildCreditHelpFlex(): LineFlexMessage {
  return {
    type: "flex",
    altText: "ตรวจสอบเครดิตไม่เข้า",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "ตรวจสอบเครดิตไม่เข้า", weight: "bold", size: "lg" },
          { type: "text", text: "โปรดแจ้งข้อมูลต่อไปนี้เพื่อช่วยตรวจสอบ:", size: "sm", color: "#666666" },
          { type: "text", text: "• ยูสเซอร์/เบอร์ที่สมัคร", size: "sm" },
          { type: "text", text: "• เวลา/ยอดฝาก", size: "sm" },
          { type: "text", text: "• ธนาคาร/สลิปย่อ", size: "sm" },
        ]
      }
    }
  };
}