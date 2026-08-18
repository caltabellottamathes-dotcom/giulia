import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, LiveSparkline } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d", LIGHT = "#d8dab3";
const CAT_C = [PLUM, MID, LIGHT, URG, "#6b6a4a"];

export default function MemoryPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Memory.filter({}, "-created_date", 30).then(data => setItems(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const catData = useMemo(() => {
    const m = {};
    items.forEach(i => { const c = i.category || "Other"; m[c] = (m[c] || 0) + 1; });
    return Object.entries(m).map(([n, v], i) => ({ n: n.slice(0, 8), v, c: CAT_C[i % 5] }));
  }, [items]);

  return (
    <PreviewShell index="18" section="MEMORY" statement={`${items.length} HERINNERINGEN`} kicker="WAT GIULIA ONTHOUDT" accent={URG}
      context={[
        { label: "TOTAAL", text: `${items.length} herinneringen opgeslagen.` },
        { label: "CATEGORIEËN", text: `${catData.length} verschillende categorieën.` },
        { label: "LAATSTE", text: items[0] ? items[0].content?.slice(0, 50) + "…" : "Nog niets onthouden." },
      ]}
      actions={[{ label: "New Memory", primary: true, to: "/memory" }, { label: "Search", to: "/memory" }, { label: "Tags", to: "/memory" }, { label: "Open Geheugen", to: "/memory" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={items.length ? 100 : 0} size={150} color={PLUM} label={String(items.length)} sub="HERINNERINGEN" /></div>
          {catData.length > 0 && (
            <div>
              <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CATEGORIEËN</p>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={catData} dataKey="v" nameKey="n" innerRadius={30} outerRadius={50} paddingAngle={3} isAnimationActive animationDuration={1000}>
                    {catData.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {catData.map(c => <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">RECALLS · LIVE</p>
            <LiveSparkline color={MID} max={20} intervalMs={2000} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">WAT GIULIA ONTHOUDT · {items.length}</p>
          <div className="flex-1 overflow-auto pr-1 flex flex-col gap-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : items.length === 0 ? <p className="text-storm/40 text-sm">Nog niets onthouden.</p> : items.slice(0, 8).map((m, i) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={onOpen} className="rounded-2xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-3 cursor-pointer transition-colors">
                {m.category && <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: `${(CAT_C[Object.keys(catData.reduce((acc, c) => { acc[c.n] = c.c; return acc; }, {})).indexOf(m.category?.slice(0, 8)) % 5] || MID)}22`, color: CAT_C[Object.keys(catData.reduce((acc, c) => { acc[c.n] = c.c; return acc; }, {})).indexOf(m.category?.slice(0, 8)) % 5] || MID }}>{m.category}</span>}
                <p className="block text-sm text-storm/80 line-clamp-3 mt-1.5">{m.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}