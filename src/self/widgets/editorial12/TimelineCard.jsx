import React, { useState } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PLUM } from "@/self/widgets/editorial/selfEditorial";

/** Interactieve horizontale tijdlijn — track met vloeiende voortgangsbalk,
 *  pulserende mijlpalen en klikbare knopen. */
function InteractiveTimeline({ items, active, setActive, accent }) {
  const pct = items.length > 1 ? (active / (items.length - 1)) * 100 : 0;
  return (
    <div className="relative pt-1 pb-5">
      <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }}>
        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: accent }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
        <motion.div className="absolute inset-y-0 rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", width: "30%" }} animate={{ left: ["-30%", "100%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between" style={{ padding: "0 2px" }}>
        {items.map((it, i) => (
          <button key={i} type="button" onClick={() => setActive(i)} className="relative -m-1 p-1 flex flex-col items-center">
            <motion.span className="block rounded-full" style={{ background: i <= active ? accent : "rgba(255,255,255,0.45)", width: i === active ? 14 : 9, height: i === active ? 14 : 9 }} animate={{ scale: i === active ? 1 : 0.9 }} transition={{ type: "spring", stiffness: 300 }} />
            {it.milestone && i <= active && <motion.span className="absolute rounded-full" style={{ border: `1px solid ${accent}`, width: 13, height: 13, top: 1 }} animate={{ scale: [1, 2.1], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }} />}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[7px] uppercase tracking-wider">
        {items.map((it, i) => <span key={i} className="text-center truncate" style={{ opacity: i === active ? 1 : 0.5, color: i === active ? accent : undefined, width: 56 }}>{it.label}</span>)}
      </div>
    </div>
  );
}

/** Verticale stap-tijdlijn — connector met vloeiende vulling + klikbare stappen. */
function StepTimeline({ items, active, setActive, accent }) {
  return (
    <div className="relative flex flex-col pl-1">
      <div className="absolute left-[6px] top-2 bottom-2 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }} />
      <motion.div className="absolute left-[6px] top-2 w-0.5 rounded-full" style={{ background: accent }} animate={{ height: `${items.length > 1 ? (active / (items.length - 1)) * 100 : 100}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      {items.map((it, i) => (
        <button key={i} type="button" onClick={() => setActive(i)} className="relative flex items-start gap-2.5 py-1.5 text-left">
          <motion.span className="relative z-10 mt-0.5 rounded-full shrink-0" style={{ background: i <= active ? accent : "rgba(255,255,255,0.4)", width: i === active ? 13 : 9, height: i === active ? 13 : 9 }} animate={{ scale: i === active ? 1 : 0.9 }} transition={{ type: "spring", stiffness: 300 }} />
          {it.milestone && i <= active && <motion.span className="absolute left-0 mt-0.5 rounded-full" style={{ border: `1px solid ${accent}`, width: 13, height: 13 }} animate={{ scale: [1, 2.1], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium leading-tight" style={{ opacity: i === active ? 1 : 0.6 }}>{it.label}</p>
            {it.sub && <p className="text-[9px] opacity-55 truncate">{it.sub}</p>}
          </div>
          {it.time && <span className="text-[8px] tabular-nums opacity-50 mt-0.5 shrink-0">{it.time}</span>}
        </button>
      ))}
    </div>
  );
}

/** TimelineCard — groot-foto frame met zwevende glas-kaart die een interactieve
 *  tijdlijn bevat (horizontaal of verticaal). Klikbare knopen/mijlpalen, vloeiende
 *  voortgangsbalk, pulserende milestone-ringen. */
export default function TimelineCard({ photo, onClick, aspectRatio, accent = PLUM, top, items, orientation = "horizontal", title }) {
  const [active, setActive] = useState(0);
  const cur = items[active] || {};
  const horiz = orientation === "horizontal";
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={onClick} className="min-h-0" style={{ aspectRatio, "--tile-accent": accent }}>
      <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
        <motion.img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(38,40,44,0.74), rgba(38,40,44,0.2) 46%, transparent 78%)" }} />
        {top && <div className="absolute left-3 top-3 right-10" style={{ color: "rgba(255,255,255,0.96)", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>{top}</div>}
        <div className="absolute left-2.5 right-2.5 bottom-2.5 rounded-2xl p-3" style={{ background: "rgba(38,40,44,0.6)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.95)" }}>
          {horiz ? (
            <>
              <div className="flex items-end justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <motion.p key={`l-${active}`} className="text-[17px] font-display font-semibold leading-tight truncate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>{cur.label}</motion.p>
                  {cur.sub && <motion.p key={`s-${active}`} className="text-[10px] opacity-65 truncate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.05 }}>{cur.sub}</motion.p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] tabular-nums font-semibold" style={{ color: accent }}>{active + 1}/{items.length}</span>
                  {cur.time && <p className="text-[8px] uppercase tracking-wider opacity-55">{cur.time}</p>}
                </div>
              </div>
              <InteractiveTimeline items={items} active={active} setActive={setActive} accent={accent} />
            </>
          ) : (
            <>
              {title && <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70 mb-1">{title}</p>}
              <StepTimeline items={items} active={active} setActive={setActive} accent={accent} />
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}