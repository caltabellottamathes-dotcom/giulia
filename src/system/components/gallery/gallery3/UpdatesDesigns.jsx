import React from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Updates (Achter de schermen): feed van afgeronde taken, "wat er
 * nieuw is", Giulia's achtergrondacties. Focus: afgeronde-werk feed,
 * transparantie.
 * D2 "Klaar-ticker" (16:6) — horizontale ticker van afgeronde items;
 * tik opent. Motion: ticker scrolt.
 * D3 "Stats + klaar-lijst" (3:4) — boven: afgeronden-vandaag groot; onder:
 * lijst met tijdstempels. Motion: count-up; lijst fade. */

export function UpdatesDesign2() {
  const { data: tasks } = useEntityList("Task");
  const done = (tasks || []).filter((t) => t.status === "completed").slice(0, 10);
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/6", ...accentVars("sand") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Updates · klaar</p>
        <span className="text-[10px] tabular-nums opacity-50">{done.length} vandaag</span>
      </div>
      <div className="flex-1 flex items-center overflow-hidden">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="flex gap-2 whitespace-nowrap">
          {[...done, ...done].map((t, i) => (
            <div key={i} className="glass-1 rounded-full px-3 py-1.5 text-[11px] font-medium shrink-0">✓ {t.title}</div>
          ))}
          {done.length === 0 && <p className="text-xs opacity-40 px-2">Nog niets afgerond</p>}
        </motion.div>
      </div>
    </div>
  );
}

export function UpdatesDesign3() {
  const { data: tasks } = useEntityList("Task");
  const done = (tasks || []).filter((t) => t.status === "completed").slice(0, 6);
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("sand") }}>
      <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65 mb-1">Updates · vandaag</p>
      <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-display font-bold leading-none">{done.length}</motion.span>
      <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">afgerond</p>
      <div className="mt-3 flex-1 space-y-1.5 overflow-hidden min-h-0">
        {done.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="glass-1 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--tile-accent)" }} />
            <span className="text-[10px] truncate flex-1">{t.title}</span>
            <span className="text-[9px] opacity-45 shrink-0">{(t.updated_date || "").slice(11, 16)}</span>
          </motion.div>
        ))}
        {done.length === 0 && <p className="text-xs opacity-40 text-center mt-6">Nog niets afgerond</p>}
      </div>
    </div>
  );
}

export default { Design2: UpdatesDesign2, Design3: UpdatesDesign3 };