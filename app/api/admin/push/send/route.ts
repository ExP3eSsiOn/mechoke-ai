// app/api/admin/push/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { linePushText } from "@/lib/line";
import { savePushHistory } from "@/lib/push-history";

export const runtime = "nodejs";

/**
 * POST /api/admin/push/send
 * ส่ง bulk push messages ไปยัง users หลายคน
 *
 * Body: {
 *   userIds: string[],
 *   message: string,
 *   templateKey?: string
 * }
 */
export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const { userIds, message, templateKey } = body;

    // Validation
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "userIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "message is required" },
        { status: 400 }
      );
    }

    // Send to all users (with error handling)
    const results = await Promise.allSettled(
      userIds.map((userId) =>
        linePushText(userId, message).catch((err) => {
          console.error(`[push/send] Failed to send to ${userId}:`, err);
          throw err;
        })
      )
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    // Save to history
    await savePushHistory({
      timestamp: new Date().toISOString(),
      totalCount: userIds.length,
      successCount,
      failedCount,
      message: message.substring(0, 200),
      templateKey: templateKey || null,
    });

    console.info("[push/send] Bulk send completed:", {
      total: userIds.length,
      success: successCount,
      failed: failedCount,
    });

    return NextResponse.json({
      ok: true,
      totalCount: userIds.length,
      successCount,
      failedCount,
      message: `Sent to ${successCount}/${userIds.length} users`,
    });
  } catch (error) {
    console.error("[push/send] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send messages" },
      { status: 500 }
    );
  }
}
