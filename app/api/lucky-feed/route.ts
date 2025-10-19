// app/api/lucky-feed/route.ts
export const runtime = "edge";

const SOURCES = [
  { name: "Thairath",  url: "https://www.thairath.co.th/rss/news" },
  { name: "Khaosod",   url: "https://www.khaosod.co.th/feed" },
  { name: "Matichon",  url: "https://www.matichon.co.th/feed" },
  { name: "Sanook",    url: "https://www.sanook.com/news/rss/" },
  { name: "DailyNews", url: "https://www.dailynews.co.th/feed/" },
];

const LUCKY = /(หวย|เลขเด็ด|ลอตเตอรี่|สลาก|ตรวจหวย|เลขดัง|เฮง|เสี่ยงโชค)/i;

function pick(xml: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}
function strip(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchRss(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.map((it) => {
    const title = strip(pick(it, "title"));
    const link = pick(it, "link") || pick(it, "guid");
    const date = pick(it, "pubDate") || pick(it, "updated") || pick(it, "dc:date");
    return { title, url: link, publishedAt: date };
  });
}

export async function GET() {
  try {
    const all: any[] = [];
    for (const src of SOURCES) {
      try {
        const items = await fetchRss(src.url);
        for (const it of items) {
          if (!it.title || !LUCKY.test(it.title)) continue;
          all.push({ ...it, source: src.name });
        }
      } catch {}
    }
    // unique
    const seen = new Set<string>();
    const unique = all.filter((x) => {
      const key = x.url || x.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return new Response(JSON.stringify(unique.slice(0, 20), null, 2), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      status: 200,
    });
  }
}