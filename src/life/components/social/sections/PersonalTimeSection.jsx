import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { fmtDuration, timeBlockLabel } from "@/lib/selfUtils";
import { LIFE, DARK } from "../socialColors";
import { Plus, Shield } from "lucide-react";

const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;

/** PersonalTimeSection — §8 beschikbare ruimte, dagcompositie, conflict-flags. */
export default function PersonalTimeSection({ blocks = [], reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "free", duration_min: 30 });

  const todayBlocks = useMemo(() => { const d = new Date().toDateString(); return blocks.filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled"); }, [blocks]);
  const total = todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0);
  const available = Math.max(0, totalDayMin - total);
  const h = Math.floor(available / 60), m = available % 60;
  const conflicts = todayBlocks.filter((b) => b.conflict_flag);

  const COMP = todayBlocks
    .map((b) => ({ w: b.duration_min || 30, c: b.is_protected ? LIFE.ridgeSky : b.type === "rest" ? LIFE.pistachio : b.type === "recovery" ? LIFE.olive : "rgba(255,255,255,0.15)" }))
    .concat([{ w: available, c: "rgba(255,255,255,0.05)" }]);

  const add = async () => {
    if (!form.title.trim()) return;
    const start = new Date().toISOString();
    const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
    await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.type === "protected" });
    setForm({ title: "", type: "free", duration_min: 30 }); setShowAdd(false); await reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 h-full">
      <div className="rounded-[24px] p-5 flex flex-col gap-3" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: LIFE.morningDew }}>Available today</p>
        <p className="text-white text-4xl font-display font-bold tabular-nums">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}</p>
        {conflicts.length > 0 && <p className="text-[11px] font-semibold" style={{ color: LIFE.urgent }}>{conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} with protected time</p>}
        <button onClick={() => setShowAdd((v) => !v)} className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold" style={{ background: LIFE.pistachio, color: "#141414" }}>
          <Plus className="w-3.5 h-3.5" /> Add block
        </button>
      </div>

      <div className="rounded-[24px] p-5 flex flex-col" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        {showAdd && (
          <div className="rounded-xl p-3 mb-3 space-y-2" style={{ background: DARK.cardSoft }}>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none" />
            <div className="flex gap-2">
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-xs text-white outline-none">
                {["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t} className="text-charcoal">{timeBlockLabel(t)}</option>)}
              </select>
              <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} className="w-20 rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-xs text-white outline-none" />
              <button onClick={add} className="rounded-full px-3 py-2 text-xs font-semibold" style={{ background: LIFE.pistachio, color: "#141414" }}>Voeg toe</button>
            </div>
          </div>
        )}
        <div className="flex h-7 rounded-xl overflow-hidden gap-0.5 mb-1.5">{COMP.map((seg, i) => <div key={i} style={{ width: `${(seg.w / totalDayMin) * 100}%`, background: seg.c }} />)}</div>
        <div className="flex justify-between text-white/30 text-[10px] mb-4"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-2" style={{ color: LIFE.morningDew }}>Blocks today</p>
        <div className="flex-1 overflow-auto pr-1 space-y-1.5">
          {todayBlocks.length ? todayBlocks.map((b) => (
            <div key={b.id} className="rounded-xl px-3.5 py-2.5 flex items-center gap-2" style={{ background: DARK.cardSoft }}>
              {b.is_protected && <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: LIFE.ridgeSky }} />}
              {b.conflict_flag && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: LIFE.urgent }} />}
              <p className="text-sm text-white truncate flex-1">{b.title}</p>
              <span className="text-[10px] tabular-nums text-white/45">{fmtDuration(b.duration_min)}</span>
            </div>
          )) : <p className="text-white/35 text-sm italic">Nog vrij vandaag.</p>}
        </div>
      </div>
    </div>
  );
}