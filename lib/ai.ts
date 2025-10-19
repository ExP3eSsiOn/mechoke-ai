// lib/ai.ts
export type LuckyItem = {
  title: string;
  url: string;
  imageUrl?: string | null;
  source?: string | null;
  publishedAt?: string | null; // ISO หรือรูปแบบสตริงเดิม
};

function withTimeout(p: Promise<Response>, ms = 8000) {
  return Promise.race([
    p,
    new Promise<Response>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]) as Promise<Response>;
}

async function fetchJSON(url: string) {
  const res = await withTimeout(fetch(url, { cache: "no-store" }));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * fetchLuckyNews
 * ลำดับแหล่งข้อมูล:
 *  1) LUCKY_FEED_URL (ภายนอก/ของคุณ)
 *  2) NEXT_PUBLIC_BASE_URL + /api/lucky-feed (route ภายในโปรเจกต์)
 */
export async function fetchLuckyNews(limit = 5): Promise<LuckyItem[]> {
  const items: LuckyItem[] = [];

  // 1) External JSON feed
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
      // เงียบไว้ แล้วลองแหล่งถัดไป
    }
  }

  // 2) Internal API: /api/lucky-feed
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

  // กรองของเสีย
  const uniq = new Map<string, LuckyItem>();
  for (const it of items) {
    if (!it?.title || !it?.url) continue;
    uniq.set(it.url, it);
  }
  return Array.from(uniq.values()).slice(0, limit);
}