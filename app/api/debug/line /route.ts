// app/api/debug/line/route.ts
export const runtime = "nodejs";

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  if (!token) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing LINE_CHANNEL_ACCESS_TOKEN" }, null, 2),
      {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
        status: 400,
      }
    );
  }

  try {
    const res = await fetchWithTimeout("https://api.line.me/v2/bot/info", {
      headers: { Authorization: `Bearer ${token}` },
    });

    let data: any = {};
    try { data = await res.json(); } catch {}

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, data }, null, 2),
      {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
        status: res.ok ? 200 : res.status,
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2),
      {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
        status: 500,
      }
    );
  }
}