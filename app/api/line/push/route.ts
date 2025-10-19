// app/api/line/push/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  linePush,
  buildPromoFlex,
  buildLuckyNewsFlex,
  LineMessage,
} from "@/lib/line";
import { fetchLuckyNews } from "@/lib/ai";

export const runtime = "nodejs"; // ใช้ Node runtime (ต้องยิงไป LINE API)

const PUSH_ADMIN_TOKEN = process.env.PUSH_ADMIN_TOKEN || ""; // ใส่ใน Vercel Env
const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";

/** ---------- Auth Helper ---------- */
function checkAuth(req: NextRequest): boolean {
  // ใน production ต้องมี Header: Authorization: Bearer <PUSH_ADMIN_TOKEN>
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    return !!PUSH_ADMIN_TOKEN && token === PUSH_ADMIN_TOKEN;
  }
  // dev โอเคไม่ต้องใช้ token (ทดสอบง่าย)
  return true;
}

/** ---------- Types ---------- */
type Payload = {
  to?: string;          // userId / roomId / groupId
  toList?: string[];    // ส่งหลายปลายทาง
  text?: string;        // ส่งข้อความปกติ
  promo?: boolean;      // ส่ง Flex โปรโมชัน
  luckyNews?: boolean;  // ส่ง Flex ข่าวเลขเด็ด (ดึงข่าวจริง)
};

/** ---------- POST: ส่ง Push ---------- */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Payload;

    const targets: string[] = Array.isArray(body.toList) && body.toList.length
      ? body.toList
      : body.to
      ? [body.to]
      : [];

    if (targets.length === 0) {
      return NextResponse.json({ error: "Missing 'to' or 'toList'" }, { status: 400 });
    }

    // สร้าง message ตาม payload
    const msgs: LineMessage[] = [];

    if (body.text) {
      msgs.push({ type: "text", text: body.text });
    }

    if (body.promo) {
      msgs.push(buildPromoFlex({ ctaUrl: "https://your-signup-link.example" }));
    }

    if (body.luckyNews) {
      const news = await fetchLuckyNews();
      if (news.length) {
        msgs.push(buildLuckyNewsFlex(news));
      } else {
        msgs.push({
          type: "text",
          text: "ยังไม่พบข่าวเลขเด็ดล่าสุดในขณะนี้ค่ะ 🗞️ ลองอีกครั้งภายหลังนะคะ",
        });
      }
    }

    if (msgs.length === 0) {
      return NextResponse.json(
        { error: "No message to send. Provide 'text' or 'promo' or 'luckyNews'." },
        { status: 400 }
      );
    }

    // ส่งทีละปลายทาง (เรียบง่ายและชัดเจน)
    let okCount = 0;
    const errors: Array<{ to: string; error: string }> = [];

    for (const to of targets) {
      try {
        await linePush(to, msgs);
        okCount++;
      } catch (e: any) {
        errors.push({ to, error: e?.message || "unknown error" });
      }
    }

    return NextResponse.json({
      ok: true,
      brand: BRAND_NAME,
      sent: okCount,
      failed: errors,
      messageCount: msgs.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Bad Request" }, { status: 400 });
  }
}

/** ---------- GET: Health ---------- */
export function GET() {
  return NextResponse.json({
    ok: true,
    info: "POST this endpoint with Authorization: Bearer <PUSH_ADMIN_TOKEN> to push LINE messages.",
    brand: BRAND_NAME,
    requiredHeaders: ["Authorization: Bearer <token>"],
    acceptedFields: {
      to: "string (userId/roomId/groupId)",
      toList: "string[]",
      text: "string",
      promo: "boolean",
      luckyNews: "boolean",
    },
  });
}