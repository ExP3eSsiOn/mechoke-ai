// app/api/admin/push/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { linePushText } from "@/lib/line";

export const runtime = "nodejs";

/**
 * POST /api/admin/push/preview
 * ส่ง preview message ไปยัง 1 user (สำหรับทดสอบ)
 *
 * Body: {
 *   userId: string,
 *   message: string
 * }
 */
export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const { userId, message } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { ok: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { ok: false, error: "message is required" },
        { status: 400 }
      );
    }

    // Send preview with header
    const previewMessage = `🔍 [PREVIEW]\n\n${message}`;
    await linePushText(userId, previewMessage);

    console.info("[push/preview] Preview sent to:", userId.substring(0, 12) + "...");

    return NextResponse.json({
      ok: true,
      message: "Preview sent successfully",
      userId: userId.substring(0, 12) + "...",
    });
  } catch (error) {
    console.error("[push/preview] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send preview" },
      { status: 500 }
    );
  }
}
