"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * MECHOKE • LINE Push Console (Polished)
 * - Modern dashboard cards • Mobile-first • Accessible spacing
 * - DEV (/api/dev/push) & PROD (/api/line/push) with optional Admin Token
 * - Pins with nickname + Recent users feed from /api/debug/users?format=json
 * - Copy cURL • Sticky Send bar • History
 */

type SendTemplate = "TEXT" | "PROMO_FLEX" | "LUCKY_NEWS_FLEX";
type PushPayload = { to: string; text?: string; promo?: boolean; luckyNews?: boolean };
type TrackedUser = { id: string; firstSeen: string; lastSeen: string; count: number };

type Pin = { name: string; id: string };

const PIN_SLOTS = 6;

/* ---------- Small UI helpers ---------- */
const Card: React.FC<React.PropsWithChildren<{ title?: string; desc?: string; right?: React.ReactNode; className?: string }>> = ({ title, desc, right, className, children }) => (
  <section className={`rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ${className || ""}`}>
    {(title || right || desc) && (
      <header className="flex flex-col sm:flex-row gap-2 sm:items-end sm:justify-between p-4 border-b border-white/10">
        <div>
          {title && <h2 className="text-base sm:text-lg font-semibold">{title}</h2>}
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
        {right && <div className="text-xs">{right}</div>}
      </header>
    )}
    <div className="p-4">{children}</div>
  </section>
);

const Labeled: React.FC<React.PropsWithChildren<{ label: string; hint?: string }>> = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-2">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
  </div>
);

/* ---------- Page ---------- */
export default function Page() {
  const [brand, setBrand] = useState("มีโชคดอทคอม");
  const [endpoint, setEndpoint] = useState(process.env.NODE_ENV === "production" ? "/api/line/push" : "/api/dev/push");
  const [adminToken, setAdminToken] = useState("");
  const [to, setTo] = useState("");
  const [template, setTemplate] = useState<SendTemplate>("TEXT");
  const [message, setMessage] = useState("สวัสดีค่ะ จากบอทมีโชค 🎯");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<Array<{ time: string; to: string; template: string; text?: string }>>([]);
  const [pins, setPins] = useState<Pin[]>(Array.from({ length: PIN_SLOTS }, (_, i) => ({ name: `Pin ${i + 1}`, id: "" })));
  const [recent, setRecent] = useState<TrackedUser[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  /* ---------- Persist ---------- */
  useEffect(() => {
    const g = (k: string) => localStorage.getItem(k) || undefined;
    g("push:brand") && setBrand(g("push:brand")!);
    g("push:endpoint") && setEndpoint(g("push:endpoint")!);
    g("push:adminToken") && setAdminToken(g("push:adminToken")!);
    g("push:lastTo") && setTo(g("push:lastTo")!);
    const p = g("push:pins");
    if (p) try {
      const arr = JSON.parse(p);
      if (Array.isArray(arr)) {
        const padded: Pin[] = [...arr, ...Array.from({ length: PIN_SLOTS }, (_, i) => ({ name: `Pin ${i + 1}`, id: "" }))].slice(0, PIN_SLOTS);
        setPins(padded);
      }
    } catch {}
  }, []);
  useEffect(() => localStorage.setItem("push:brand", brand), [brand]);
  useEffect(() => localStorage.setItem("push:endpoint", endpoint), [endpoint]);
  useEffect(() => localStorage.setItem("push:adminToken", adminToken), [adminToken]);
  useEffect(() => localStorage.setItem("push:lastTo", to), [to]);
  useEffect(() => localStorage.setItem("push:pins", JSON.stringify(pins)), [pins]);

  /* ---------- Load recent users ---------- */
  async function loadRecent() {
    setRecentLoading(true); setRecentError(null);
    try {
      const res = await fetch("/api/debug/users?format=json", { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error("API not ok");
      setRecent(data.users || []);
    } catch (e: any) {
      setRecentError(e?.message || "โหลดรายชื่อล่าสุดไม่สำเร็จ");
    } finally { setRecentLoading(false); }
  }
  useEffect(() => { loadRecent(); }, []);

  /* ---------- Payload & cURL ---------- */
  const payload: PushPayload = useMemo(() => {
    const p: PushPayload = { to };
    if (template === "TEXT") p.text = message;
    if (template === "PROMO_FLEX") p.promo = true;
    if (template === "LUCKY_NEWS_FLEX") p.luckyNews = true;
    return p;
  }, [to, message, template]);

  const curlPreview = useMemo(() => {
    const headers: string[] = [`-H "Content-Type: application/json"`];
    if (endpoint === "/api/line/push" && adminToken) headers.push(`-H "Authorization: Bearer ${adminToken}"`);
    const body = JSON.stringify(payload, null, 2).replace(/'/g, "'\\''");
    return `curl -X POST ${endpoint}\n  ${headers.join(" \\\n  ")} \\\n  -d '${body}'`;
  }, [endpoint, adminToken, payload]);

  const copyCurl = async () => {
    try { await navigator.clipboard.writeText(curlPreview); alert("คัดลอก cURL แล้ว"); } catch {}
  };

  /* ---------- Helpers ---------- */
  const nowTH = () => new Date().toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  const sampleTo = () => setTo("Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  const setPin = (i: number, patch: Partial<Pin>) => { const next = [...pins]; next[i] = { ...next[i], ...patch }; setPins(next); };
  const chooseTo = (id: string) => id && setTo(id);
  const applyPreset = (t: SendTemplate) => {
    setTemplate(t);
    if (t === "TEXT") {
      setMessage("แจ้งข่าวดีค่ะ 🎉 ฝาก 300 ต่อเนื่อง 7 วัน เลือกรับของแถมฟรี 1 ชิ้น ✨ สนใจพิมพ์: โปรวันนี้");
      taRef.current?.focus();
    }
  };

  /* ---------- Send ---------- */
  async function handleSend() {
    setIsSending(true); setResult("");
    try {
      if (!to) throw new Error("กรุณาใส่ Recipient (userId/roomId/groupId)");
      if (endpoint === "/api/line/push" && !adminToken) throw new Error("โหมด PROD ต้องใส่ Admin Token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (endpoint === "/api/line/push" && adminToken) headers["Authorization"] = `Bearer ${adminToken}`;
      const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload) });
      const text = await res.text();
      try { setResult(JSON.stringify(JSON.parse(text), null, 2)); } catch { setResult(text); }
      setHistory((h) => [{ time: nowTH(), to, template, text: template === "TEXT" ? message : undefined }, ...h].slice(0, 12));
    } catch (e: any) {
      setResult(`ERROR: ${e?.message || e}`);
    } finally { setIsSending(false); }
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      {/* Topbar */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 shadow-[0_0_18px_#22d3ee66]" />
            <div className="font-semibold">LINE Push Console</div>
            <div className="text-slate-400 text-sm">/ {brand}</div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            Live
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Settings */}
        <Card title="ตั้งค่า" desc="กำหนด Endpoint / แบรนด์ / Token (เฉพาะ PROD)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Labeled label="Endpoint" hint={endpoint === "/api/line/push" ? "PROD: ต้องใส่ Admin Token" : "DEV พร้อมทดสอบทันที"}>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="/api/dev/push">/api/dev/push (DEV)</option>
                <option value="/api/line/push">/api/line/push (PROD)</option>
              </select>
            </Labeled>
            <Labeled label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="มีโชคดอทคอม"
              />
            </Labeled>
            <Labeled label="Admin Token (เฉพาะ PROD)">
              <input
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                type="password"
                placeholder="ใส่ PUSH_ADMIN_TOKEN"
              />
            </Labeled>
          </div>
        </Card>

        {/* Recipients */}
        <Card
          title="ผู้รับ (Recipient)"
          desc="เลือกจากผู้ใช้ล่าสุด ปักหมุดรายการที่ใช้บ่อย หรือกรอกโดยตรง"
          right={
            <button onClick={() => loadRecent()} className="px-3 py-1 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700">
              รีเฟรชผู้ใช้ล่าสุด
            </button>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual + Pins */}
            <div className="space-y-4">
              <Labeled label="กรอก userId / roomId / groupId">
                <div className="flex gap-2">
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <button onClick={sampleTo} className="rounded-xl bg-slate-800 border border-white/10 px-3 text-sm hover:bg-slate-700">ตัวอย่าง</button>
                </div>
              </Labeled>

              <Labeled label="Pins (เก็บ user/group ที่ใช้บ่อย)" hint="ใส่ชื่อเล่น + userId แล้วกดปุ่ม 'ใช้' เพื่อเลือกเป็นผู้รับ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pins.map((p, i) => (
                    <div key={i} className="rounded-xl bg-black/30 border border-white/10 p-2">
                      <div className="grid grid-cols-5 gap-2">
                        <input
                          value={p.name}
                          onChange={(e) => setPin(i, { name: e.target.value })}
                          className="col-span-2 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder={`Pin ${i + 1}`}
                          aria-label={`Pin ${i + 1} name`}
                        />
                        <input
                          value={p.id}
                          onChange={(e) => setPin(i, { id: e.target.value })}
                          className="col-span-2 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="Uxxxxxxxx..."
                          aria-label={`Pin ${i + 1} id`}
                        />
                        <button
                          onClick={() => chooseTo(p.id)}
                          className="col-span-1 rounded-lg bg-slate-800 border border-white/10 text-xs hover:bg-slate-700">
                          ใช้
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Labeled>
            </div>

            {/* Recent users */}
            <div className="space-y-2">
              <label className="block text-xs text-slate-400">ผู้ใช้ล่าสุดจากระบบ</label>
              <div className="rounded-xl border border-white/10 bg-black/30 max-h-72 overflow-auto">
                {recentLoading && <div className="p-3 text-xs text-slate-400">กำลังโหลด…</div>}
                {recentError && <div className="p-3 text-xs text-amber-400">{recentError}</div>}
                {!recentLoading && !recentError && recent.length === 0 && (
                  <div className="p-3 text-xs text-slate-400">ยังไม่มีข้อมูล — เมื่อมีแชตเข้า ระบบจะบันทึกให้อัตโนมัติ</div>
                )}
                {recent.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => chooseTo(u.id)}
                    className="w-full text-left px-3 py-2 border-b border-white/5 hover:bg-white/5 text-xs"
                    title={`first: ${u.firstSeen} / last: ${u.lastSeen}`}
                  >
                    <div className="font-mono text-slate-200 break-all">{u.id}</div>
                    <div className="text-[10px] text-slate-400">
                      seen: {u.count} ครั้ง • ล่าสุด: {new Date(u.lastSeen).toLocaleString("th-TH")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Templates */}
        <Card title="เทมเพลตข้อความ" desc="เลือกประเภทข้อความที่จะส่ง">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              className={`rounded-xl px-3 py-2 text-sm border ${
                template === "TEXT" ? "bg-emerald-400 text-black border-transparent" : "bg-black/40 border-white/10 hover:bg-slate-800"
              }`}
              onClick={() => applyPreset("TEXT")}>
              ✍️ ข้อความ Text
            </button>
            <button
              className={`rounded-xl px-3 py-2 text-sm border ${
                template === "PROMO_FLEX" ? "bg-cyan-400 text-black border-transparent" : "bg-black/40 border-white/10 hover:bg-slate-800"
              }`}
              onClick={() => setTemplate("PROMO_FLEX")}>
              🎁 Flex: โปรเช็คอิน 7 วัน
            </button>
            <button
              className={`rounded-xl px-3 py-2 text-sm border ${
                template === "LUCKY_NEWS_FLEX" ? "bg-indigo-400 text-black border-transparent" : "bg-black/40 border-white/10 hover:bg-slate-800"
              }`}
              onClick={() => setTemplate("LUCKY_NEWS_FLEX")}>
              🗞️ Flex: ข่าวเลขเด็ด
            </button>
          </div>
        </Card>

        {/* Compose */}
        {template === "TEXT" && (
          <Card title="เขียนข้อความ" desc="รองรับอีโมจิและขึ้นบรรทัดใหม่ได้">
            <textarea
              ref={taRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="พิมพ์ข้อความที่จะส่ง…"
            />
          </Card>
        )}

        {/* Send Sticky Bar */}
        <div className="sticky bottom-4 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="text-xs text-slate-300">
                ปลายทาง: <code className="text-slate-100 break-all">{endpoint}</code>
                <span className="mx-2">•</span>
                ส่งให้: <code className="text-emerald-300 break-all">{to || "-"}</code>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSend}
                  disabled={isSending || !to || (endpoint === "/api/line/push" && !adminToken)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition border ${
                    isSending || !to || (endpoint === "/api/line/push" && !adminToken)
                      ? "bg-slate-800 text-slate-500 border-white/10 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-black border-transparent hover:opacity-90"
                  }`}>
                  {isSending ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" /> กำลังส่ง…</>) : (<>🚀 ส่งข้อความ</>)}
                </button>
                <button onClick={copyCurl} className="rounded-xl bg-slate-800 border border-white/10 px-4 text-sm hover:bg-slate-700">คัดลอก cURL</button>
              </div>
            </div>
          </div>
        </div>

        {/* Result + cURL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="ผลลัพธ์จาก API" desc="แสดงข้อความจากเซิร์ฟเวอร์">
            <pre className="text-xs whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 min-h-[140px] max-h-[360px] overflow-auto">
{result || "รอการส่ง…"}
            </pre>
          </Card>
          <Card title="cURL Preview" desc="คัดลอกไปรันทดสอบในเทอร์มินัลได้ทันที">
            <pre className="text-xs whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 min-h-[140px] max-h-[360px] overflow-auto">
{curlPreview}
            </pre>
          </Card>
        </div>

        {/* History */}
        <Card
          title="ประวัติการส่ง"
          desc="ล่าสุด 12 รายการ"
          right={history.length > 0 && (
            <button onClick={() => setHistory([])} className="px-3 py-1 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 text-xs">
              ล้างประวัติ
            </button>
          ) || undefined}
        >
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">ยังไม่มีประวัติการส่ง</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.map((h, i) => (
                <div key={i} className="rounded-xl bg-black/40 border border-white/5 p-3">
                  <div className="text-xs text-slate-400">{h.time}</div>
                  <div className="text-sm font-medium mt-1">to: <span className="text-emerald-300 break-all">{h.to}</span></div>
                  <div className="text-xs mt-1">template: <span className="text-cyan-300">{h.template}</span></div>
                  {h.text && <div className="text-xs mt-1 text-slate-300">{h.text}</div>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-[11px] text-slate-500 text-center py-6">
          MECHOKE • LINE Operations Console — ดีไซน์สมส่วน ใช้งานจริง
        </div>
      </div>
    </div>
  );
}