import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, LiveBarChart } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

export default function KnowledgePreview({ onOpen }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const data = await base44.entities.Knowledge.filter({}, "-created_date", 20); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  const cats = useMemo(() => { const m = {}; items.forEach((i) => { const c = i.category || "Notes"; m[c] = (m[c] || 0) + 1; }); return Object.entries(m).map(([n, v], i) => ({ label: n.slice(0, 3).toUpperCase(), value: v, c: [FOCUS.deep, FOCUS.mid, FOCUS.light, FOCUS.urgent][i % 4] })); }, [items]);
  const catCount = new Set(items.map((i) => i.category)).size;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Knowledge</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{items.length} notities</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{catCount} categorieën</p>
        </div>
        <OpenLink to="/knowledge" label="Open Knowledge" color={FOCUS.light} />
      </div>

      {/* Ring + category chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <AnimatedRing pct={items.length ? 100 : 0} size={140} stroke={8} color={FOCUS.light}>
          <span className="text-ivory text-4xl font-bold tabular-nums leading-none"><CountUp value={items.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">NOTITIES</span>
        </AnimatedRing>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Categorieën</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={cats} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${FOCUS.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {cats.map((d, i) => <Cell key={i} fill={d.c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent knowledge */}
      <SectionLabel>Recente kennis</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          {items.slice(0, 6).map((k, i) => (
            <motion.div key={k.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={onOpen} className="group rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
              {k.category && <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: `${FOCUS.light}20`, color: FOCUS.light }}>{k.category}</span>}
              <p className="block text-sm font-medium text-ivory mt-1.5 truncate">{k.title}</p>
              {k.content && <p className="block text-xs text-ivory/50 line-clamp-2 mt-0.5">{k.content}</p>}
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Nog geen kennis opgeslagen" />}

      <ContextGrid items={[
        { label: "TOTAAL", text: `${items.length} notities opgeslagen.` },
        { label: "CATEGORIEËN", text: `${catCount} verschillende categorieën.` },
        { label: "LAATSTE", text: items[0] ? items[0].title : "Nog niets opgeslagen." },
      ]} />
      <ActionRow actions={[
        { label: "Open Knowledge", primary: true, color: FOCUS.light, to: "/knowledge" },
      ]} />
    </div>
  );
}