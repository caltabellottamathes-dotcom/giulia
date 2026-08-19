import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { fmtDuration, timeBlockLabel } from "@/lib/selfUtils";
import { BLUE, SAND, fmtDur } from "@/glass/components/self/palette";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { Plus, Shield } from "lucide-react";

const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;

export default function PersonalTimePanel() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "free", duration_min: 30 });

  const load = async () => {
    try { const list = await base44.entities.PersonalTimeBlock.list("-start", 50).catch(() => []); setBlocks(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const todayBlocks = useMemo(() => {
    const d = new Date().toDateString();
    return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled");
  }, [blocks]);
  const total = useMemo(() => todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const protectedMin = useMemo(() => todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const rest = useMemo(() => todayBlocks.filter((b) => b.type === "rest").reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const recovery = useMemo(() => todayBlocks.filter((b) => b.type === "recovery").reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const free = useMemo(() => todayBlocks.filter((b) => b.type === "free").reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const available = Math.max(0, totalDayMin - total);

  const COMP = todayBlocks.map((b) => ({ w: b.duration_min || 30, c: b.is_protected ? BLUE : b.type === "rest" ? SAND : b.type === "recovery" ? "rgba(216,218,179,0.5)" : "rgba(255,255,255,0.15)" })).concat([{ w: available, c: "rgba(255,255,255,0.05)" }]);
  const ROWS = [
    { label: "PROTECTED", min: protectedMin, c: BLUE },
    { label: "REST", min: rest, c: SAND },
    { label: "RECOVERY", min: recovery, c: "rgba(216,218,179,0.5)" },
    { label: "FREE", min: free, c: "rgba(255,255,255,0.2)" },
  ];

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
      await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.type === "protected" });
      setForm({ title: "", type: "free", duration_min: 30 }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const h = Math.floor(available / 60), m = available % 60;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Personal Time</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{fmtDuration(total)}</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{protectedMin > 0 ? `${fmtDuration(protectedMin)} beschermd` : "Geen beschermde tijd vandaag"}</p>
        </div>
        <OpenLink to="/life/social?view=personal-time" label="Open Personal Time" />
      </div>

      {/* Available big clock */}
      <div className="flex items-end gap-6">
        <div>
          <p className="text-ivory text-7xl font-bold tabular-nums leading-none">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}</p>
          <p className="text-[11px] mt-3 tracking-[0.25em]" style={{ color: SAND }}>AVAILABLE TODAY</p>
        </div>
        <p className="text-ivory/55 text-sm pb-3 max-w-xs leading-relaxed">De dag als één ruimtelijke structuur. {todayBlocks.length ? `${todayBlocks.length} blokken gepland.` : "Nog vrij — plan je tijd."}</p>
      </div>

      {/* Day composition */}
      <div>
        <p className="text-ivory/50 text-[10px] uppercase tracking-[0.22em] mb-3">Day composition</p>
        <div className="flex h-8 rounded-xl overflow-hidden gap-0.5">
          {COMP.map((seg, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ width: `${(seg.w / totalDayMin) * 100}%`, background: seg.c }} />
          ))}
        </div>
        <div className="flex justify-between text-ivory/40 text-[10px] tracking-wider mt-2">
          <span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </div>

      {/* Breakdown rows — full glass visualization */}
      <div className="glass-card-2 rounded-2xl p-5">
        <div className="flex flex-col gap-5">
          {ROWS.map((row, ri) => (
            <div key={row.label} className="flex items-center gap-4">
              <span className="w-24 text-ivory text-sm font-medium tracking-wide">{row.label}</span>
              <div className="flex-1 flex gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div key={i} className="h-10 flex-1 rounded-md"
                    initial={{ background: "rgba(255,255,255,0.05)" }}
                    animate={{ background: i < Math.round((row.min / totalDayMin) * 20) ? row.c : "rgba(255,255,255,0.05)" }}
                    transition={{ delay: ri * 0.1 + i * 0.02 }} />
                ))}
              </div>
              <span className="w-14 text-right text-ivory/50 text-xs tabular-nums">{row.min > 0 ? fmtDur(row.min) : "—"}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-ivory/10">
          {[
            { l: "PROTECTED", c: BLUE }, { l: "REST", c: SAND }, { l: "RECOVERY", c: "rgba(216,218,179,0.5)" }, { l: "FREE", c: "rgba(255,255,255,0.2)" },
          ].map((x) => (
            <span key={x.l} className="flex items-center gap-2 text-[10px] tracking-wider" style={{ color: x.c }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: x.c }} />{x.l}
            </span>
          ))}
        </div>
      </div>

      {/* Today's blocks */}
      {todayBlocks.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Vandaag</p>
          <div className="flex flex-col gap-1.5">
            {todayBlocks.slice(0, 5).map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-2 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                {b.is_protected && <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: BLUE }} />}
                <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: b.is_protected ? BLUE : b.type === "rest" ? SAND : "rgba(255,255,255,0.5)" }}>{timeBlockLabel(b.type)}</span>
                <p className="text-sm font-medium truncate flex-1">{b.title}</p>
                <span className="text-[10px] tabular-nums text-ivory/55">{fmtDuration(b.duration_min)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "PROTECTED", text: `${fmtDur(protectedMin)} bewust gereserveerd vandaag.` },
        { label: "AVAILABLE", text: available > 0 ? `Nog ${fmtDur(available)} vrije ruimte.` : "Dag is vol." },
        { label: "AT RISK", text: todayBlocks.length > 3 ? "Persoonlijke tijd mogelijk onder druk door veel blokken." : "Geen druk zichtbaar." },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Protect Time", primary: true, onClick: async () => { const start = new Date().toISOString(); const end = new Date(Date.now() + 30 * 60000).toISOString(); await base44.entities.PersonalTimeBlock.create({ title: "Beschermd moment", type: "protected", start, end, duration_min: 30, status: "scheduled", is_protected: true }); await load(); } },
        { label: "Add Block", onClick: () => setShowAdd((v) => !v) },
        { label: "Open Personal Time", to: "/self/personal-time" },
      ]} />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
              <div className="flex gap-2">
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
                  {["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t} className="text-charcoal">{timeBlockLabel(t)}</option>)}
                </select>
                <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} placeholder="min" className="w-20 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none" />
              </div>
              <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}