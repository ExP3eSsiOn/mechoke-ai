// app/api/debug/line/route.ts
export const runtime = "nodejs";

export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: "Missing LINE_CHANNEL_ACCESS_TOKEN" }, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
      status: 400,
    });
  }
  try {
    const res = await fetch("https://api.line.me/v2/bot/info", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: res.ok, status: res.status, data }, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
      status: res.ok ? 200 : res.status,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
      status: 500,
    });
  }
}