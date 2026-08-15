import React from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Geheugen: aantal herinneringen, gem. zekerheid-ring, top-
 * herinnering met categorie, zekerheid bijstellen ±. Focus: wat Giulia
 * onthoudt + zekerheid afstellen.
 * D2 "Zekerheids-constellatie" (1:1) — herinneringen als punten geschaald op
 * zekerheid; lage zekerheid dim; tik verhoogt. Motion: punten ademen.
 * D3 "Geheugenkaarten met schuif" (3:4) — stapel kaarten; elk met een
 * zekerheid-slider die je sleept. Focus: zekerheid per herinnering tunen. */

export function MemoryDesign2() {
  const { data: memories, reload } = useEntityList("Memory", { sort: "-created_date" });
  const list = (memories || []).slice(0, 9);
  const boost = async (m) => { try { await base44.entities.Memory.update(m.id, { confidence: Math.min(1, +(m.confidence || 0.5) + 0.1) }); reload(); } catch {} };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars("charcoal") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Geheugen · veld</p>
        <span className="text-[10px] tabular-nums opacity-50">{memories?.length || 0}</span>
      </div>
      <div className="relative flex-1 min-h-0">
        {list.map((m, i) => {
          const conf = m.confidence || 0.5;
          const cols = Math.ceil(Math.sqrt(list.length));
          const x = (i % cols) / Math.max(1, cols - 1) * 80 + 10;
          const y = Math.floor(i / cols) / Math.max(1, Math.ceil(list.length / cols) - 1) * 80 + 10;
          const size = 10 + conf * 26;
          return (
            <motion.button key={m.id} onClick={() => boost(m)}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
              className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: "var(--tile-accent)", opacity: 0.3 + conf * 0.7 }} title={m.content?.slice(0, 40)}>
              <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity }} className="block h-full w-full rounded-full" style={{ background: "var(--tile-accent)" }} />
            </motion.button>
          );
        })}
        {list.length === 0 && <p className="m-auto text-xs opacity-40">Nog niets onthouden</p>}
      </div>
      <p className="text-[9px] opacity-45 text-center mt-1">grootte = zekerheid · tik om te versterken</p>
    </div>
  );
}

export function MemoryDesign3() {
  const { data: memories, reload } = useEntityList("Memory", { sort: "-created_date" });
  const list = (memories || []).slice(0, 4);
  const setConf = async (m, v) => { try { await base44.entities.Memory.update(m.id, { confidence: v }); reload(); } catch {} };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("charcoal") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Geheugen · zekerheid</p>
        <span className="text-[10px] tabular-nums opacity-50">{memories?.length || 0}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden min-h-0">
        {list.map((m, i) => {
          const conf = m.confidence || 0.5;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-1 rounded-xl p-2.5">
              <span className="text-[9px] uppercase tracking-wider opacity-55">{m.category}</span>
              <p className="text-[11px] leading-snug line-clamp-2 mt-0.5">{m.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <input type="range" min={0} max={100} value={Math.round(conf * 100)} onChange={(e) => setConf(m, +e.target.value / 100)} className="flex-1 accent-ivory h-1" />
                <span className="text-[9px] tabular-nums opacity-60 w-7 text-right">{Math.round(conf * 100)}%</span>
              </div>
            </motion.div>
          );
        })}
        {list.length === 0 && <p className="m-auto text-xs opacity-40">Nog niets onthouden</p>}
      </div>
    </div>
  );
}

export default { Design2: MemoryDesign2, Design3: MemoryDesign3 };