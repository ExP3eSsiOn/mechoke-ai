// lib/line.ts
import crypto from "crypto";
import type { LuckyItem } from "./ai";

/** Types */
export type LineTextMessage = { type: "text"; text: string };
export type LineFlexMessage = { type: "flex"; altText: string; contents: any };
export type LineMessage = LineTextMessage | LineFlexMessage;

/** ENV */
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

const SIGNUP_URL = (process.env.SIGNUP_URL || "https://www.mechoke.com/").trim();
const LINE_ISSUE_URL = (process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm").trim();
const TELEGRAM_URL = (process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9").trim();

/** รูปโปรเช็คอิน 7 วัน (ฝาก 300 รับของแถม 1 ชิ้น) */
const PROMO_IMG_URL = (process.env.PROMO_IMG_URL || "https://chokede.com/line.jpg").trim();

/** Verify LINE Signature (HMAC-SHA256) */
export function verifyLineSignature(rawBody: string, signature?: string): boolean {
  if (!signature || !LINE_CHANNEL_SECRET) return false;
  const mac = crypto.createHmac("sha256", LINE_CHANNEL_SECRET).update(rawBody).digest("base64");
  return mac === signature;
}

/** LINE Reply */
export async function lineReplyMessages(replyToken: string, messages: LineMessage[]) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE /v2/bot/message/reply error: ${res.status} ${text}`);
  }
}

export async function lineReplyText(replyToken: string, text: string) {
  return lineReplyMessages(replyToken, [{ type: "text", text }]);
}

/** ✅ LINE Push (ให้ route dev/prod ใช้ได้) */
export async function linePush(to: string, messages: LineMessage[]) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE /v2/bot/message/push error: ${res.status} ${text}`);
  }
}

/** Promo Flex (รูป + ปุ่ม) */
export function buildPromoFlex(opts?: { ctaUrl?: string }): LineFlexMessage {
  const url = (opts?.ctaUrl || SIGNUP_URL).trim();
  return {
    type: "flex",
    altText: "โปรเช็คอิน 7 วัน ฝากวันละ 300 รับของแถม 1 ชิ้น",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: PROMO_IMG_URL, // ต้องเป็น https
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: "เช็คอิน 7 วัน", weight: "bold", size: "lg", wrap: true },
          { type: "text", text: "ฝากวันละ 300 • รับของแถม 1 ชิ้น", size: "sm", wrap: true },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            action: { type: "uri", label: "สมัคร/เช็คอิน", uri: url },
          },
          {
            type: "button",
            style: "secondary",
            action: { type: "uri", label: "ติดตามผลรางวัล (Telegram)", uri: TELEGRAM_URL },
          },
        ],
      },
    },
  };
}

/** Credit Help Flex */
export function buildCreditHelpFlex(): LineFlexMessage {
  return {
    type: "flex",
    altText: "แจ้งปัญหาเครดิตไม่เข้า",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: "เครดิตไม่เข้า", weight: "bold", size: "lg", wrap: true },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              { type: "text", text: "• ยูสเซอร์/เบอร์ที่สมัคร", size: "sm", wrap: true },
              { type: "text", text: "• เวลา/ยอดฝาก", size: "sm", wrap: true },
              { type: "text", text: "• ธนาคาร/สลิปย่อ", size: "sm", wrap: true },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "secondary",
            action: { type: "uri", label: "แจ้งปัญหา (LINE)", uri: LINE_ISSUE_URL },
          },
        ],
      },
    },
  };
}

/** (ออปชัน) แปลงข่าวเป็น Flex Carousel – ใช้ใน /api/line/push */
export function buildLuckyNewsFlex(items: LuckyItem[]): LineFlexMessage {
  const bubbles = (items || []).slice(0, 10).map((it) => ({
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: it.title || "อัปเดตข่าว", weight: "bold", size: "md", wrap: true },
        ...(it.source ? [{ type: "text", text: it.source, size: "xs", wrap: true }] : []),
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "button", style: "primary", action: { type: "uri", label: "อ่านข่าว", uri: it.url || SIGNUP_URL } },
      ],
    },
  }));

  return {
    type: "flex",
    altText: "ข่าวเลขเด็ด/ดวงอัปเดต",
    contents: bubbles.length
      ? { type: "carousel", contents: bubbles }
      : {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              { type: "text", text: "ยังไม่มีข่าวอัปเดตในขณะนี้ค่ะ", weight: "bold", size: "lg", wrap: true },
              { type: "text", text: "ลองใหม่อีกครั้ง หรือพิมพ์: โปรวันนี้", size: "sm", wrap: true },
            ],
          },
        },
  };
}