// lib/ai.ts
import OpenAI from "openai";

/** ===== ENV & Branding ===== */
const BRAND_NAME = process.env.BRAND_NAME ?? "มีโชคดอทคอม";
const LINE_HANDLE = process.env.LINE_OA_HANDLE ?? "@mechoke";
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";
const NEWSAPI_KEY = process.env.NEWSAPI_KEY ?? "";
const SERPAPI_KEY = process.env.SERPAPI_KEY ?? "";
const LUCKY_FEED_URL = process.env.LUCKY_FEED_URL ?? ""; // JSON: [{title,url,publishedAt,source?,imageUrl?}]

/** ===== OpenAI (optional) ===== */
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

/** ===== Utilities ===== */
const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";
function thaiToArabic(s: string): string {
  return s.replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));
}
function extractNumbersFromText(text: string): string[] {
  const t = thaiToArabic(text || "");
  const tokens = t.match(/\b\d{1,6}\b/g) || [];
  const hy = t.match(/\b\d(?:[-–]\d){1,3}\b/g) || [];
  return Array.from(new Set([...tokens, ...hy]));
}
function footerNote() {
  return "⚠️ ใช้วิจารณญาณในการเสี่ยงโชค โปรดเล่นอย่างรับผิดชอบ และตั้งงบประมาณที่เหมาะสม";
}

/** ===== Intents ===== */
type Intent =
  | "LUCKY_FROM_NEWS"
  | "LUCKY_FROM_SOCIAL"
  | "LUCKY_FROM_DREAM"
  | "LUCKY_GENERAL"
  | "BELIEF_FAITH"
  | "UNKNOWN";

function detectIntent(text: string): Intent {
  const t = (text || "").toLowerCase().trim();

  if (/(ข่าว|พาดหัว|ล่าสุด).*(เลข|หวย|เลขเด็ด|งวด)/i.test(t) || /(เลขเด็ด|หวย).*(ข่าว|ล่าสุด)/i.test(t))
    return "LUCKY_FROM_NEWS";

  if (/(โซเชียล|ติ๊กต็อก|tiktok|เฟซ|facebook|ไอจี|instagram|x |ทวิต|twitter).*(เลข|หวย|งวด|มาแรง|ไวรัล)/i.test(t))
    return "LUCKY_FROM_SOCIAL";

  if (/(ฝัน|ทำนายฝัน|ความฝัน)/i.test(t))
    return "LUCKY_FROM_DREAM";

  if (/(เลขมงคล|โชคลาภ|เสริมดวง|ฤกษ์|ศาล|วัด|ไหว้|ความเชื่อ|วัตถุมงคล)/i.test(t))
    return "BELIEF_FAITH";

  if (/(เลขเด็ด|ขอเลข|แนะเลข|เบอร์มงคล|ป้ายทะเบียน|อายุ|บ้านเลขที่|เลขมาแรง)/i.test(t))
    return "LUCKY_GENERAL";

  return "UNKNOWN";
}

/** ===== Dream Dictionary ===== */
type DreamRule = { keywords: string[]; numbers: string[]; tip?: string };
const DREAM_RULES: DreamRule[] = [
  { keywords: ["งู", "งูรัด"], numbers: ["56", "65", "5", "6"], tip: "งู/งูรัด → เลข 5,6 มักเด่น" },
  { keywords: ["เด็ก", "ทารก"], numbers: ["13", "31", "1", "3"], tip: "เด็ก → 1,3" },
  { keywords: ["ตั้งครรภ์", "ท้อง", "คลอด"], numbers: ["15", "51", "5", "1"] },
  { keywords: ["พระ", "เจ้าแม่", "ศาล", "วัด"], numbers: ["9", "19", "99"] },
  { keywords: ["ปลา", "จับปลา"], numbers: ["17", "71", "7"] },
  { keywords: ["ฟันหลุด", "ฟันหัก"], numbers: ["04", "40", "0", "4"] },
  { keywords: ["บ้าน", "บ้านเลขที่"], numbers: [], tip: "โฟกัสเลขบ้านจริง/ที่อยู่" },
  { keywords: ["รถ", "ทะเบียน", "ทะเบียนรถ", "รถชน"], numbers: [], tip: "โฟกัสเลขทะเบียนรถจริง" },
  { keywords: ["น้ำ", "ทะเล", "แม่น้ำ", "น้ำท่วม"], numbers: ["2", "20", "22"] },
  { keywords: ["ไฟ", "ไฟไหม้"], numbers: ["6", "66", "69"] },
];

/** ===== News Types ===== */
export type NewsItem = { title: string; url: string; publishedAt?: string; source?: string; imageUrl?: string };

/** ===== Providers: Custom Feed / NewsAPI / SerpAPI ===== */
async function fetchNewsFromCustomFeed(): Promise<NewsItem[]> {
  if (!LUCKY_FEED_URL) return [];
  const res = await fetch(LUCKY_FEED_URL);
  if (!res.ok) return [];
  const json = await res.json();
  if (!Array.isArray(json)) return [];
  return json as NewsItem[];
}

async function fetchNewsFromNewsAPI(query = "เลขเด็ด OR หวย", lang = "th"): Promise<NewsItem[]> {
  if (!NEWSAPI_KEY) return [];
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("language", lang);
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "10");
  const res = await fetch(url.toString(), { headers: { "X-Api-Key": NEWSAPI_KEY } });
  if (!res.ok) return [];
  const json: any = await res.json();
  return (json.articles || []).map((a: any) => ({
    title: a.title,
    url: a.url,
    publishedAt: a.publishedAt,
    source: a.source?.name,
    imageUrl: a.urlToImage,
  }));
}

async function fetchNewsFromSerpAPI(query = "เลขเด็ด ข่าว ล่าสุด", gl = "th"): Promise<NewsItem[]> {
  if (!SERPAPI_KEY) return [];
  const u = new URL("https://serpapi.com/search.json");
  u.searchParams.set("engine", "google");
  u.searchParams.set("q", query);
  u.searchParams.set("gl", gl);
  u.searchParams.set("api_key", SERPAPI_KEY);
  const res = await fetch(u.toString());
  if (!res.ok) return [];
  const json: any = await res.json();
  const news = json.news_results || json.organic_results || [];
  return news.slice(0, 10).map((n: any) => ({
    title: n.title || n.snippet || "",
    url: n.link || n.source || "",
    publishedAt: n.date || n.date_utc,
    source: n.source || "google",
    imageUrl: n.thumbnail?.static || n.thumbnail?.original,
  }));
}

/** ===== Fallback RSS (no API key) ===== */
const FALLBACK_RSS_SOURCES: { name: string; url: string }[] = [
  { name: "Thairath",  url: "https://www.thairath.co.th/rss/news" },
  { name: "Khaosod",   url: "https://www.khaosod.co.th/feed" },
  { name: "Matichon",  url: "https://www.matichon.co.th/feed" },
  { name: "Sanook",    url: "https://www.sanook.com/news/rss/" },
  { name: "DailyNews", url: "https://www.dailynews.co.th/feed/" },
];
const LUCKY_KEYWORDS = /(หวย|เลขเด็ด|สลาก|ลอตเตอรี่|ตรวจหวย|เลขดัง|เฮง|เสี่ยงโชค)/i;

function pickTag(text: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
async function fetchRss(url: string): Promise<NewsItem[]> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const out: NewsItem[] = items.map((it) => {
    const title = stripHtml(pickTag(it, "title"));
    const link = pickTag(it, "link") || pickTag(it, "guid");
    const pub = pickTag(it, "pubDate") || pickTag(it, "updated") || pickTag(it, "dc:date");
    return { title, url: link, publishedAt: pub };
  });
  return out;
}
async function getNewsFromRssFallback(): Promise<NewsItem[]> {
  const all: NewsItem[] = [];
  for (const src of FALLBACK_RSS_SOURCES) {
    try {
      const items = await fetchRss(src.url);
      for (const it of items) {
        if (!it.title) continue;
        if (!LUCKY_KEYWORDS.test(it.title)) continue;
        all.push({ ...it, source: src.name });
      }
    } catch { /* ignore */ }
  }
  const seen = new Set<string>();
  const unique = all.filter((x) => {
    const key = x.url || x.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.slice(0, 10);
}

/** ===== Merge news with fallback ===== */
async function getLatestLuckyNews(): Promise<NewsItem[]> {
  const chunks: NewsItem[][] = [];
  try { const a = await fetchNewsFromCustomFeed(); if (a?.length) chunks.push(a); } catch {}
  try { const b = await fetchNewsFromNewsAPI();     if (b?.length) chunks.push(b); } catch {}
  try { const c = await fetchNewsFromSerpAPI();     if (c?.length) chunks.push(c); } catch {}

  const merged: NewsItem[] = [];
  const seen = new Set<string>();
  for (const arr of chunks) {
    for (const it of arr) {
      const key = it.url || it.title;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(it);
    }
  }

  if (!merged.length) {
    // ถอยไป RSS สำรอง (ไม่ใช้ token)
    return await getNewsFromRssFallback();
  }
  return merged.slice(0, 10);
}

/** ===== Render news list with extracted numbers ===== */
function renderNewsLuckyList(items: NewsItem[]): string {
  if (!items.length) {
    return [
      "ยังไม่พบข่าวเลขเด็ดล่าสุดในขณะนี้ค่ะ 🗞️",
      "ลองพิมพ์: เลขเด็ดจากข่าวล่าสุด, ข่าวหวยวันนี้, เลขมาแรง",
      footerNote(),
    ].join("\n");
  }
  const lines = items.map((it) => {
    const nums = extractNumbersFromText(it.title).slice(0, 3).join(", ");
    const when = it.publishedAt
      ? new Date(it.publishedAt).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
      : "ล่าสุด";
    const src = it.source ? ` · ${it.source}` : "";
    return `• ${it.title}${nums ? ` → เลขที่พบ: ${nums}` : ""}\n  ${when}${src}\n  ${it.url}`;
  });
  return ["🗞️ เลขจากข่าวล่าสุด (คัดมาให้)", ...lines, footerNote()].join("\n");
}

/** ===== Dream & General ===== */
function dreamToNumbers(text: string): { picks: string[]; note?: string } {
  const t = text || "";
  const hits = DREAM_RULES.filter((r) => r.keywords.some((k) => t.includes(k)));
  const found: string[] = [];
  let note = "";

  for (const r of hits) {
    found.push(...r.numbers);
    if (r.tip) note = note || r.tip;
  }
  const inline = extractNumbersFromText(t);
  if (inline.length) found.unshift(...inline);

  const picks = Array.from(new Set(found)).slice(0, 10);
  return { picks, note };
}
function generalLucky(text: string, now = new Date()): { picks: string[]; hint: string } {
  const base = extractNumbersFromText(text);
  if (base.length) return { picks: base.slice(0, 6), hint: "อ้างอิงจากเลขที่คุณระบุในข้อความ" };

  const d = now;
  const picks = [
    d.getDate().toString().padStart(2, "0"),
    (d.getMonth() + 1).toString().padStart(2, "0"),
    d.getFullYear().toString().slice(-2),
    `${d.getHours().toString().padStart(2, "0")}${Math.floor(d.getMinutes() / 10)}`,
  ];
  return { picks, hint: "อ้างอิงจากวันเวลา ณ ขณะถาม (เพื่อความบันเทิง)" };
}
function beliefReply(): string {
  return [
    "🙏 ความเชื่อ/เลขมงคลขึ้นกับบุคคล เช่น วันเกิด ปีนักษัตร วัตถุมงคล สถานที่ศักดิ์สิทธิ์",
    "ตัวอย่างที่คนนิยม: เลขวันเกิด, เลขทะเบียนสำคัญ, วันครบรอบ, ทำนายฝัน",
    `อยากได้คำแนะนำเฉพาะบุคคล? บอกวันเกิด/เหตุการณ์สำคัญ แล้วฉันจะแนะนำเลขมงคลให้ค่ะ (${LINE_HANDLE})`,
    footerNote(),
  ].join("\n");
}

/** ===== Main entry ===== */
export async function answerLotteryAI(userMsg: string, now = new Date()): Promise<string> {
  const intent = detectIntent(userMsg);

  try {
    switch (intent) {
      case "LUCKY_FROM_NEWS": {
        const items = await getLatestLuckyNews();
        return renderNewsLuckyList(items);
      }
      case "LUCKY_FROM_SOCIAL": {
        const items = await getLatestLuckyNews();
        return ["📣 เลขมาแรงจากโซเชียล/สื่อออนไลน์", renderNewsLuckyList(items)].join("\n\n");
      }
      case "LUCKY_FROM_DREAM": {
        const { picks, note } = dreamToNumbers(userMsg);
        const lines = [
          "🛌 ทำนายฝันเป็นเลข (เพื่อความบันเทิง)",
          picks.length ? `เลขที่สกัดได้: ${picks.join(", ")}` : "ยังจับเลขจากคำฝันไม่ได้ ลองเล่าเพิ่มเติมหน่อยนะคะ",
          note ? `หมายเหตุ: ${note}` : "",
          footerNote(),
        ].filter(Boolean);
        return lines.join("\n\n");
      }
      case "BELIEF_FAITH": {
        return beliefReply();
      }
      case "LUCKY_GENERAL": {
        const { picks, hint } = generalLucky(userMsg, now);
        const lines = [
          "🔯 เลขมงคล/แนะนำเบื้องต้น",
          picks.length ? `แนะนำ: ${picks.join(", ")}` : "ยังไม่มีข้อมูลเพียงพอ ลองบอกวันเกิด/เลขที่เกี่ยวข้องเพิ่มได้ค่ะ",
          `เหตุผล: ${hint}`,
          footerNote(),
        ];
        return lines.join("\n\n");
      }
      default: {
        if (openai) {
          const systemPrompt = `
คุณคือผู้ช่วยของแบรนด์ ${BRAND_NAME} (LINE OA ${LINE_HANDLE})
ตอบเรื่องหวยออนไลน์ เลขมงคล ความฝัน ความเชื่อ และเลขเด็ดจากข่าว/โซเชียล
- ถ้าผู้ใช้ถามข่าว/เลขมาแรง แนะนำคำสั่ง: "เลขเด็ดจากข่าวล่าสุด"
- ถ้าทำนายฝัน ให้สกัดคีย์เวิร์ดและแนะนำเลขอย่างระมัดระวัง (เพื่อความบันเทิง)
- ไทย สุภาพ กระชับ มีอิโมจิเล็กน้อย และเตือนความเสี่ยงตอนท้าย
          `.trim();

          const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.4,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMsg },
            ],
          });
          const out = resp.choices?.[0]?.message?.content?.trim();
          if (out) return [out, footerNote()].join("\n\n");
        }
        return [
          "ฉันช่วยได้เรื่อง เลขจากข่าว/โซเชียล, ทำนายฝันเป็นเลข, เลขมงคลทั่วไป ค่ะ",
          "ลองพิมพ์: เลขเด็ดจากข่าวล่าสุด / ทำนายฝันเห็นงู / เลขมงคลตามวันเกิด",
          footerNote(),
        ].join("\n\n");
      }
    }
  } catch (err) {
    console.error("[ai.ts] error", err);
    return ["ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองพิมพ์ใหม่อีกครั้งนะคะ 🙏", footerNote()].join("\n\n");
  }
}

/** ให้ route.ts เรียกใช้เพื่อส่ง Flex ข่าวได้ */
export async function fetchLuckyNews(): Promise<NewsItem[]> {
  try {
    const items = await getLatestLuckyNews();
    return items;
  } catch {
    return [];
  }
}