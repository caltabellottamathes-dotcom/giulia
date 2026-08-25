import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";
import { fmtDuration, timeBlockLabel } from "@/lib/selfUtils";
import { Plus, Shield } from "lucide-react";

const BLUE = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand))";
const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;

/** PersonalTimePreview — Persoonlijke tijd vandaag als L02-preview (vervangt
 *  het oude PersonalTimePanel): beschikbare ruimte, dagcompositie, breakdown
 *  en blokken. */
export default function PersonalTimePreview({ onOpen }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "free", duration_min: 30 });

  const load = async () => {
    try { const list = await base44.entities.PersonalTimeBlock.list("-start", 50).catch(() => []); setBlocks(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const todayBlocks = useMemo(() => { const d = new Date().toDateString(); return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled"); }, [blocks]);
  const total = useMemo(() => todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const protectedMin = useMemo(() => todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const rest = useMemo(() => todayBlocks.filter((b) => b.type === "rest").reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const recovery = useMemo(() => todayBlocks.filter((b) => b.type === "recovery").reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const free = useMemo(() => todayBlocks.filter((b) => b.type === "free").reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const available = Math.max(0, totalDayMin - total);
  const h = Math.floor(available / 60), m = available % 60;

  const statement = available > 240 ? "RUIMTE OVER VANDAAG" : available > 60 ? "WAT UUR OVER" : "DAG IS VOL";
  const kicker = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} BESCHIKBAAR`;

  const ROWS = [
    { label: "PROTECTED", min: protectedMin, c: BLUE },
    { label: "REST", min: rest, c: SAND },
    { label: "RECOVERY", min: recovery, c: "rgba(216,218,179,0.5)" },
    { label: "FREE", min: free, c: "rgba(255,255,255,0.2)" },
  ];
  const COMP = todayBlocks.map((b) => ({ w: b.duration_min || 30, c: b.is_protected ? BLUE : b.type === "rest" ? SAND : b.type === "recovery" ? "rgba(216,218,179,0.5)" : "rgba(255,255,255,0.15)" })).concat([{ w: available, c: "rgba(255,255,255,0.05)" }]);

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
      await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.type === "protected" });
      setForm({ title: "", type: "free", duration_min: 30 }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };

  return (
    <PreviewShell index="28" section="PERSOONLIJKE TIJD" statement={statement} kicker={kicker} accent={SAND}
      context={[
        { label: "BESCHIKBAAR", text: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} vrije ruimte vandaag.` },
        { label: "BESCHERMD", text: protectedMin > 0 ? `${fmtDuration(protectedMin)} bewust gereserveerd.` : "Niets beschermd vandaag." },
        { label: "ONDER DRUK", text: todayBlocks.length > 3 ? "Persoonlijke tijd mogelijk onder druk." : "Geen druk zichtbaar." },
      ]}
      actions={[
        { label: "Pulse", to: "/life/social?view=socialpulse" },
        { label: "Planner", to: "/life/social?view=socialplanner" },
        { label: "Bescherm uur", primary: true, onClick: async () => { const s = new Date().toISOString(); const e = new Date(Date.now() + 60 * 60000).toISOString(); await base44.entities.PersonalTimeBlock.create({ title: "Beschermd uur", type: "protected", start: s, end: e, duration_min: 60, status: "scheduled", is_protected: true }); await load(); } },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 h-full overflow-hidden">
        <div className="flex flex-col gap-4 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">BESCHIKBAAR</p>
            <p className="text-storm text-5xl font-bold tabular-nums mt-1 leading-none">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}</p>
          </div>
          <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold" style={{ color: "#301728", background: SAND }}><Plus className="w-3.5 h-3.5" /> Blok toevoegen</button>
        </div>
        <div className="flex flex-col overflow-hidden">
          {showAdd && (
            <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3 mb-3 space-y-2">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="w-full rounded-lg bg-white/5 border border-marble/20 px-3 py-2 text-sm text-storm placeholder:text-storm/40 outline-none" />
              <div className="flex gap-2">
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-lg bg-white/5 border border-marble/20 px-2 py-2 text-xs text-storm outline-none">{["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t} className="text-charcoal">{timeBlockLabel(t)}</option>)}</select>
                <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} placeholder="min" className="w-20 rounded-lg bg-white/5 border border-marble/20 px-2 py-2 text-xs text-storm outline-none" />
                <button onClick={add} disabled={!form.title.trim()} className="rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-40" style={{ color: "#301728", background: SAND }}>Voeg toe</button>
              </div>
            </div>
          )}
          <div className="mb-3">
            <p className="text-storm/50 text-[10px] tracking-[0.22em] mb-2">DAGCOMPOSITIE</p>
            <div className="flex h-7 rounded-xl overflow-hidden gap-0.5">{COMP.map((seg, i) => <div key={i} style={{ width: `${(seg.w / totalDayMin) * 100}%`, background: seg.c }} />)}</div>
            <div className="flex justify-between text-storm/40 text-[10px] mt-1.5"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
          </div>
          <div className="glass-card-2 rounded-2xl p-4 mb-3">
            <div className="flex flex-col gap-3">
              {ROWS.map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-20 text-storm text-xs font-medium tracking-wide">{r.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (r.min / totalDayMin) * 100 * 3)}%`, background: r.c }} /></div>
                  <span className="w-12 text-right text-storm/50 text-xs tabular-nums">{r.min > 0 ? fmtDuration(r.min) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.28em] mb-2">VANDAAG</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : todayBlocks.length ? todayBlocks.slice(0, 6).map((b) => (
              <div key={b.id} className="glass-card-2 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                {b.is_protected && <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: BLUE }} />}
                <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: b.is_protected ? BLUE : b.type === "rest" ? SAND : "rgba(255,255,255,0.5)" }}>{timeBlockLabel(b.type)}</span>
                <p className="text-sm font-medium text-storm truncate flex-1">{b.title}</p>
                <span className="text-[10px] tabular-nums text-storm/55">{fmtDuration(b.duration_min)}</span>
              </div>
            )) : <p className="text-storm/45 text-sm italic">Nog vrij — plan je tijd.</p>}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}