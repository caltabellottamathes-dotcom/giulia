import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, BarGrow, LiveSparkline } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const MID = "#94925d", URG = "#d5e24a";

export default function KnowledgePreview({ onOpen }) {
  const [arts, setArts] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Knowledge.filter({}, "-created_date", 30).then(data => setArts(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setArts(a => a.map(x => x.id === id ? { ...x, _read: !x._read } : x));

  const TOPICS = ["Research", "Notes", "Insights", "References", "Decisions"].map((n, i) => ({ n, v: Math.min(100, arts.filter(a => a.category === n).length * 20 + 20) }));
  const totalReads = arts.length * 120;

  return (
    <PreviewShell index="06" section="KNOWLEDGE" statement="BASE" kicker={`${arts.length} ARTICLES`} accent={URG}
      context={[
        { label: "COVERAGE", text: `${Math.min(100, arts.length * 10)}% van de kennisdomeinen gedocumenteerd.` },
        { label: "ENTRIES", text: `${arts.length} artikelen in de kennisbank.` },
        { label: "GAPS", text: "Research en References hebben de minste dekking." },
      ]}
      actions={[{ label: "New Article", primary: true, to: "/knowledge" }, { label: "Search", to: "/knowledge" }, { label: "Tags", to: "/knowledge" }, { label: "Open Knowledge", to: "/knowledge" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={Math.min(100, arts.length * 10)} size={150} color={MID} label={`${Math.min(100, arts.length * 10)}%`} sub="COVERAGE" /></div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">TOPICS · KLIK OM TE MARKEREN</p>
            {TOPICS.map((t, i) => (
              <button key={t.n} onClick={() => setActive(active === t.n ? null : t.n)} className="block w-full mb-3 text-left">
                <div className="flex justify-between text-xs mb-1.5"><span className={active === t.n ? "text-urgent" : "text-storm/70"}>{t.n}</span><span className="text-storm tabular-nums">{t.v}%</span></div>
                <BarGrow value={t.v} max={100} color={active === t.n ? URG : MID} delay={i * 0.1} />
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">READS · LIVE</p>
            <LiveSparkline color={MID} max={40} intervalMs={1800} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">RECENT · {arts.length}</p>
            <p className="text-storm/50 text-[10px] tabular-nums">{totalReads.toLocaleString("nl-NL")} reads</p>
          </div>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : arts.length === 0 ? <p className="text-storm/40 text-sm">Geen artikelen.</p> : arts.map(a => (
              <motion.button key={a.id} layout onClick={() => toggle(a.id)} className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${a._read ? "border-marble/15 bg-marble/5" : "border-marble/25 bg-marble/8 hover:bg-marble/15"}`}>
                <span className="w-1.5 h-10 rounded-full shrink-0" style={{ background: active === a.category ? URG : MID }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${a._read ? "text-storm/50" : "text-storm"}`}>{a.title}</p>
                  <p className="text-[10px] text-storm/50 mt-0.5">{a.category || "Notes"} · {a.source || "—"}</p>
                </div>
                <span className="text-[10px] text-storm/40 shrink-0">{a._read ? "✓" : "○"}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}