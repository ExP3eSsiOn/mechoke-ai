// app/api/admin/quick-responses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/auth";
import { getAllQuickResponses, getQuickResponsesByTag } from "@/lib/quick-responses";

export const runtime = "edge";

/**
 * GET /api/admin/quick-responses
 * ดึง Quick Response Templates ทั้งหมด (สำหรับแอดมิน)
 */
export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");

  try {
    const responses = tag
      ? getQuickResponsesByTag(tag)
      : getAllQuickResponses();

    return NextResponse.json({
      ok: true,
      count: responses.length,
      data: responses.map((r) => ({
        key: r.key,
        text: r.text,
        keywords: r.keywords,
        tags: r.tags,
      })),
    });
  } catch (error) {
    console.error("[admin/quick-responses] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch quick responses" },
      { status: 500 }
    );
  }
}
