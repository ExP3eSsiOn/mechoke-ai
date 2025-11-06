// lib/auth.ts
// Authentication utilities for admin/debug endpoints

/**
 * ตรวจสอบ admin token จาก request headers
 * @param request Request object
 * @returns true ถ้า authenticated, false ถ้าไม่ผ่าน
 */
export function verifyAdminToken(request: Request): boolean {
  const adminToken = process.env.ADMIN_TOKEN || process.env.LINE_CHANNEL_SECRET;

  if (!adminToken) {
    console.warn("[auth] ADMIN_TOKEN not configured - all admin requests will be rejected");
    return false;
  }

  // ตรวจสอบจาก Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token === adminToken) {
      return true;
    }
  }

  // ตรวจสอบจาก query parameter (สำหรับ dev/testing)
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken === adminToken) {
    return true;
  }

  return false;
}

/**
 * สร้าง Response สำหรับ unauthorized access
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Unauthorized - Invalid or missing admin token",
      hint: "Add Authorization: Bearer YOUR_TOKEN header or ?token=YOUR_TOKEN query param"
    }, null, 2),
    {
      status: 401,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      }
    }
  );
}
