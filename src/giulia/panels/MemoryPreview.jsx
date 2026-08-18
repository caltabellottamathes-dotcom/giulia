import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

export default function MemoryPreview({ onOpen }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const data = await base44.entities.Memory.filter({}, "-created_date", 20); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  const catCount = new Set(items.map((i) => i.category)).size;
  const catData = useMemo(() => { const m = {}; items.forEach((i) => { const c = i.category || "Other"; m[c] = (m[c] || 0) + 1; }); return Object.entries(m).map(([n, v], i) => ({ label: n.slice(0, 4).toUpperCase(), value: v, c: [GIULIA.deep, GIULIA.mid, GIULIA.light, GIULIA.plum, GIULIA.urgent][i % 5] })); }, [items]);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Memory</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{items.length} herinneringen</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{catCount} categorieën · wat Giulia onthoudt</p>
        </div>
        <OpenLink to="/memory" label="Open Geheugen" color={GIULIA.light} />
      </div>

      {/* Ring + category chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <AnimatedRing pct={items.length ? 100 : 0} size={120} stroke={8} color={GIULIA.plum}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={items.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">HERINNERINGEN</span>
        </AnimatedRing>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Categorieën</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={catData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${GIULIA.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {catData.map((d, i) => <Cell key={i} fill={d.c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Memory list */}
      <SectionLabel>Wat Giulia onthoudt</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          {items.slice(0, 6).map((m, i) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={onOpen} className="group rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
              {m.category && <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: `${GIULIA.mid}22`, color: GIULIA.light }}>{m.category}</span>}
              <p className="block text-sm text-ivory/80 line-clamp-3 mt-1.5">{m.content}</p>
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Nog niets onthouden" />}

      <ContextGrid items={[
        { label: "TOTAAL", text: `${items.length} herinneringen opgeslagen.` },
        { label: "CATEGORIEËN", text: `${catCount} verschillende categorieën.` },
        { label: "LAATSTE", text: items[0] ? items[0].content?.slice(0, 60) + "…" : "Nog niets onthouden." },
      ]} />
      <ActionRow actions={[
        { label: "Open Geheugen", primary: true, color: GIULIA.light, to: "/memory" },
      ]} />
    </div>
  );
}