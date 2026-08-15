import React from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Activiteit: recent aantal, bronverdeling (email/whatsapp/tasks/
 * giulia), per-bron groepering, wis categorie, tijdstempels. Focus: Giulia's
 * werklog, gegroepeerd op bron, wisbaar.
 * D2 "Bron-stroom" (16:7) — horizontale banen per bron; events drijven links
 * als puntjes binnen. Motion: puntjes drijven rechts-naar-links.
 * D3 "Puls-tijdlijn" (3:4) — verticale tijdlijn met event-punten; gegroepeerd
 * op tijd; nieuwste pulst. Motion: nieuwste pulst. */

const SRC_COLOR = { giulia: "var(--tile-accent)", email: "hsl(var(--ridge))", whatsapp: "hsl(var(--sand))", tasks: "hsl(var(--charcoal))", system: "hsl(var(--smoke))" };
const SRCS = ["giulia", "email", "whatsapp", "tasks", "system"];

export function ActivityDesign2() {
  const { data: items } = useEntityList("Activity", { sort: "-timestamp" });
  const list = (items || []).slice(0, 24);
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/7", ...accentVars("sand") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Activiteit · stroom</p>
        <span className="text-[10px] tabular-nums opacity-50">{items?.length || 0}</span>
      </div>
      <div className="flex-1 flex flex-col justify-around gap-1 min-h-0">
        {SRCS.map((src) => {
          const events = list.filter((a) => (a.source || "").toLowerCase() === src).slice(0, 6);
          return (
            <div key={src} className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider opacity-50 w-16 shrink-0">{src}</span>
              <div className="flex-1 relative h-3 flex items-center gap-1">
                {events.length === 0 && <span className="h-px flex-1 bg-ivory/8" />}
                {events.map((e, i) => (
                  <motion.span key={e.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: [0, 1, 0.6], x: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }} className="h-2 w-2 rounded-full shrink-0" style={{ background: SRC_COLOR[src] || "rgba(255,255,255,0.3)" }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActivityDesign3() {
  const { data: items, reload } = useEntityList("Activity", { sort: "-timestamp" });
  const list = (items || []).slice(0, 7);
  const clear = async () => { try { await base44.entities.Activity.deleteMany({}); reload(); } catch {} };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("sand") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Activiteit · log</p>
        <button onClick={clear} className="text-[10px] opacity-50 hover:opacity-100">wis</button>
      </div>
      <div className="relative flex-1 pl-3 min-h-0">
        <div className="absolute left-1 top-1 bottom-1 w-px bg-ivory/12" />
        <div className="space-y-2.5">
          {list.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative flex items-start gap-2">
              <span className="absolute -left-2.5 top-1 h-2.5 w-2.5 rounded-full" style={{ background: SRC_COLOR[(a.source || "").toLowerCase()] || "rgba(255,255,255,0.4)" }} />
              {i === 0 && <motion.span animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute -left-2.5 top-1 h-2.5 w-2.5 rounded-full" style={{ background: SRC_COLOR[(a.source || "").toLowerCase()] || "rgba(255,255,255,0.4)" }} />}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] leading-tight line-clamp-2">{a.description}</p>
                <p className="text-[8px] opacity-45">{a.source || ""} · {a.timestamp ? new Date(a.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
              </div>
            </motion.div>
          ))}
          {list.length === 0 && <p className="text-xs opacity-40 mt-6 text-center">Geen activiteit</p>}
        </div>
      </div>
    </div>
  );
}

export default { Design2: ActivityDesign2, Design3: ActivityDesign3 };