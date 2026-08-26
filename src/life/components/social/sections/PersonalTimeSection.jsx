import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { fmtDuration, timeBlockLabel } from "@/lib/selfUtils";
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
    .map((b) => ({ w: b.duration_min || 30, c: b.is_protected ? "bg-powder" : b.type === "rest" ? "bg-olive" : b.type === "recovery" ? "bg-steel" : "bg-muted-foreground/25" }))
    .concat([{ w: available, c: "bg-muted" }]);

  const add = async () => {
    if (!form.title.trim()) return;
    const start = new Date().toISOString();
    const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
    await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.type === "protected" });
    setForm({ title: "", type: "free", duration_min: 30 }); setShowAdd(false); await reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
      <GlassPanel level={2} className="p-5 flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Available today</p>
        <p className="text-4xl font-display font-bold tabular-nums text-foreground">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}</p>
        {conflicts.length > 0 && <p className="text-[11px] font-semibold text-urgent">{conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} with protected time</p>}
        <GlassButton variant="primary" size="sm" className="mt-auto" onClick={() => setShowAdd((v) => !v)}>
          <Plus className="w-3.5 h-3.5" /> Add block
        </GlassButton>
      </GlassPanel>

      <GlassPanel level={2} className="p-5 flex flex-col">
        {showAdd && (
          <div className="rounded-xl bg-muted/40 p-3 mb-3 space-y-2">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="w-full rounded-lg glass-1 px-3 py-2 text-sm outline-none" />
            <div className="flex gap-2">
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-lg glass-1 px-2 py-2 text-xs outline-none">
                {["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t}>{timeBlockLabel(t)}</option>)}
              </select>
              <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} className="w-20 rounded-lg glass-1 px-2 py-2 text-xs outline-none" />
              <GlassButton variant="primary" size="sm" onClick={add}>Voeg toe</GlassButton>
            </div>
          </div>
        )}
        <div className="flex h-7 rounded-xl overflow-hidden gap-0.5 mb-1.5">{COMP.map((seg, i) => <div key={i} className={seg.c} style={{ width: `${(seg.w / totalDayMin) * 100}%` }} />)}</div>
        <div className="flex justify-between text-muted-foreground text-[10px] mb-4"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Blocks today</p>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
          {todayBlocks.length ? todayBlocks.map((b) => (
            <div key={b.id} className="rounded-xl bg-muted/40 px-3.5 py-2.5 flex items-center gap-2">
              {b.is_protected && <Shield className="w-3.5 h-3.5 text-powder shrink-0" />}
              {b.conflict_flag && <span className="h-1.5 w-1.5 rounded-full bg-urgent shrink-0" />}
              <p className="text-sm truncate flex-1">{b.title}</p>
              <span className="text-[10px] tabular-nums text-muted-foreground">{fmtDuration(b.duration_min)}</span>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">Nog vrij vandaag.</p>}
        </div>
      </GlassPanel>
    </div>
  );
}