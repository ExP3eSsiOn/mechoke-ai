// app/api/dev/push/route.ts
import { NextRequest, NextResponse } from "next/server";
import { linePush, buildPromoFlex } from "@/lib/line";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "forbidden in production" }, { status: 403 });
  }

  const { userId, message } = await req.json();

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // ถ้ามี message ให้ส่งเป็นข้อความ, ถ้าไม่มีก็ส่ง Flex โปรตัวอย่าง
  if (typeof message === "string" && message.trim()) {
    await linePush(userId, [{ type: "text", text: message }]);
  } else {
    await linePush(userId, [buildPromoFlex({ ctaUrl: "https://mechoke.com" })]);
  }

  return NextResponse.json({ ok: true });
}