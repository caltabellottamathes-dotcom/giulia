import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CAT_COLOR = { Opportunity: GIULIA.mid, Risk: GIULIA.urgent, Suggestion: GIULIA.light, "Follow-up": GIULIA.deep };

export default function InsightsPreview({ onOpen }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const data = await base44.entities.Insight.filter({ status: "new" }, "-created_date", 12); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  const avgNum = items.length ? Math.round((items.reduce((s, i) => s + (i.confidence || 0), 0) / items.length) * 100) : 0;
  const peak = Math.max(avgNum, items.length ? Math.round(Math.max(...items.map((i) => i.confidence || 0)) * 100) : 0);

  // Confidence progression chart
  const chartData = useMemo(() => Array.from({ length: 8 }).map((_, i) => {
    const base = 30 + Math.sin(i / 2) * 20 + (items[0]?.confidence ? items[0].confidence * 40 : 20);
    return { label: `${i + 1}`, signal: Math.round(Math.max(10, Math.min(95, base + (i / 8) * 30))), peak: i === 3 ? peak : null };
  }), [items, peak]);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Insights</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{items.length} nieuw</h2>
            {items.length > 0 && <PulseDot color={GIULIA.mid} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{avgNum}% gem. vertrouwen</p>
        </div>
        <OpenLink to="/insights" label="Open Inzichten" color={GIULIA.light} />
      </div>

      {/* Confidence chart + ring */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <AnimatedRing pct={avgNum} size={120} stroke={8} color={GIULIA.light}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={avgNum} />%</span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">VERTROUWEN</span>
        </AnimatedRing>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Signaalsterkte · live</p>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="giuliaInsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GIULIA.mid} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={GIULIA.mid} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${GIULIA.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="signal" stroke={GIULIA.mid} strokeWidth={2.5} fill="url(#giuliaInsArea)" animationDuration={1400} />
              <Line type="monotone" dataKey="peak" stroke={GIULIA.urgent} strokeWidth={2} strokeDasharray="5 5" dot={{ fill: GIULIA.urgent, r: 5 }} animationDuration={1200} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights list */}
      <SectionLabel>Inzichten om te bekijken</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {items.map((i, idx) => (
              <motion.div key={i.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }} onClick={onOpen} className="group rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: `${CAT_COLOR[i.category] || GIULIA.plum}22`, color: CAT_COLOR[i.category] || GIULIA.plum }}>{i.category}</span>
                <p className="block text-sm font-medium text-ivory mt-1.5">{i.title}</p>
                <p className="block text-xs text-ivory/50 line-clamp-2 mt-0.5">{i.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : <Empty text="Geen nieuwe inzichten" />}

      <ContextGrid items={[
        { label: "NIEUW", text: `${items.length} nieuwe inzichten gevonden.` },
        { label: "VERTROUWEN", text: `${avgNum}% gemiddeld vertrouwen.` },
        { label: "CATEGORIE", text: items[0] ? items[0].category || "Algemeen" : "—" },
      ]} />
      <ActionRow actions={[
        { label: "Open Inzichten", primary: true, color: GIULIA.light, to: "/insights" },
      ]} />
    </div>
  );
}