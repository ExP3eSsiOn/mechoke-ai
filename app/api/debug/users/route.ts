// app/api/debug/users/route.ts
import { NextResponse } from "next/server";
import { listUsers, getStats } from "@/lib/users";

export const runtime = "nodejs"; // ต้องใช้ Node ให้แชร์ memory ได้

export async function GET(req: Request) {
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "json").toLowerCase();
  const limit = Number(url.searchParams.get("limit") || "") || undefined;

  const stats = getStats();
  const users = listUsers(limit);

  if (format === "html") {
    const rows = users
      .map(
        (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${new Date(u.firstSeen).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</td>
        <td>${new Date(u.lastSeen).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</td>
        <td>${u.count}</td>
      </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Debug • Users</title>
<style>
body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b1220;color:#e5e7eb;margin:0;padding:24px}
.card{background:#0f172a;border:1px solid #1f2937;border-radius:16px;padding:16px;max-width:1100px;margin:0 auto}
h1{margin:0 0 8px 0;font-size:20px}
small{color:#9ca3af}
table{width:100%;border-collapse:collapse;margin-top:12px}
th,td{border-bottom:1px solid #1f2937;padding:8px 10px;text-align:left;font-size:12px}
th{color:#a3e635;background:#0b1328;position:sticky;top:0}
.badge{display:inline-block;border:1px solid #1f2937;border-radius:999px;padding:2px 8px;font-size:12px;color:#93c5fd}
.meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
a{color:#93c5fd;text-decoration:none}
a:hover{text-decoration:underline}
</style>
</head>
<body>
  <div class="card">
    <h1>LINE Users <span class="badge">total ${stats.total}</span></h1>
    <div class="meta">
      <div>Updated: <small>${stats.updatedAtISO}</small></div>
      <div>Most recent: <small>${stats.mostRecent ? stats.mostRecent.id : "-"}</small></div>
      <div>Use: <code>?format=html&limit=100</code></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>userId</th>
          <th>firstSeen</th>
          <th>lastSeen</th>
          <th>count</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>`}</tbody>
    </table>
  </div>
</body>
</html>`;
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json(
    { ok: true, stats, users },
    { headers: { "Cache-Control": "no-store" } }
  );
}