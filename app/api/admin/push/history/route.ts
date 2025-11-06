// app/api/admin/push/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { getPushHistory } from "@/lib/push-history";

export const runtime = "edge";

/**
 * GET /api/admin/push/history
 * ดึงประวัติการส่ง push messages
 */
export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const history = getPushHistory(limit);

    return NextResponse.json({
      ok: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("[push/history] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
