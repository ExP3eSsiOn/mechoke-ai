// lib/ai.ts
import OpenAI from "openai";

/** ============== Types ============== */
export type AskAIContext = {
  brandName?: string;
  lineHandle?: string;
};

export type LuckyItem = {
  title: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * askAI
 * - ให้ ChatGPT ตอบ “ทุกหัวข้อ” (รวมถึงความฝัน/ดวง/เลขมงคล/ข่าวเชิงตีความ)
 * - โทนผู้หญิง สุภาพ อบอุ่น ใส่อีโมจิพอดี
 */
export async function askAI(userText: string, ctx: AskAIContext = {}): Promise<string> {
  const brand = ctx.brandName || process.env.BRAND_NAME || "มีโชคดอทคอม";
  const handle = ctx.lineHandle || process.env.LINE_OA_HANDLE || "@mechoke";

  const systemPrompt = `
คุณคือ "แอดมินผู้หญิง" ของแบรนด์ ${brand} (LINE OA ${handle})
สไตล์: สุภาพ อ่อนโยน อบอุ่น กระชับ ใช้อีโมจิเล็กน้อย เช่น 💖✨🍀
ขอบเขต: คุยได้ทั้ง โปร/วิธีใช้งาน/เครดิต/เวลาออกผล รวมถึง ความฝัน เลขมงคล ดวง ข่าวเลขเด็ด (อธิบายเชิงตีความ/ความเชื่อ ไม่ฟันธงเลขตรงๆ)
แนวทาง:
- เรื่องความฝัน/ดวง/เลขมงคล: ให้มุมมองเชิงบวกและข้อคิด ไม่รับรองผล
- ถ้าเกี่ยวกับการใช้งาน ${brand}: แนบลิงก์ที่จำเป็น เช่น สมัคร ${process.env.SIGNUP_URL || "https://www.mechoke.com/"} หรือช่องทางติดต่อ ${handle} เมื่อเหมาะสม
- ภาษาไทยเท่านั้น
  `.trim();

  const userPrompt = `
ลูกค้าพิมพ์: "${userText}"

สิ่งที่ต้องทำ:
1) ตอบด้วยโทนผู้หญิงสุภาพ เป็นธรรมชาติ อ่านง่าย
2) เรื่องความฝัน/ดวง/เลขมงคล: ตอบเชิงตีความหรือบริบทความเชื่อ หลีกเลี่ยงการฟันธงเลขตรงๆ
3) หากเกี่ยวกับการใช้งาน ${brand}: ช่วยชี้ทางสมัคร/ติดต่ออย่างเหมาะสม
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

    const text = resp.choices?.[0]?.message?.content?.trim();
    return text || "น้องขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏";
  } catch (err) {
    console.error("[askAI error]", err);
    return "ขออภัยค่ะ ระบบ AI ขัดข้องชั่วคราว ลองพิมพ์ใหม่อีกครั้งได้เลยนะคะ 🙏";
  }
}

/**
 * fetchLuckyNews
 * - ดึง “ข่าวเลขเด็ด/ดวง/ความเชื่อ” ผ่าน endpoint ภายใน /api/lucky-feed
 * - ไม่บังคับต้องมี NewsAPI (ถ้ามี LUCKY_FEED_URL ฝั่ง API จะไปดึง/แปลงให้อยู่แล้ว)
 * - ถ้าเรียกไม่ได้ ให้คืน [] เพื่อไม่ทำให้บิ้วด์/รันล้ม
 */
export async function fetchLuckyNews(limit = 5): Promise<LuckyItem[]> {
  // พยายามหา origin เพื่อเรียก endpoint ภายในโปรเจกต์
  const internalOrigin =
    process.env.LUCKY_INTERNAL_ORIGIN || // กำหนดเองได้ เช่น https://mechoke-ai.vercel.app
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const candidates = [
    internalOrigin ? `${internalOrigin}/api/lucky-feed` : "", // โปรดตั้ง LUCKY_INTERNAL_ORIGIN หรือใช้ VERCEL_URL
  ].filter(Boolean) as string[];

  for (const endpoint of candidates) {
    try {
      const res = await fetch(`${endpoint}`, { method: "GET", cache: "no-store" });
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
      if (items.length > 0) return items.slice(0, limit);
    } catch (e) {
      // ลองตัวถัดไป
    }
  }

  // ถ้ายังไม่ได้อะไร ให้คืน [] ไม่ทำให้ระบบพัง
  return [];
}