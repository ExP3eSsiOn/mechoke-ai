"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LINE Push Dashboard – page.tsx
 * --------------------------------------------------------------
 * หน้าสำหรับส่งข้อความ Push ไปยังผู้ใช้ LINE (userId/roomId/groupId)
 * ดีไซน์ทันสมัย โทนเทคโนโลยี ใช้ Tailwind CSS ล้วน (ไม่พึ่ง lib ภายนอก)
 * 
 * API ที่เรียกใช้ (ปรับตามโปรเจกต์คุณ):
 *  - DEV:  POST /api/dev/push         (ปิดอัตโนมัติเมื่อ NODE_ENV=production)
 *  - PROD: POST /api/line/push        (ถ้ามี route นี้ให้ใช้งานจริง)
 *
 * คุณสามารถเปลี่ยนค่า defaultEndpoint ด้านล่างให้เหมาะกับ environment ได้
 */

// ===== Helper types =====
type PushPayload = {
  to: string;
  text?: string;
  promo?: boolean;
  luckyNews?: boolean;
};

type SendTemplate = "TEXT" | "PROMO_FLEX" | "LUCKY_NEWS_FLEX";

// ===== Component =====
export default function Page() {
  const [endpoint, setEndpoint] = useState<string>(
    process.env.NODE_ENV === "production" ? "/api/line/push" : "/api/dev/push"
  );
  const [to, setTo] = useState<string>("");
  const [message, setMessage] = useState<string>("สวัสดีจากบอทมีโชค 🎯");
  const [template, setTemplate] = useState<SendTemplate>("TEXT");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [history, setHistory] = useState<Array<{ time: string; to: string; template: string; text?: string }>>([]);
  const [brand, setBrand] = useState<string>("มีโชคดอทคอม");

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load persisted settings
  useEffect(() => {
    const lastTo = localStorage.getItem("linepush:lastTo");
    const lastEndpoint = localStorage.getItem("linepush:endpoint");
    const lastBrand = localStorage.getItem("linepush:brand");
    if (lastTo) setTo(lastTo);
    if (lastEndpoint) setEndpoint(lastEndpoint);
    if (lastBrand) setBrand(lastBrand);
  }, []);

  // Persist on change
  useEffect(() => { localStorage.setItem("linepush:lastTo", to); }, [to]);
  useEffect(() => { localStorage.setItem("linepush:endpoint", endpoint); }, [endpoint]);
  useEffect(() => { localStorage.setItem("linepush:brand", brand); }, [brand]);

  const payload: PushPayload = useMemo(() => {
    const base: PushPayload = { to };
    if (template === "TEXT") base.text = message;
    if (template === "PROMO_FLEX") base.promo = true;
    if (template === "LUCKY_NEWS_FLEX") base.luckyNews = true;
    return base;
  }, [to, message, template]);

  const curlPreview = useMemo(() => {
    const body = JSON.stringify(payload, null, 2);
    return `curl -X POST ${endpoint}\n  -H "Content-Type: application/json"\n  -d '${body.replace(/'/g, "'\\''")}'`;
  }, [endpoint, payload]);

  async function handleSend() {
    setIsSending(true);
    setResult("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      setResult(text);
      const item = {
        time: new Date().toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        to,
        template,
        text: template === "TEXT" ? message : undefined,
      };
      setHistory((h) => [item, ...h].slice(0, 10));
    } catch (e: any) {
      setResult(`ERROR: ${e?.message || e}`);
    } finally {
      setIsSending(false);
    }
  }

  function pasteSampleUserId() {
    setTo("Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  }

  function focusText() {
    textAreaRef.current?.focus();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 bg-slate-900/60 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 shadow-lg shadow-emerald-500/20" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">LINE • Operations</p>
              <h1 className="font-semibold text-lg">Push Dashboard <span className="text-slate-400">/ {brand}</span></h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-1 mt-0.5"/>Live
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Endpoint</label>
                <select
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="/api/dev/push">/api/dev/push (DEV)</option>
                  <option value="/api/line/push">/api/line/push (PROD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Brand</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="มีโชคดอทคอม"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Recipient (userId/roomId/groupId)</label>
              <div className="flex gap-2">
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <button
                  onClick={pasteSampleUserId}
                  className="rounded-xl bg-slate-800 border border-white/10 px-3 text-sm hover:bg-slate-700"
                >
                  ใส่ตัวอย่าง
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                className={`rounded-2xl px-3 py-2 text-sm border transition ${template === "TEXT" ? "bg-emerald-500 text-black border-transparent" : "bg-slate-900/60 border-white/10 hover:bg-slate-800"}`}
                onClick={() => setTemplate("TEXT")}
              >
                ✍️ ข้อความ Text
              </button>
              <button
                className={`rounded-2xl px-3 py-2 text-sm border transition ${template === "PROMO_FLEX" ? "bg-cyan-400 text-black border-transparent" : "bg-slate-900/60 border-white/10 hover:bg-slate-800"}`}
                onClick={() => setTemplate("PROMO_FLEX")}
              >
                🎁 Flex: โปรโมชัน
              </button>
              <button
                className={`rounded-2xl px-3 py-2 text-sm border transition ${template === "LUCKY_NEWS_FLEX" ? "bg-indigo-400 text-black border-transparent" : "bg-slate-900/60 border-white/10 hover:bg-slate-800"}`}
                onClick={() => setTemplate("LUCKY_NEWS_FLEX")}
              >
                🗞️ Flex: ข่าวเลขเด็ด
              </button>
            </div>

            {/* Message box (only for TEXT) */}
            {template === "TEXT" && (
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">Message</label>
                <textarea
                  ref={textAreaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 rounded-2xl bg-slate-900/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="พิมพ์ข้อความที่จะส่ง…"
                />
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <button onClick={focusText} className="underline underline-offset-4 hover:text-slate-200">โฟกัส</button>
                  <span>•</span>
                  <span>รองรับอีโมจิ และเว้นบรรทัด</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={isSending || !to}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-medium transition border ${
                  isSending || !to
                    ? "bg-slate-800 text-slate-500 border-white/10 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-black border-transparent hover:opacity-90"
                }`}
              >
                {isSending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                    กำลังส่ง…
                  </>
                ) : (
                  <>
                    <span>🚀</span> ส่งข้อความ
                  </>
                )}
              </button>

              <span className="text-xs text-slate-400">ปลายทาง: <code className="text-slate-300">{endpoint}</code></span>
            </div>
          </div>
        </div>

        {/* Right: Preview & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-medium mb-3">cURL Preview</h3>
            <pre className="text-xs whitespace-pre-wrap leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5">
{curlPreview}
            </pre>
            <p className="mt-3 text-xs text-slate-400">ใช้คัดลอกไปรันทดสอบในเทอร์มินัลได้ทันที</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-medium mb-3">ผลลัพธ์จาก API</h3>
            <pre className="text-xs whitespace-pre-wrap leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5 min-h-[120px]">
{result || "รอการส่ง…"}
            </pre>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-medium mb-3">ประวัติการส่งล่าสุด</h3>
            <div className="space-y-2">
              {history.length === 0 && (
                <p className="text-sm text-slate-400">ยังไม่มีประวัติการส่ง</p>
              )}
              {history.map((h, i) => (
                <div key={i} className="rounded-2xl bg-black/40 border border-white/5 p-3">
                  <div className="text-xs text-slate-400">{h.time}</div>
                  <div className="text-sm font-medium mt-1">to: <span className="text-emerald-300">{h.to}</span></div>
                  <div className="text-xs mt-1">template: <span className="text-cyan-300">{h.template}</span></div>
                  {h.text && <div className="text-xs mt-1 line-clamp-3 text-slate-300">{h.text}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-slate-500">
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="uppercase tracking-widest text-[10px] text-slate-400">Line Operations</div>
            <div className="text-slate-400">Push Console • สำหรับทีมการตลาด/แอดมิน</div>
          </div>
          <div className="text-slate-400">Brand: <span className="text-slate-200">{brand}</span></div>
        </div>
      </footer>
    </main>
  );
}
