// app/api/line/push/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildPromoFlex, buildLuckyNewsFlex, LineMessage } from "@/lib/line";
import { fetchLuckyNews } from "@/lib/ai";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

async function linePush(to: string, messages: LineMessage[]) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!res.ok) throw new Error(`LINE push error: ${res.status} ${await res.text()}`);
}

export async function POST(req: NextRequest) {
  // ตรวจสอบ authentication
  if (!verifyAdminToken(req)) {
    return unauthorizedResponse();
  }

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json({ error: "LINE token not configured" }, { status: 500 });
  }

  const { to, text, promo, luckyNews } = await req.json();

  if (!to) return NextResponse.json({ error: "`to` is required" }, { status: 400 });

  const msgs: LineMessage[] = [];

  if (promo) {
    msgs.push(buildPromoFlex({ ctaUrl: process.env.SIGNUP_URL || "https://www.mechoke.com/" }));
  } else if (luckyNews) {
    const items = await fetchLuckyNews(10);
    msgs.push(buildLuckyNewsFlex(items));
  } else if (text) {
    msgs.push({ type: "text", text: String(text) });
  } else {
    msgs.push({ type: "text", text: "ระบุ text หรือเลือก template (promo/luckyNews) ก่อนค่ะ" });
  }

  await linePush(to, msgs);
  return NextResponse.json({ ok: true, sent: msgs.length });
}