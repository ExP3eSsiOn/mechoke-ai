// app/api/admin/quick-responses/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { getQuickResponse } from "@/lib/quick-responses";
import type { QuickResponseKey } from "@/lib/quick-responses";
import { linePushText } from "@/lib/line";

export const runtime = "nodejs"; // ต้องใช้ Node สำหรับ LINE SDK

/**
 * POST /api/admin/quick-responses/send
 * ส่งข้อความ Quick Response ให้ผู้ใช้ผ่าน LINE Push Message
 *
 * Body: {
 *   userId: string,
 *   templateKey: QuickResponseKey
 * }
 */
export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const { userId, templateKey } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { ok: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!templateKey || typeof templateKey !== "string") {
      return NextResponse.json(
        { ok: false, error: "templateKey is required" },
        { status: 400 }
      );
    }

    // ดึง template
    const template = getQuickResponse(templateKey as QuickResponseKey);
    if (!template) {
      return NextResponse.json(
        { ok: false, error: `Template '${templateKey}' not found` },
        { status: 404 }
      );
    }

    // ส่งข้อความผ่าน LINE Push
    await linePushText(userId, template.text);

    console.info("[admin/quick-responses/send] Sent:", {
      userId: userId.substring(0, 12) + "...",
      templateKey,
    });

    return NextResponse.json({
      ok: true,
      message: "Quick response sent successfully",
      templateKey,
      userId: userId.substring(0, 12) + "...",
    });
  } catch (error) {
    console.error("[admin/quick-responses/send] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send quick response" },
      { status: 500 }
    );
  }
}
