// lib/line.ts
import crypto from "crypto";

/* =========================
 * Types
 * ========================= */
export type LineTextMessage = { type: "text"; text: string };
export type LineFlexMessage = {
  type: "flex";
  altText: string;
  contents: any;
};
export type LineMessage = LineTextMessage | LineFlexMessage;

/* =========================
 * ENV & Defaults
 * ========================= */
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

const SIGNUP_URL   = (process.env.SIGNUP_URL   || "https://www.mechoke.com/").trim();
const LINE_ISSUE_URL = (process.env.LINE_ISSUE_URL || "https://lin.ee/t52Y9Nm").trim();
const TELEGRAM_URL = (process.env.TELEGRAM_URL || "https://t.me/+BR_qCVWcre40NTc9").trim();

/** รูปโปรเช็คอิน 7 วัน (ฝาก 300 รับของแถม 1 ชิ้น) */
const PROMO_IMG_URL = (process.env.PROMO_IMG_URL || "https://chokede.com/line.jpg").trim();

/* =========================
 * Helpers
 * ========================= */

/** เรียก LINE API พร้อมแนบ Bearer token */
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
    const err = await res.text().catch(() => "");
    throw new Error(`LINE ${path} error: ${res.status} ${err}`);
  }
  return res;
}

/** บังคับให้ URL เป็น https:// ที่ถูกต้อง หากไม่ผ่านให้ fallback เป็นรูปสำรอง */
function safeHttpsUrl(u: string): string {
  try {
    const url = new URL(u.trim());
    if (url.protocol.toLowerCase() !== "https:") throw new Error("non-https");
    return url.toString();
  } catch {
    // รูปสำรอง (CDN สาธารณะ)
    return "https://i.imgur.com/5L2q8cA.jpeg";
  }
}

/* =========================
 * LINE Messaging: reply / push
 * ========================= */
export async function lineReplyMessages(replyToken: string, messages: LineMessage[]) {
  await lineFetch("/v2/bot/message/reply", {
    method: "POST",
    body: JSON.stringify({ replyToken, messages }),
  });
}

export async function lineReplyText(replyToken: string, text: string) {
  return lineReplyMessages(replyToken, [{ type: "text", text }]);
}

/** ส่งข้อความแบบ push (ต้องมี userId/roomId/groupId) */
export async function linePush(to: string, messages: LineMessage[]) {
  await lineFetch("/v2/bot/message/push", {
    method: "POST",
    body: JSON.stringify({ to, messages }),
  });
}

/* =========================
 * Signature Verify (HMAC SHA256)
 * ========================= */
export function verifyLineSignature(rawBody: string, signature?: string | null) {
  if (!LINE_CHANNEL_SECRET || !signature) return false;
  const hmac = crypto.createHmac("sha256", LINE_CHANNEL_SECRET);
  hmac.update(rawBody);
  const expected = hmac.digest("base64");
  return expected === signature;
}

/* =========================
 * Flex Builders
 * ========================= */

/** โปรเช็คอิน 7 วัน: ฝากวันละ 300 เลือกรับของแถมฟรี 1 ชิ้น */
export function buildPromoFlex(opts?: { ctaUrl?: string }): LineFlexMessage {
  const cta = (opts?.ctaUrl || SIGNUP_URL).trim();
  const heroUrl = safeHttpsUrl(PROMO_IMG_URL);

  return {
    type: "flex",
    altText: "โปรเช็คอิน 7 วัน • ฝากวันละ 300 เลือกรับของแถมฟรี 1 ชิ้นค่ะ 🎁",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: heroUrl,          // ✅ ผ่านเงื่อนไข https:// เสมอ
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
            action: { type: "uri", label: "กดรับโปร", uri: cta },
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

/** การช่วยเหลือเมื่อเครดิตไม่เข้า */
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