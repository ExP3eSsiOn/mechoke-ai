// lib/line.ts
import crypto from "crypto";

/** ========== Types ========== */
export type LineMessage =
  | { type: "text"; text: string }
  | {
      type: "flex";
      altText: string;
      contents: any; // LINE Flex JSON
    };

type ReplyBody = { replyToken: string; messages: LineMessage[] };
type PushBody = { to: string; messages: LineMessage[] };

/** ========== ENV ========== */
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";

/** ========== Verify Signature (HMAC-SHA256 base64) ========== */
export function verifyLineSignature(rawBody: string, signature?: string): boolean {
  if (!signature) return false;
  if (!CHANNEL_SECRET) return false;
  const hmac = crypto.createHmac("sha256", CHANNEL_SECRET).update(rawBody).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

/** ========== LINE Fetch Helper ========== */
async function lineFetch(path: string, init: RequestInit) {
  const res = await fetch(`https://api.line.me${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LINE ${path} error: ${res.status} ${text}`);
  }
  return res;
}

/** ========== LINE Reply / Push Helpers ========== */
export async function lineReplyMessages(replyToken: string, messages: LineMessage[]) {
  const body: ReplyBody = { replyToken, messages };
  await lineFetch("/v2/bot/message/reply", { method: "POST", body: JSON.stringify(body) });
}

export async function lineReplyText(replyToken: string, text: string) {
  await lineReplyMessages(replyToken, [{ type: "text", text }]);
}

/** ✅ NEW: Push message (ส่งหา userId โดยตรง ไม่ต้องมี replyToken) */
export async function linePush(to: string, messages: LineMessage[]) {
  const body: PushBody = { to, messages };
  await lineFetch("/v2/bot/message/push", { method: "POST", body: JSON.stringify(body) });
}

/** ========== Flex Templates ========== */

/** Promo Flex */
export function buildPromoFlex(opts?: { ctaUrl?: string }): LineMessage {
  const url = opts?.ctaUrl ?? "https://example.com/signup";
  return {
    type: "flex",
    altText: "โปรโมชันล่าสุด",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: process.env.PROMO_IMAGE_URL || "https://images.unsplash.com/photo-1554200876-56c2f25224fa?w=1200&q=80",
        size: "full",
        aspectMode: "cover",
        aspectRatio: "20:13",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: "โปรเช็คอิน 7 วัน", weight: "bold", size: "lg" },
          { type: "text", text: "ฝาก 300 ต่อเนื่อง 7 วัน เลือกรับของแถมฟรี 1 ชิ้น", size: "sm", wrap: true, color: "#666666" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "button", style: "primary", action: { type: "uri", label: "สมัคร / ดูโปร", uri: url } },
        ],
      },
    },
  };
}

/** Credit Help Flex */
export function buildCreditHelpFlex(): LineMessage {
  return {
    type: "flex",
    altText: "แจ้งเครดิตไม่เข้า",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "แจ้งเครดิตไม่เข้า", weight: "bold", size: "lg" },
          { type: "text", text: "กรุณาระบุ:", size: "sm", color: "#777777" },
          { type: "text", text: "• ยูสเซอร์/เบอร์ที่สมัคร", size: "sm" },
          { type: "text", text: "• เวลา/ยอดฝาก", size: "sm" },
          { type: "text", text: "• ธนาคาร/สลิปย่อ", size: "sm" },
        ],
      },
    },
  };
}

/** Lucky News Flex (Carousel) */
const NEWS_FALLBACK_IMAGE =
  process.env.NEWS_FALLBACK_IMAGE ||
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop";

function truncate(s: string, n: number) {
  if (!s) return "";
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

export function buildLuckyNewsFlex(
  items: Array<{ title: string; url: string; publishedAt?: string; source?: string; imageUrl?: string }>
): LineMessage {
  const bubbles = items.slice(0, 5).map((it) => {
    const title = truncate(it.title || "ข่าวเลขเด็ด", 70);
    const sub = [
      it.source ? it.source : null,
      it.publishedAt
        ? new Date(it.publishedAt).toLocaleString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          })
        : "ล่าสุด",
    ]
      .filter(Boolean)
      .join(" • ");

    const heroUrl = it.imageUrl || NEWS_FALLBACK_IMAGE;

    return {
      type: "bubble",
      hero: { type: "image", url: heroUrl, size: "full", aspectMode: "cover", aspectRatio: "20:13" },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: title, wrap: true, weight: "bold", size: "md" },
          { type: "text", text: sub, wrap: true, size: "xs", color: "#888888" },
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
            action: {
              type: "uri",
              label: "อ่านข่าว",
              uri: it.url || "https://google.com/search?q=เลขเด็ด",
            },
          },
        ],
      },
    };
  });

  const contents =
    bubbles.length > 0
      ? { type: "carousel", contents: bubbles }
      : {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "ยังไม่พบข่าวเลขเด็ดล่าสุด", weight: "bold", size: "lg" },
              { type: "text", text: "ลองอีกครั้งในไม่กี่นาที หรือพิมพ์: ข่าวหวยวันนี้", size: "sm", color: "#888888", wrap: true },
            ],
          },
        };

  return { type: "flex", altText: `ข่าวเลขเด็ด • ${BRAND_NAME}`, contents };
}