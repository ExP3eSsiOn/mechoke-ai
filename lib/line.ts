// lib/line.ts
import crypto from "crypto";

export type LineTextMessage = { type: "text"; text: string };
export type LineFlexMessage = {
  type: "flex";
  altText: string;
  contents: any;
};
export type LineMessage = LineTextMessage | LineFlexMessage;

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

// ---------- HTTP helpers ----------
async function lineFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.line.me${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LINE API error: ${res.status} ${text}`);
  }
  return res;
}

// ---------- Reply / Push ----------
export async function lineReplyMessages(replyToken: string, messages: LineMessage[]) {
  await lineFetch("/v2/bot/message/reply", {
    method: "POST",
    body: JSON.stringify({ replyToken, messages }),
  });
}

export async function lineReplyText(replyToken: string, text: string) {
  return lineReplyMessages(replyToken, [{ type: "text", text }]);
}

export async function linePush(to: string, messages: LineMessage[]) {
  await lineFetch("/v2/bot/message/push", {
    method: "POST",
    body: JSON.stringify({ to, messages }),
  });
}

// ---------- Signature verify (HMAC) ----------
export function verifyLineSignature(body: string, signature?: string | null) {
  if (!LINE_CHANNEL_SECRET) return false;
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", LINE_CHANNEL_SECRET);
  hmac.update(body);
  const expected = hmac.digest("base64");
  return expected === signature;
}

// ---------- Flex builders (อัปเดตลิงก์ใหม่) ----------
const SIGNUP_URL = process.env.SIGNUP_URL || "https://www.mechoke.com/";
const LINE_ISSUE_URL = process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm";
const TELEGRAM_URL = process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9";

/**
 * โปรเช็คอิน 7 วัน: ฝากวันละ 300 เลือกรับของแถมฟรี 1 ชิ้น
 * hero image อัปเดตเป็น https://chokede.com/line.jpg
 */
export function buildPromoFlex(opts?: { ctaUrl?: string }): LineFlexMessage {
  const url = opts?.ctaUrl || SIGNUP_URL;
  return {
    type: "flex",
    altText: "โปรเช็คอิน 7 วัน • ฝากวันละ 300 เลือกรับของแถมฟรี 1 ชิ้นค่ะ 🎁",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://chokede.com/line.jpg", // ⬅️ อัปเดตตามที่แจ้ง
        size: "full",
        aspectRatio: "16:9",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "โปรเช็คอิน 7 วัน", weight: "bold", size: "lg" },
          { type: "text", text: "ฝากวันละ 300 เลือกรับของแถมฟรี 1 ชิ้นค่ะ", size: "sm", color: "#888888", wrap: true },
          { type: "separator" },
          { type: "text", text: "จำนวนจำกัด รีบกดรับสิทธิ์นะคะ ✨", size: "sm", color: "#666666", wrap: true },
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
            color: "#22c55e",
            action: { type: "uri", label: "กดรับโปร", uri: url },
          },
          {
            type: "button",
            style: "secondary",
            action: { type: "uri", label: "แจ้งปัญหา (LINE)", uri: LINE_ISSUE_URL },
          },
          {
            type: "button",
            style: "link",
            action: { type: "uri", label: "เข้ากลุ่มเทเลแกรม (ผลรางวัล)", uri: TELEGRAM_URL },
          },
        ],
      },
    },
  };
}

export function buildCreditHelpFlex(): LineFlexMessage {
  return {
    type: "flex",
    altText: "เครดิตไม่เข้าทำยังไงดีคะ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "เครดิตไม่เข้า แก้ยังไงดีคะ? 🛠️", weight: "bold", size: "lg" },
          {
            type: "text",
            text:
              "รบกวนแจ้งข้อมูล 3 อย่างนี้นะคะ:\n1) ยูสเซอร์/เบอร์ที่สมัคร\n2) เวลา/ยอดฝาก\n3) ธนาคาร/สลิปย่อ",
            wrap: true,
            size: "sm",
            color: "#666666",
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
            style: "primary",
            color: "#0ea5e9",
            action: { type: "uri", label: "แจ้งปัญหา (LINE)", uri: LINE_ISSUE_URL },
          },
          {
            type: "button",
            style: "link",
            action: { type: "uri", label: "สมัครสมาชิก", uri: SIGNUP_URL },
          },
        ],
      },
    },
  };
}