// app/api/debug/status/route.ts
export const runtime = "edge"; // เร็ว + ประหยัด

type CheckResult = {
  configured: boolean;
  live?: boolean;
  note?: string;
  error?: string;
  extra?: Record<string, any>;
};

function bool(v: any) {
  return !!(v && String(v).trim().length > 0);
}

async function safeFetch(input: RequestInfo, init?: RequestInit, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort("timeout"), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const live = url.searchParams.get("live") === "1"; // เพิ่ม ?live=1 เพื่อทดสอบต่อภายนอกแบบเบาๆ

  const ts = new Date().toISOString();
  const brandName = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
  const lineHandle = process.env.LINE_OA_HANDLE ?? "@mechoke";

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY || "";
  const LUCKY_FEED_URL = process.env.LUCKY_FEED_URL || "";
  const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

  // --- Checks ---
  const checks: Record<string, CheckResult> = {
    openai: { configured: bool(OPENAI_API_KEY) },
    newsapi: { configured: bool(NEWSAPI_KEY) },
    luckyFeed: { configured: bool(LUCKY_FEED_URL) },
    lineWebhook: { configured: bool(LINE_CHANNEL_ACCESS_TOKEN) && bool(LINE_CHANNEL_SECRET) },
    brand: { configured: true, extra: { brandName, lineHandle } },
  };

  if (live) {
    // OpenAI live check: เรียก /v1/models แบบเบาๆ
    if (checks.openai.configured) {
      try {
        const res = await safeFetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        });
        checks.openai.live = res.ok;
        if (!res.ok) checks.openai.error = `HTTP ${res.status}`;
      } catch (e: any) {
        checks.openai.live = false;
        checks.openai.error = String(e?.message || e);
      }
      checks.openai.note = "เรียก /v1/models เพื่อเช็กการยืนยันตัวตนเท่านั้น";
    } else {
      checks.openai.note = "ไม่ตั้งค่า OPENAI_API_KEY";
    }

    // NewsAPI live check: หัวข่าวไทย 1 รายการ
    if (checks.newsapi.configured) {
      try {
        const u = new URL("https://newsapi.org/v2/top-headlines");
        u.searchParams.set("country", "th");
        u.searchParams.set("pageSize", "1");
        const res = await safeFetch(u.toString(), { headers: { "X-Api-Key": NEWSAPI_KEY } });
        checks.newsapi.live = res.ok;
        if (!res.ok) checks.newsapi.error = `HTTP ${res.status}`;
      } catch (e: any) {
        checks.newsapi.live = false;
        checks.newsapi.error = String(e?.message || e);
      }
    } else {
      checks.newsapi.note = "ไม่ตั้งค่า NEWSAPI_KEY (ไม่จำเป็น หากใช้ RSS fallback หรือ LUCKY_FEED_URL)";
    }

    // LUCKY_FEED_URL live check: คาดหวัง JSON array
    if (checks.luckyFeed.configured) {
      try {
        const res = await safeFetch(LUCKY_FEED_URL);
        if (!res.ok) {
          checks.luckyFeed.live = false;
          checks.luckyFeed.error = `HTTP ${res.status}`;
        } else {
          const data = await res.json().catch(() => null);
          const ok = Array.isArray(data);
          checks.luckyFeed.live = ok;
          if (!ok) checks.luckyFeed.error = "ไม่ใช่ JSON array";
          if (ok) checks.luckyFeed.extra = { items: data.slice?.(0, 2) ?? [] };
        }
      } catch (e: any) {
        checks.luckyFeed.live = false;
        checks.luckyFeed.error = String(e?.message || e);
      }
    } else {
      checks.luckyFeed.note = "ไม่ตั้งค่า LUCKY_FEED_URL ก็ได้ ระบบจะ fallback RSS อัตโนมัติ";
    }

    // LINE live check: เรียก /v2/bot/info เพื่อตรวจ token
    if (checks.lineWebhook.configured) {
      try {
        const res = await safeFetch("https://api.line.me/v2/bot/info", {
          headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
        });
        checks.lineWebhook.live = res.ok;
        if (!res.ok) {
          checks.lineWebhook.error = `HTTP ${res.status}`;
        } else {
          const info = await res.json().catch(() => null);
          checks.lineWebhook.extra = info ? { basicId: info.basicId, userId: info.userId, displayName: info.displayName } : undefined;
        }
      } catch (e: any) {
        checks.lineWebhook.live = false;
        checks.lineWebhook.error = String(e?.message || e);
      }
      checks.lineWebhook.note = "เรียก /v2/bot/info เพื่อตรวจสอบ Channel access token";
    } else {
      checks.lineWebhook.note = "กรุณาตั้งค่า LINE_CHANNEL_ACCESS_TOKEN และ LINE_CHANNEL_SECRET";
    }
  }

  const body = {
    ok: true,
    time: ts,
    mode: live ? "live" : "configured-only",
    brand: { name: brandName, handle: lineHandle },
    checks,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}