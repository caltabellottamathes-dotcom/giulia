import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import { RotateCcw } from "lucide-react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { CountUp, LiveSparkline } from "@/glass/components/modules/viz";

const SAND = "#94925d", OLIVE = "#d8dab3", URG = "#d5e24a";
const MONTH = [{ m: "Mrt", v: 8 }, { m: "Apr", v: 5 }, { m: "Mei", v: 11 }, { m: "Jun", v: 7 }, { m: "Jul", v: 14 }, { m: "Aug", v: 4 }];
const ARCH = [
  { id: 1, title: "Marktonderzoek Q2 afronding", cat: "Onderzoek", archived: "2 jun" },
  { id: 2, title: "Concept Brons moodboard", cat: "Concept", archived: "14 jun" },
  { id: 3, title: "Identiteit logo v1", cat: "Identiteit", archived: "1 jul" },
  { id: 4, title: "Afspraak notities Giulia", cat: "Afspraken", archived: "8 jul" },
  { id: 5, title: "Vergader 22 juni uitwerking", cat: "Onderzoek", archived: "23 jul" },
  { id: 6, title: "Pitch deck draft 3", cat: "Concept", archived: "30 jul" },
];

export default function TaskArchivePreview() {
  const [items, setItems] = useState(ARCH);
  const restore = (id) => setItems(it => it.filter(i => i.id !== id));
  return (
    <ModuleShell index="09" section="ARCHIVE" statement={`${items.length} GEARCHIVEERD`} kicker="TAKEN"
      context={[
        { label: "TOTAL", text: `${items.length} taken in het archief.` },
        { label: "THIS MONTH", text: "4 taken gearchiveerd in augustus." },
        { label: "TREND", text: "Piekmoment in juli — 14 archiveringen." },
      ]}
      actions={[{ label: "Restore All", primary: true }, { label: "Export" }, { label: "Purge" }, { label: "Open Archief" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">ARCHIVED</p>
            <p className="text-storm text-5xl font-bold mt-1 tabular-nums"><CountUp to={items.length} /></p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER MAAND</p>
            <div className="h-32 rounded-2xl border border-marble/20 bg-marble/5 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTH}>
                  <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                    {MONTH.map((w, i) => <Cell key={i} fill={i === MONTH.length - 1 ? URG : SAND} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">RESTORES · LIVE</p>
            <LiveSparkline color={OLIVE} max={8} intervalMs={2000} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">KLIK OM TE HERSTELLEN</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence>
              {items.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-marble/20 bg-marble/5 p-8 text-center">
                  <p className="text-storm text-lg font-semibold">Archief leeg</p>
                  <p className="text-storm/50 text-sm mt-1">Alles is hersteld.</p>
                </motion.div>
              )}
              {items.map(it => (
                <motion.div key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 rounded-2xl border border-marble/20 bg-marble/5 px-4 py-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SAND }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-storm truncate">{it.title}</p>
                    <p className="text-[10px] text-storm/50">{it.cat} · gearchiveerd {it.archived}</p>
                  </div>
                  <button onClick={() => restore(it.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-marble/30 bg-marble/5 text-storm/70 hover:bg-olive hover:text-plum text-[10px] tracking-wider uppercase transition-colors shrink-0"><RotateCcw className="w-3 h-3" />Restore</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}