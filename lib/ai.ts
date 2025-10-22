// lib/ai.ts
import OpenAI from "openai";

export type AskAIContext = { brandName?: string; lineHandle?: string };

export type LuckyItem = {
  title: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function askAI(userText: string, ctx: AskAIContext = {}): Promise<string> {
  const brand = ctx.brandName || process.env.BRAND_NAME || "มีโชคดอทคอม";
  const handle = ctx.lineHandle || process.env.LINE_OA_HANDLE || "@mechoke";

  const systemPrompt = `
คุณคือ "แอดมินผู้หญิง" ของแบรนด์ ${brand} (LINE OA ${handle})
สไตล์: สุภาพ อ่อนโยน อบอุ่น กระชับ ใส่อีโมจิพอดี
คุยได้ทั้งโปร/วิธีใช้/เครดิต/เวลาออกผล รวมถึงความฝัน เลขมงคล ดวง ข่าวเลขเด็ด (เชิงตีความ ไม่ฟันธงเลข)
ถ้าคุยเรื่องใช้งาน ให้แนะลิงก์สมัคร ${process.env.SIGNUP_URL || "https://www.mechoke.com/"} หรือช่องทางติดต่อ ${handle} อย่างเหมาะสม
ภาษาไทยเท่านั้น
  `.trim();

  const userPrompt = `
ลูกค้าพิมพ์: "${userText}"

สิ่งที่ต้องทำ:
1) ตอบโทนผู้หญิงสุภาพ น่ารัก อ่านง่าย
2) ความฝัน/ดวง/เลขมงคล: ตอบเชิงความเชื่อ/ตีความ ไม่ฟันธงเลขตรงๆ
3) เกี่ยวกับบริการ ${brand} ให้แนบลิงก์ที่จำเป็นอย่างพอดี
4) กระชับ และใช้อีโมจิพอดี
  `.trim();

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return resp.choices?.[0]?.message?.content?.trim()
      || "น้องขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏";
  } catch (e) {
    console.error("[askAI error]", e);
    return "ขออภัยค่ะ ระบบ AI ขัดข้องชั่วคราว ลองพิมพ์ใหม่อีกครั้งได้เลยนะคะ 🙏";
  }
}

/** ใช้ใน /api/line/push (ถ้ามี) เพื่อดึงข่าวเลขเด็ด/ดวงจาก endpoint ภายในโปรเจกต์ */
export async function fetchLuckyNews(limit = 5): Promise<LuckyItem[]> {
  const internalOrigin =
    process.env.LUCKY_INTERNAL_ORIGIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const endpoints = [internalOrigin ? `${internalOrigin}/api/lucky-feed` : ""].filter(Boolean) as string[];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { method: "GET", cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const items: LuckyItem[] = Array.isArray(data?.items)
        ? data.items.map((it: any) => ({
            title: String(it.title || ""),
            url: String(it.url || it.link || ""),
            imageUrl: it.imageUrl ? String(it.imageUrl) : undefined,
            source: it.source ? String(it.source) : undefined,
            publishedAt: it.publishedAt ? String(it.publishedAt) : undefined,
          }))
        : [];
      if (items.length) return items.slice(0, limit);
    } catch {}
  }
  return [];
}