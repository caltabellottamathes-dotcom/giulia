import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, BarGrow, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d", LIGHT = "#d8dab3";
const SRC = { giulia: { c: MID, l: "GIULIA" }, email: { c: LIGHT, l: "EMAIL" }, whatsapp: { c: URG, l: "WA" }, tasks: { c: PLUM, l: "TASKS" }, system: { c: "rgba(255,255,255,0.4)", l: "SYS" } };

export default function ActivityPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const data = await base44.entities.Activity.filter({}, "-timestamp", 12); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); const unsub = base44.entities.Activity.subscribe(() => load()); return unsub; }, []);

  const counts = {};
  items.forEach(i => { const s = i.source || "system"; counts[s] = (counts[s] || 0) + 1; });
  const total = items.length;

  return (
    <PreviewShell index="16" section="ACTIVITY" statement={`${total} EVENTS`} kicker="LIVE FEED" accent={URG}
      context={[
        { label: "RECENT", text: `${total} gebeurtenissen in de feed.` },
        { label: "BRONNEN", text: `${Object.keys(counts).length} actieve bronnen.` },
        { label: "LAATSTE", text: items[0] ? items[0].description?.slice(0, 50) : "Geen activiteit." },
      ]}
      actions={[{ label: "Refresh", primary: true, onClick: load }, { label: "Filter", to: "/activity" }, { label: "Export", to: "/activity" }, { label: "Open Activiteit", to: "/activity" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={total ? 100 : 0} size={150} color={MID} label={String(total)} sub="EVENTS" /></div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">SIGNAL · LIVE</p>
            <PulseWave color={URG} bars={18} height={36} />
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">BY SOURCE</p>
            {Object.keys(SRC).map((k, i) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-storm/70">{SRC[k].l}</span>
                  <span className="text-storm tabular-nums">{counts[k] || 0}</span>
                </div>
                <BarGrow value={counts[k] || 0} max={Math.max(...Object.values(counts), 1)} color={SRC[k].c} delay={i * 0.12} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">FEED · {items.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence initial={false}>
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : items.length === 0 ? <p className="text-storm/40 text-sm">Geen activiteit.</p> : items.map(it => {
                const src = SRC[it.source] || SRC.system;
                return (
                  <motion.div key={it.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.4 }} onClick={onOpen} className="flex items-center gap-3 rounded-2xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-3 cursor-pointer transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: src.c }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-storm truncate">{it.description}</p>
                      <p className="text-[10px] text-storm/40 mt-0.5">{src.l} · {it.timestamp ? format(new Date(it.timestamp), "d MMM HH:mm") : "—"}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: `${src.c}22`, color: src.c }}>{src.l}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}