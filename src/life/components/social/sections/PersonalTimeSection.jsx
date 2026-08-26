import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import TimeField from "../TimeField";
import QuadrantMatrix from "../QuadrantMatrix";
import { CountUp, SectionLabel, AnimatedBar, EmptyState } from "../v2/primitives";
import { capacityFromCheckIn, spaceCapacityQuadrant } from "@/lib/domainUtils";
import { fmtDuration as fmtDur, timeBlockLabel } from "@/lib/selfUtils";
import { Plus, Shield, AlertTriangle, X, Pencil } from "lucide-react";

const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;

/** PersonalTimeSection v2 — §5 de ruimtelijke laag: time field, blocks, space
 *  meter, capacity meter, space×capacity matrix, conflict detection. */
export default function PersonalTimeSection({ blocks = [], checkIn, reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", type: "free", duration_min: 30 });

  const todayBlocks = useMemo(() => { const d = new Date().toDateString(); return blocks.filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled"); }, [blocks]);
  const total = todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0);
  const available = Math.max(0, totalDayMin - total);
  const spacePct = Math.round((available / totalDayMin) * 100);
  const conflicts = todayBlocks.filter((b) => b.conflict_flag);
  const capacity = capacityFromCheckIn(checkIn);

  const add = async () => {
    if (!form.title.trim()) return;
    const start = new Date().toISOString();
    const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
    await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.type === "protected" });
    setForm({ title: "", type: "free", duration_min: 30 }); setShowAdd(false); await reload();
  };
  const updateBlock = async (id, patch) => { await base44.entities.PersonalTimeBlock.update(id, patch); await reload(); };
  const deleteBlock = async (id) => { await base44.entities.PersonalTimeBlock.delete(id); setEditing(null); await reload(); };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
      {/* 5.4 + 5.5 SPACE & CAPACITY METERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-6 relative overflow-hidden">
            <SectionLabel className="mb-3">Available Space · Today</SectionLabel>
            <div className="flex items-baseline gap-2 mb-4">
              <CountUp value={spacePct} className="text-5xl font-display font-bold tabular-nums" suffix="%" />
              <span className="text-sm text-muted-foreground">free</span>
            </div>
            <AnimatedBar pct={spacePct} height="h-3" />
            <p className="text-[11px] text-muted-foreground mt-2">{Math.round(available / 60 * 10) / 10}h open · {todayBlocks.length} blocks scheduled</p>
          </GlassPanel>
        </motion.div>
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-6">
            <SectionLabel className="mb-3">Capacity · How I'm Doing</SectionLabel>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-display font-bold" style={{ color: capacity.level === "HIGH" ? "hsl(var(--olive))" : capacity.level === "LOW" ? "hsl(var(--urgent))" : "hsl(var(--smoke))" }}>{capacity.level}</span>
            </div>
            <AnimatedBar pct={capacity.pct} color={capacity.level === "HIGH" ? "hsl(var(--olive))" : capacity.level === "LOW" ? "hsl(var(--urgent))" : "hsl(var(--smoke))"} height="h-3" />
            <p className="text-[11px] text-muted-foreground mt-2">Context, not a judgment · from latest check-in</p>
          </GlassPanel>
        </motion.div>
      </div>

      {/* 5.1 TIME FIELD + 5.3 BLOCKS */}
      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Time Field · Today</SectionLabel>
            <GlassButton variant="primary" size="sm" onClick={() => setShowAdd((v) => !v)}><Plus className="w-3.5 h-3.5" />Add block</GlassButton>
          </div>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl glass-1 p-3 mb-3 space-y-2 overflow-hidden">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="w-full rounded-lg glass-1 px-3 py-2 text-sm outline-none" />
              <div className="flex gap-2">
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-lg glass-1 px-2 py-2 text-xs outline-none">{["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t}>{timeBlockLabel(t)}</option>)}</select>
                <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} className="w-20 rounded-lg glass-1 px-2 py-2 text-xs outline-none" />
                <GlassButton variant="primary" size="sm" onClick={add}>Voeg toe</GlassButton>
              </div>
            </motion.div>
          )}
          <TimeField blocks={todayBlocks} />
          <div className="mt-4 space-y-1.5">
            {todayBlocks.length ? todayBlocks.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl glass-1 px-3.5 py-2.5 flex items-center gap-2 group">
                {b.is_protected && <Shield className="w-3.5 h-3.5 text-powder shrink-0" />}
                {b.conflict_flag && <AlertTriangle className="w-3.5 h-3.5 text-urgent shrink-0" />}
                <p className="text-sm truncate flex-1">{b.title}</p>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.type}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">{fmtDur(b.duration_min)}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(b)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-3 w-3 text-muted-foreground" /></motion.button>
              </motion.div>
            )) : <EmptyState title="FREE" subtitle="Nog vrij vandaag." />}
          </div>
        </GlassPanel>
      </motion.div>

      {/* 5.7 CONFLICT DETECTION */}
      {conflicts.length > 0 && (
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5 border border-urgent/40">
            <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-urgent" /><p className="text-[11px] font-semibold text-urgent uppercase tracking-wide">{conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} with Protected Time</p></div>
            <div className="space-y-2">
              {conflicts.map((b) => (
                <div key={b.id} className="rounded-xl glass-1 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-powder" /><span className="text-sm text-foreground/85">{b.title}</span></div>
                  <div className="flex gap-2">
                    <button onClick={() => updateBlock(b.id, { conflict_flag: false })} className="text-[10px] uppercase font-semibold text-muted-foreground">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* 5.6 SPACE × CAPACITY */}
      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="p-5">
          <SectionLabel className="mb-4">Space × Capacity</SectionLabel>
          <QuadrantMatrix spacePct={spacePct} capacity={capacity} />
        </GlassPanel>
      </motion.div>

      <AnimatePresence>{editing && <BlockEditDrawer block={editing} onClose={() => setEditing(null)} onUpdate={updateBlock} onDelete={deleteBlock} />}</AnimatePresence>
    </motion.div>
  );
}

function BlockEditDrawer({ block, onClose, onUpdate, onDelete }) {
  const [type, setType] = useState(block.type);
  const [title, setTitle] = useState(block.title);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-charcoal/20" />
      <motion.div initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm h-full glass-3 p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 left-5 h-8 w-8 rounded-full glass-1 flex items-center justify-center"><X className="h-4 w-4" /></button>
        <div className="mt-12 space-y-4">
          <p className="font-display font-semibold text-lg">Edit Block</p>
          <div><SectionLabel className="mb-1.5">Title</SectionLabel><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg glass-1 px-3 py-2 text-sm outline-none" /></div>
          <div><SectionLabel className="mb-1.5">Type</SectionLabel><div className="flex gap-1.5">{["rest", "recovery", "free", "protected"].map((t) => <button key={t} onClick={() => setType(t)} className={`text-[11px] rounded-full px-3 py-1.5 ${type === t ? "bg-olive text-white" : "glass-1 text-muted-foreground"}`}>{timeBlockLabel(t)}</button>)}</div></div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => onDelete(block.id)} className="flex-1 text-[11px] uppercase font-semibold text-urgent rounded-full py-2 glass-1">Delete</button>
            <button onClick={() => { onUpdate(block.id, { type, title, is_protected: type === "protected" }); onClose(); }} className="flex-1 text-[11px] uppercase font-semibold text-white bg-olive rounded-full py-2">Save</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };