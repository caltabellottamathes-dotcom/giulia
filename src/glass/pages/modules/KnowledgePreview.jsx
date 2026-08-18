import React, { useState } from "react";
import { motion } from "framer-motion";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { AnimatedRing, BarGrow, LiveSparkline } from "@/glass/components/modules/viz";

const SAND = "#94925d", URG = "#d5e24a";
const TOPICS = [
  { n: "Brand", v: 80 }, { n: "Research", v: 64 }, { n: "Process", v: 48 }, { n: "Legal", v: 30 }, { n: "Ops", v: 22 },
];
const ARTICLES = [
  { id: 1, title: "Onze merkstem — gids", topic: "Brand", reads: 1240, read: false },
  { id: 2, title: "Onderzoeksmethode 101", topic: "Research", reads: 980, read: true },
  { id: 3, title: "Contractsjabloon NL", topic: "Legal", reads: 642, read: false },
  { id: 4, title: "Van idee tot lanceren", topic: "Process", reads: 410, read: false },
  { id: 5, title: "Backups handleiding", topic: "Ops", reads: 188, read: true },
  { id: 6, title: "Kleurenpallet keuzes", topic: "Brand", reads: 732, read: false },
];

export default function KnowledgePreview() {
  const [arts, setArts] = useState(ARTICLES);
  const [active, setActive] = useState(null);
  const totalReads = arts.reduce((s, a) => s + a.reads, 0);
  const toggle = (id) => setArts(a => a.map(x => x.id === id ? { ...x, read: !x.read } : x));
  return (
    <ModuleShell index="06" section="KNOWLEDGE" statement="BASE" kicker={`${arts.length} ARTICLES`}
      context={[
        { label: "COVERAGE", text: "62% van de kennisdomeinen gedocumenteerd." },
        { label: "READS", text: `${totalReads.toLocaleString("nl-NL")} lezers dit jaar.` },
        { label: "GAPS", text: "Legal en Ops hebben de minste dekking." },
      ]}
      actions={[{ label: "New Article", primary: true }, { label: "Search" }, { label: "Tags" }, { label: "Open Knowledge" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={62} size={180} color={SAND} label="62%" sub="COVERAGE" /></div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">TOPICS · KLIK OM TE MARKEREN</p>
            {TOPICS.map((t, i) => (
              <button key={t.n} onClick={() => setActive(active === t.n ? null : t.n)} className="block w-full mb-3 text-left">
                <div className="flex justify-between text-xs mb-1.5"><span className={active === t.n ? "text-urgent" : "text-storm/70"}>{t.n}</span><span className="text-storm tabular-nums">{t.v}%</span></div>
                <BarGrow value={t.v} max={100} color={active === t.n ? URG : SAND} delay={i * 0.1} />
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">READS · LIVE</p>
            <LiveSparkline color={SAND} max={40} intervalMs={1800} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">RECENT · {arts.length}</p>
            <p className="text-storm/50 text-[10px] tabular-nums">{totalReads.toLocaleString("nl-NL")} reads</p>
          </div>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {arts.map(a => (
              <motion.button key={a.id} layout onClick={() => toggle(a.id)} className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${a.read ? "border-marble/15 bg-marble/5" : "border-marble/25 bg-marble/8 hover:bg-marble/15"}`}>
                <span className="w-1.5 h-10 rounded-full shrink-0" style={{ background: active === a.topic ? URG : SAND }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${a.read ? "text-storm/50" : "text-storm"}`}>{a.title}</p>
                  <p className="text-[10px] text-storm/50 mt-0.5">{a.topic} · {a.reads} reads</p>
                </div>
                <span className="text-[10px] text-storm/40 shrink-0">{a.read ? "✓" : "○"}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}