import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { journalTypeLabel, fmtTime, fmtDate } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { ContextGrid, ActionRow, OpenLink } from "@/self/components/SelfViz";
import { Plus, Star, Sparkles } from "lucide-react";

const WEIGHT = { entry: "sm", moment: "md", reflection: "sm", highlight: "lg", thread: "xs" };
const dot = { xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3.5 h-3.5", lg: "w-4 h-4" };
const barH = { xs: 12, sm: 24, md: 40, lg: 60 };

export default function JournalPanel() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "entry", content: "" });

  const load = async () => {
    try { const list = await base44.entities.JournalEntry.list("-date", 50).catch(() => []); setEntries(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = useMemo(() => {
    const d = new Date().toDateString();
    return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries]);
  const moments = useMemo(() => today.filter((e) => e.type === "moment" || e.type === "highlight"), [today]);
  const highlights = useMemo(() => (entries || []).filter((e) => e.is_highlight).slice(0, 3), [entries]);

  const MOMENTS = today.map((e) => ({ time: fmtTime(e.date), label: e.title, weight: WEIGHT[e.type] || "sm", tag: (e.type || "entry").toUpperCase(), open: e.is_highlight }));
  const tagCounts = useMemo(() => {
    const m = {};
    for (const e of entries || []) for (const t of e.tags || []) m[t] = (m[t] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t);
  }, [entries]);

  const chartData = MOMENTS.map((m, i) => ({ label: `${i + 1}`, value: barH[m.weight] || 16, color: m.weight === "lg" ? SAND : BLUE }));

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.JournalEntry.create({ title: form.title.trim(), type: form.type, content: form.content || undefined, date: new Date().toISOString() }); setForm({ title: "", type: "entry", content: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const highlight = MOMENTS.find((m) => m.open) || MOMENTS[MOMENTS.length - 1];

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Journal</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{moments.length} momenten</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{today.length ? `${today.length} entries vandaag` : "Vandaag is leeg — voeg iets toe."}</p>
        </div>
        <OpenLink to="/self/journal" label="Open Journal" />
      </div>

      {/* Timeline + magnitude — full glass layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        {/* Timeline */}
        <div className="glass-card-2 rounded-2xl p-5 relative">
          <p className="text-ivory/50 text-[10px] uppercase tracking-[0.22em] mb-4">Vandaag · {MOMENTS.length} moments</p>
          <div className="relative">
            <div className="absolute left-[88px] top-4 bottom-4 w-px bg-ivory/15" />
            <AnimatePresence>
              {MOMENTS.length ? MOMENTS.slice(0, 8).map((m, i) => (
                <motion.div key={i} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-4 py-3 relative">
                  <span className="w-16 text-ivory text-sm font-semibold tabular-nums text-right pt-1">{m.time}</span>
                  <span className={`z-10 mt-1.5 rounded-full shrink-0 ${dot[m.weight]}`} style={{ background: m.open ? SAND : BLUE }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory font-medium truncate">{m.label}</p>
                    {m.open && <motion.div className="mt-2 h-px w-24" style={{ background: SAND }} initial={{ width: 0 }} animate={{ width: 96 }} transition={{ delay: 0.3 }} />}
                    {!m.open && <p className="text-ivory/40 text-[10px] tracking-[0.18em] mt-1">{m.tag}</p>}
                  </div>
                </motion.div>
              )) : <p className="text-ivory/40 text-sm">Vandaag is nog leeg — voeg een moment toe.</p>}
            </AnimatePresence>
          </div>
        </div>

        {/* Emerging tags + magnitude chart */}
        <div className="space-y-4">
          <div className="glass-card-2 rounded-2xl p-5">
            <p className="text-ivory/80 text-[10px] uppercase tracking-[0.22em] mb-4 font-semibold">Emerging</p>
            <div className="flex flex-wrap gap-2">
              {tagCounts.length ? tagCounts.map((t, i) => (
                <motion.span key={t} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  className="text-xs px-3 py-1.5 rounded-full border" style={{ background: i === 0 ? "rgba(216,218,179,0.15)" : "rgba(225,231,239,0.15)", color: i === 0 ? SAND : BLUE, borderColor: i === 0 ? "rgba(216,218,179,0.4)" : "rgba(225,231,239,0.3)" }}>{t}</motion.span>
              )) : <p className="text-ivory/40 text-xs">Nog geen tags.</p>}
            </div>
          </div>
          <div className="glass-card-2 rounded-2xl p-5">
            <p className="text-ivory/50 text-[10px] uppercase tracking-[0.22em] mb-3">Magnitude</p>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-ivory/40 text-xs">—</p>}
            <p className="text-ivory/40 text-[9px] tracking-wider mt-2 text-center">over de dag</p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Highlights</p>
          <div className="flex flex-col gap-1.5">
            {highlights.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 glass-card-2 rounded-xl px-3.5 py-2.5">
                <Star className="w-3.5 h-3.5 shrink-0" style={{ color: SAND }} />
                <p className="text-sm font-medium truncate flex-1">{h.title}</p>
                <span className="text-[10px] text-ivory/45">{fmtDate(h.date)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "TODAY'S HIGHLIGHT", text: highlight ? highlight.label : "Nog geen highlight vandaag." },
        { label: "EMERGING", text: tagCounts.length ? tagCounts.join(", ") : "Nog geen terugkerende tags." },
        { label: "TOTAL", text: `${entries.length} entries in je journal.` },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Add Moment", primary: true, onClick: () => { setForm({ title: "", type: "moment", content: "" }); setShowAdd(true); } },
        { label: "Add Note", onClick: () => setShowAdd((v) => !v) },
        { label: "Open Journal", to: "/self/journal" },
      ]} />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titel" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
                {["entry", "moment", "reflection", "highlight", "thread"].map((t) => <option key={t} value={t} className="text-charcoal">{journalTypeLabel(t)}</option>)}
              </select>
              <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Inhoud" rows={3} className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none resize-none" />
              <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}