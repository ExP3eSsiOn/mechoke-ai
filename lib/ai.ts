// lib/ai.ts
import OpenAI from "openai";

/* ---------------- Types ---------------- */
export type LuckyItem = {
  title: string;
  url: string;
  imageUrl?: string | null;
  source?: string | null;
  publishedAt?: string | null;
};

/* ---------------- ENV ---------------- */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-4o-mini"; // เบา เร็ว คุ้มค่า

const BRAND_NAME = (process.env.BRAND_NAME || "มีโชคดอทคอม").trim();
const LINE_HANDLE = (process.env.LINE_OA_HANDLE || "@mechoke").trim();

/* ---------------- OpenAI client ---------------- */
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/* ---------------- Helpers ---------------- */
function withTimeout<T>(p: Promise<T>, ms = 12000) {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]) as Promise<T>;
}

async function fetchJSON(url: string) {
  const res = await withTimeout(fetch(url, { cache: "no-store" }));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* =========================================================
 * askAI — ให้บอทตอบแบบ "แอดมินผู้หญิง" โทนสุภาพ กระชับ
 * ใช้เมื่อ router ไม่เจอ intent ตรง ๆ
 * =======================================================*/
export async function askAI(
  userMsg: string,
  opts?: { brandName?: string; lineHandle?: string }
): Promise<string> {
  const brand = (opts?.brandName || BRAND_NAME).trim();
  const handle = (opts?.lineHandle || LINE_HANDLE).trim();

  const systemPrompt = `
คุณคือแอดมินผู้หญิงของแบรนด์ "${brand}" (LINE OA ${handle})
โทนการตอบ: สุภาพ อ่อนโยน มืออาชีพ กระชับ ใช้อิโมจิเล็กน้อย 😊
ขอบเขตคำตอบ: โปรโมชัน/วิธีสมัคร/ฝาก-ถอน/เครดิตไม่เข้า/เวลาออกผล-ปิดรับ/ช่องทางติดต่อ
หลักการ:
- ถ้าลูกค้าพูดเรื่อง "เครดิตไม่เข้า": ขอ 1) ยูสเซอร์หรือเบอร์ที่สมัคร 2) เวลา/ยอดฝาก 3) ธนาคาร/สลิปย่อ
- ถ้า "โปรโมชั่น": ย้ำโปรเช็คอิน 7 วัน ฝากวันละ 300 เลือกรับของแถมฟรี 1 ชิ้น และชวนกดลิงก์สมัคร
- ถ้าคำถามกว้างหรือไม่เกี่ยวข้อง ให้บอกอย่างสุภาพว่าอยู่นอกขอบเขต แล้วชวนให้ถามเรื่องบริการ
- ปิดท้ายเชิญชวนติดต่อได้ที่ ${handle} เมื่อเหมาะสม
ตอบเป็นภาษาไทยเท่านั้น
  `.trim();

  // ถ้าไม่ได้ตั้งค่า API key ให้คืน fallback ที่สุภาพ
  if (!openai) {
    return "น้องแอดมินขออนุญาตแจ้งนะคะ ระบบ AI ยังไม่พร้อมใช้งานชั่วคราวค่ะ หากต้องการสอบถามโปร/สมัคร/ฝาก-ถอน/เครดิตไม่เข้า สามารถพิมพ์มาได้เลย หรือทักหาแอดมินที่ LINE OA " + handle + " ได้ค่ะ 💬";
  }

  try {
    const resp = await withTimeout(
      openai.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.35,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
      }),
      15000
    );

    const text =
      resp.choices?.[0]?.message?.content?.trim() ||
      "น้องขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์อีกครั้งได้เลยนะคะ 🙏";
    return text;
  } catch (e: any) {
    // fallback เมื่อเรียก OpenAI ไม่สำเร็จ
    return "ขออภัยค่ะ ระบบ AI ตอบช้าเล็กน้อย หากสนใจโปรเช็คอิน 7 วัน ฝาก 300 ต่อเนื่อง เลือกรับของแถมฟรี 1 ชิ้น พิมพ์: โปรวันนี้ หรือทัก LINE OA " + handle + " ได้เลยค่ะ 💖";
  }
}

/* =========================================================
 * fetchLuckyNews — ดึงข่าวเลขเด็ด/ดวง/ความเชื่อ ล่าสุด
 * แหล่งข้อมูล:
 *   1) LUCKY_FEED_URL (ถ้ามี)
 *   2) NEXT_PUBLIC_BASE_URL + /api/lucky-feed (route ภายใน)
 * =======================================================*/
export async function fetchLuckyNews(limit = 5): Promise<LuckyItem[]> {
  const items: LuckyItem[] = [];

  // 1) ฟีดภายนอก (ถ้าตั้งค่าไว้)
  const FEED = process.env.LUCKY_FEED_URL?.trim();
  if (FEED) {
    try {
      const data = await fetchJSON(FEED);
      const arr: any[] = data?.items || data?.articles || data || [];
      for (const it of arr) {
        if (!it) continue;
        items.push({
          title: String(it.title ?? it.headline ?? "").trim(),
          url: String(it.url ?? it.link ?? "").trim(),
          imageUrl: it.imageUrl ?? it.image ?? it.thumbnail ?? null,
          source: it.source ?? it.site ?? null,
          publishedAt: it.publishedAt ?? it.pubDate ?? null,
        });
        if (items.length >= limit) break;
      }
    } catch {
      /* เงียบไว้แล้วไปแหล่งถัดไป */
    }
  }

  // 2) API ภายในโปรเจกต์
  if (items.length < limit) {
    const BASE = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
    if (BASE) {
      try {
        const data = await fetchJSON(`${BASE}/api/lucky-feed?limit=${limit}`);
        const arr: any[] = data?.items || [];
        for (const it of arr) {
          items.push({
            title: String(it.title ?? "").trim(),
            url: String(it.url ?? it.link ?? "").trim(),
            imageUrl: it.imageUrl ?? it.image ?? it.thumbnail ?? null,
            source: it.source ?? it.site ?? null,
            publishedAt: it.publishedAt ?? it.pubDate ?? null,
          });
          if (items.length >= limit) break;
        }
      } catch {
        /* no-op */
      }
    }
  }

  // กรองและตัดซ้ำ
  const uniq = new Map<string, LuckyItem>();
  for (const it of items) {
    if (!it?.title || !it?.url) continue;
    uniq.set(it.url, it);
  }
  return Array.from(uniq.values()).slice(0, limit);
}