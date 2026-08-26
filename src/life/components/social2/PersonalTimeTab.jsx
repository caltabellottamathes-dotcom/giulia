import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ObjectCard, Meter, Chip, EmptyVisual, Kicker, Modal, FieldLabel } from "./primitives";
import { capacityFromCheckIn, spaceCapacityQuadrant } from "@/lib/domainUtils";
import { fmtDuration, timeBlockLabel } from "@/lib/selfUtils";

/* PERSONAL TIME — do I have space. Time field, blocks (interactive),
   available space meter, capacity meter, space×capacity quadrant,
   conflict detection. Free ≠ should be filled. */

const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;
const BLOCK_COLOR = { rest: "#b1bec6", recovery: "#cfd9dd", free: "#d8dab3", social: "#94925d", protected: "#d5e24a", work: "#4a4a44" };

export default function PersonalTimeTab({ data, checkIn, reload }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", type: "free", dur: 30 });
  const [editing, setEditing] = useState(null);

  const today = useMemo(() => (data.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === new Date().toDateString() && b.status !== "cancelled"), [data.blocks]);
  const used = today.reduce((s, b) => s + (b.duration_min || 0), 0);
  const available = Math.max(0, totalDayMin - used);
  const spacePct = Math.round((available / totalDayMin) * 100);
  const capacity = capacityFromCheckIn(checkIn);
  const conflicts = today.filter((b) => b.conflict_flag);
  const quadrant = spaceCapacityQuadrant(spacePct, capacity.level);

  const add = async () => {
    if (!form.title.trim()) return;
    const start = new Date().toISOString();
    const end = new Date(Date.now() + (Number(form.dur) || 30) * 60000).toISOString();
    await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.dur) || 30, status: "scheduled", is_protected: form.type === "protected" });
    setForm({ title: "", type: "free", dur: 30 }); setAdding(false); reload();
  };
  const update = async (id, patch) => { await base44.entities.PersonalTimeBlock.update(id, patch); reload(); };
  const remove = async (id) => { await base44.entities.PersonalTimeBlock.delete(id); setEditing(null); reload(); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectCard kicker="05.4" title="Available Space · Today">
          <div className="flex items-baseline gap-2 mb-4"><span className="font-display font-bold text-5xl tabular-nums">{spacePct}</span><span className="text-sm text-muted-foreground">% free</span></div>
          <Meter value={spacePct} accent="olive" />
          <p className="text-[11px] text-muted-foreground mt-2">{Math.round(available / 60 * 10) / 10}h open · {today.length} blocks</p>
        </ObjectCard>
        <ObjectCard kicker="05.5" title="Capacity · How I'm Doing">
          <div className="flex items-baseline gap-2 mb-4"><span className="font-display font-bold text-5xl" style={{ color: capacity.level === "HIGH" ? "hsl(var(--olive))" : capacity.level === "LOW" ? "hsl(var(--urgent))" : "hsl(var(--smoke))" }}>{capacity.level}</span></div>
          <Meter value={capacity.pct} accent={capacity.level === "HIGH" ? "olive" : capacity.level === "LOW" ? "urgent" : "smoke"} />
          <p className="text-[11px] text-muted-foreground mt-2">Context, not a judgment · from latest check-in</p>
        </ObjectCard>
      </div>

      <ObjectCard kicker="05.1 · 05.2 · 05.3" title="Time Field · Today" action={<button onClick={() => setAdding(true)} className="text-[10px] uppercase tracking-widest font-semibold text-olive">+ Add block</button>}>
        <TimeField blocks={today} />
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-foreground/10">
          {Object.entries(BLOCK_COLOR).map(([k, c]) => <div key={k} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} /><span className="text-[9px] uppercase tracking-wide text-muted-foreground">{k}</span></div>)}
        </div>
        <div className="mt-4 space-y-1.5">
          {today.length ? today.map((b) => (
            <div key={b.id} className="rounded-xl border border-foreground/10 px-3 py-2.5 flex items-center gap-2 group">
              {b.is_protected && <span className="h-2 w-2 rounded-full bg-urgent" />}
              {b.conflict_flag && <Chip tone="urgent">conflict</Chip>}
              <p className="text-sm truncate flex-1">{b.title}</p>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{timeBlockLabel(b.type)}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">{fmtDuration(b.duration_min)}</span>
              <button onClick={() => setEditing(b)} className="opacity-0 group-hover:opacity-100 text-[10px] uppercase text-olive">edit</button>
            </div>
          )) : <EmptyVisual title="FREE" subtitle="Nothing scheduled. Your day has room." />}
        </div>
      </ObjectCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectCard kicker="05.6" title="Space × Capacity">
          <Quadrant spacePct={spacePct} capacity={capacity} quadrant={quadrant} />
        </ObjectCard>
        <ObjectCard kicker="05.7" title="Conflict Detection">
          {conflicts.length ? (
            <div className="space-y-2">
              {conflicts.map((b) => (
                <div key={b.id} className="rounded-xl border border-urgent/40 bg-urgent/[0.06] p-3">
                  <div className="flex items-center gap-2"><Chip tone="urgent">⚠ conflict</Chip><p className="text-sm font-medium">{b.title}</p></div>
                  <p className="text-[11px] text-muted-foreground mt-1">{timeBlockLabel(b.type)} · {new Date(b.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                  <div className="flex gap-2 mt-2"><button onClick={() => update(b.id, { conflict_flag: false })} className="text-[10px] uppercase font-semibold text-muted-foreground">Dismiss</button></div>
                </div>
              ))}
            </div>
          ) : <EmptyVisual title="CLEAR" subtitle="No conflicts with protected time." />}
        </ObjectCard>
      </div>

      {adding && (
        <Modal open onClose={() => setAdding(false)} title="Add personal time block" footer={<><button onClick={() => setAdding(false)} className="text-sm text-muted-foreground px-3 py-1.5">Cancel</button><button onClick={add} className="text-sm font-semibold text-white bg-olive px-4 py-1.5 rounded-full">Add</button></>}>
          <FieldLabel>Title</FieldLabel>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-olive/50" />
          <FieldLabel>Type</FieldLabel>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none">{["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t}>{timeBlockLabel(t)}</option>)}</select>
          <FieldLabel>Duration (min)</FieldLabel>
          <input type="number" value={form.dur} onChange={(e) => setForm({ ...form, dur: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none" />
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit block" footer={<><button onClick={() => remove(editing.id)} className="text-sm font-semibold text-urgent px-3 py-1.5">Delete</button><button onClick={() => { update(editing.id, { type: editing.type, title: editing.title, is_protected: editing.type === "protected" }); setEditing(null); }} className="text-sm font-semibold text-white bg-olive px-4 py-1.5 rounded-full">Save</button></>}>
          <FieldLabel>Title</FieldLabel>
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none" />
          <FieldLabel>Type</FieldLabel>
          <div className="flex gap-1.5">{["rest", "recovery", "free", "protected"].map((t) => <button key={t} onClick={() => setEditing({ ...editing, type: t })} className={`text-[11px] rounded-full px-3 py-1.5 ${editing.type === t ? "bg-olive text-white" : "border border-foreground/15 text-muted-foreground"}`}>{timeBlockLabel(t)}</button>)}</div>
        </Modal>
      )}
    </div>
  );
}

function TimeField({ blocks = [] }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  return (
    <div className="space-y-1">
      {hours.map((h) => {
        const block = blocks.find((b) => { const s = new Date(b.start).getHours(); const e = new Date(b.end || b.start).getHours(); return s <= h && e > h; });
        return (
          <div key={h} className="flex items-center gap-2">
            <span className="text-[9px] tabular-nums text-muted-foreground w-6">{String(h).padStart(2, "0")}</span>
            <div className="flex-1 h-3 rounded-md bg-foreground/[0.05] overflow-hidden">
              {block && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.4 }} className="h-full rounded-md" style={{ background: BLOCK_COLOR[block.type] || BLOCK_COLOR.free }} />}
            </div>
            {block && <span className="text-[8px] uppercase tracking-wide text-muted-foreground w-20 truncate">{block.type}</span>}
          </div>
        );
      })}
    </div>
  );
}

function Quadrant({ spacePct, capacity, quadrant }) {
  const highSpace = spacePct >= 50, highCap = capacity.level === "HIGH";
  const cell = (active, label, desc) => (
    <div className={`rounded-xl p-4 border ${active ? "border-olive/40 bg-olive/[0.06]" : "border-foreground/10 bg-foreground/[0.02]"}`}>
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-[11px] mt-1 leading-snug">{desc}</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {cell(highSpace && highCap, "SPACE HIGH · CAP HIGH", "Social opportunity")}
        {cell(highSpace && !highCap, "SPACE HIGH · CAP LOW", "Free / recovery preferred")}
        {cell(!highSpace && highCap, "SPACE LOW · CAP HIGH", "Social load high")}
        {cell(!highSpace && !highCap, "SPACE LOW · CAP LOW", "Protect space")}
      </div>
      <div className="rounded-xl border border-foreground/10 p-4">
        <p className="text-[9px] uppercase tracking-widest text-olive">Now</p>
        <p className="font-display font-semibold mt-1">{quadrant.label}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{quadrant.desc}</p>
      </div>
    </div>
  );
}