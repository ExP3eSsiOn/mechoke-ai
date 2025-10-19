// app/api/debug/users/route.ts
import { NextResponse } from "next/server";
import { listUsers, getStats } from "@/lib/users";

export const runtime = "nodejs"; // ใช้ Node runtime เพราะต้องการ global memory

// JSON API
export async function GET(req: Request) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "html";

  const stats = getStats();
  const users = listUsers(100);

  if (format === "json") {
    return NextResponse.json({
      ok: true,
      count: users.length,
      stats,
      users,
    });
  }

  // HTML Dashboard (สวยดูง่าย)
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

  const html = `
  <!DOCTYPE html>
  <html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>MECHOKE • LINE User Dashboard</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body {
        font-family: 'Inter', 'Prompt', sans-serif;
        background: radial-gradient(circle at top, #0f172a, #020617);
        color: #e2e8f0;
        margin: 0;
        padding: 2rem;
      }
      h1 {
        font-size: 1.6rem;
        margin-bottom: 0.3rem;
      }
      p.desc {
        color: #94a3b8;
        margin-top: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        overflow: hidden;
      }
      th, td {
        padding: 0.6rem 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      th {
        background: rgba(255,255,255,0.06);
        font-weight: 600;
      }
      tr:hover td {
        background: rgba(255,255,255,0.04);
      }
      footer {
        margin-top: 2rem;
        font-size: 0.8rem;
        color: #64748b;
      }
      .stats {
        margin-top: 1rem;
        display: flex;
        gap: 2rem;
      }
      .stats div {
        background: rgba(255,255,255,0.05);
        padding: 1rem 1.5rem;
        border-radius: 10px;
      }
      .stats span.num {
        display: block;
        font-size: 1.6rem;
        font-weight: bold;
        color: #22d3ee;
      }
    </style>
  </head>
  <body>
    <h1>📊 MECHOKE LINE User Dashboard</h1>
    <p class="desc">ตรวจสอบรายชื่อผู้ใช้ LINE ที่โต้ตอบกับบอทแบบเรียลไทม์</p>

    <div class="stats">
      <div>
        <span class="num">${stats.totalUsers}</span>
        ผู้ใช้ทั้งหมด
      </div>
      <div>
        <span class="num">${stats.activeToday}</span>
        ผู้ใช้วันนี้
      </div>
      <div>
        <span class="num">${users.length}</span>
        แสดงล่าสุด
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>First Seen</th>
          <th>Last Seen</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4" style="text-align:center;padding:1rem;">(ยังไม่มีข้อมูล)</td></tr>`}
      </tbody>
    </table>

    <footer>
      อัปเดตล่าสุด: ${new Date(stats.lastUpdated).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
      <br/>MECHOKE Admin Dashboard
    </footer>
  </body>
  </html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}