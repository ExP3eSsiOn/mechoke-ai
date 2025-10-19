// app/api/debug/status/route.ts
export const runtime = "edge"; // เร็ว + ประหยัด

type CheckResult = {
  configured: boolean;
  live?: boolean;
  note?: string;
  error?: string;
  extra?: Record<string, any>;
};

function has(v?: string | null) {
  return !!(v && String(v).trim().length > 0);
}

async function safeFetch(input: RequestInfo, init?: RequestInit, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort("timeout"), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ดึง origin ปัจจุบัน เพื่อนำไปเรียก /api/debug/line (Node runtime)
function getOrigin(req: Request) {
  const h = new Headers((req as any).headers || {});
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  return host ? `${proto}://${host}` : "";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const live = url.searchParams.get("live") === "1";

  const ts = new Date().toISOString();
  const brandName = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
  const lineHandle = process.env.LINE_OA_HANDLE ?? "@mechoke";

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY || "";
  const LUCKY_FEED_URL = process.env.LUCKY_FEED_URL || "";
  const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

  // ---- default checks (configured only) ----
  const checks: Record<string, CheckResult> = {
    openai: { configured: has(OPENAI_API_KEY) },
    newsapi: { configured: has(NEWSAPI_KEY) },
    luckyFeed: { configured: has(LUCKY_FEED_URL) },
    lineWebhook: { configured: has(LINE_CHANNEL_ACCESS_TOKEN) && has(LINE_CHANNEL_SECRET) },
    brand: { configured: true, extra: { brandName, lineHandle } },
  };

  // ---- live checks (on demand) ----
  if (live) {
    // OpenAI: ขอ /v1/models เพื่อยืนยัน key
    if (checks.openai.configured) {
      try {
        const r = await safeFetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        });
        checks.openai.live = r.ok;
        if (!r.ok) checks.openai.error = `HTTP ${r.status}`;
      } catch (e: any) {
        checks.openai.live = false;
        checks.openai.error = String(e?.message || e);
      }
      checks.openai.note = "เรียก /v1/models เพื่อเช็กการยืนยันตัวตนเท่านั้น";
    } else {
      checks.openai.note = "ไม่ตั้งค่า OPENAI_API_KEY";
    }

    // NewsAPI: พาดหัวไทย 1 ชิ้น
    if (checks.newsapi.configured) {
      try {
        const u = new URL("https://newsapi.org/v2/top-headlines");
        u.searchParams.set("country", "th");
        u.searchParams.set("pageSize", "1");
        const r = await safeFetch(u.toString(), { headers: { "X-Api-Key": NEWSAPI_KEY } });
        checks.newsapi.live = r.ok;
        if (!r.ok) checks.newsapi.error = `HTTP ${r.status}`;
      } catch (e: any) {
        checks.newsapi.live = false;
        checks.newsapi.error = String(e?.message || e);
      }
    } else {
      checks.newsapi.note = "ไม่ตั้งค่า NEWSAPI_KEY (ไม่จำเป็น หากใช้ RSS fallback หรือ LUCKY_FEED_URL)";
    }

    // LuckyFeed: ต้องเป็น JSON array
    if (checks.luckyFeed.configured) {
      try {
        const r = await safeFetch(LUCKY_FEED_URL);
        if (!r.ok) {
          checks.luckyFeed.live = false;
          checks.luckyFeed.error = `HTTP ${r.status}`;
        } else {
          const data = await r.json().catch(() => null);
          const ok = Array.isArray(data);
          checks.luckyFeed.live = ok;
          if (!ok) checks.luckyFeed.error = "ไม่ใช่ JSON array";
          if (ok) checks.luckyFeed.extra = { itemsPreview: data.slice?.(0, 2) ?? [] };
        }
      } catch (e: any) {
        checks.luckyFeed.live = false;
        checks.luckyFeed.error = String(e?.message || e);
      }
    } else {
      checks.luckyFeed.note = "ไม่ตั้งค่า LUCKY_FEED_URL ก็ได้ ระบบจะ fallback RSS อัตโนมัติ";
    }

    // LINE: proxy ไป Node runtime checker ที่ /api/debug/line
    if (checks.lineWebhook.configured) {
      try {
        const origin = getOrigin(req);
        if (!origin) {
          checks.lineWebhook.live = false;
          checks.lineWebhook.error = "no origin";
        } else {
          const r = await safeFetch(`${origin}/api/debug/line`, { cache: "no-store" }, 10000);
          const j = await r.json().catch(() => ({}));
          checks.lineWebhook.live = r.ok && !!j?.ok;
          if (!checks.lineWebhook.live) checks.lineWebhook.error = `status ${r.status}`;
          if (j?.data) checks.lineWebhook.extra = j.data;
        }
        checks.lineWebhook.note = "ตรวจผ่าน Node runtime ที่ /api/debug/line";
      } catch (e: any) {
        checks.lineWebhook.live = false;
        checks.lineWebhook.error = String(e?.message || e);
      }
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
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}