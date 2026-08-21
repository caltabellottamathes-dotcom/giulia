import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useTaskChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";
const ACCENT = "hsl(var(--giulia-coral))";

/** Kleine geanimeerde orbit — het "little animation" emblem linksboven. */
function Orbit() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0">
      <circle cx="13" cy="13" r="11" fill="none" stroke={ACCENT} strokeWidth="1.4" strokeOpacity="0.35" />
      <motion.g style={{ transformOrigin: "13px 13px" }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
        <circle cx="13" cy="2.5" r="2.4" fill={ACCENT} />
      </motion.g>
      <motion.g style={{ transformOrigin: "13px 13px" }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: -2 }}>
        <circle cx="23.5" cy="13" r="1.4" fill={ACCENT} fillOpacity="0.6" />
      </motion.g>
      <circle cx="13" cy="13" r="1.6" fill={ACCENT} />
    </svg>
  );
}

/** Grote live voortgangsring met percentage — vult mee met de checklist rechts. */
function BigRing({ value }) {
  const size = 176, stroke = 13, r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ACCENT} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} animate={{ strokeDashoffset: off }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-display font-semibold tabular-nums text-foreground leading-none">{Math.round(value * 100)}<span className="text-2xl text-foreground/50">%</span></span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/50 mt-2 font-semibold">volbracht</span>
      </div>
    </div>
  );
}

/** Afvink-chip — glas over de foto, geen overlay-laag. */
function Chip({ it, onToggle }) {
  return (
    <motion.button type="button" onClick={onToggle} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left transition-colors"
      style={{ background: "rgba(255,255,255,0.62)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.7)" }}>
      <span className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: it.done ? ACCENT : "hsl(var(--foreground) / 0.4)", background: it.done ? ACCENT : "transparent" }}>
        {it.done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium leading-tight truncate ${it.done ? "text-foreground/40 line-through" : "text-foreground"}`}>{it.label}</p>
        {it.sub && <p className={`text-[10px] truncate ${it.done ? "text-foreground/30" : "text-foreground/50"}`}>{it.sub}</p>}
      </div>
    </motion.button>
  );
}

/** What Matters? — 16:9 glas-shell. Links: orbit+titel, datum+tijd (live), grote
 *  voortgangsring. Rechts: fotokaart (geen overlay) met de afvinkbare planning
 *  van de dag; vink aan → linker ring vult. */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, allDone, closed, close, reopen } = useTaskChecklist();
  const pct = total ? doneCount / total : 0;

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const dateStr = now.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="relative w-full aspect-video rounded-[28px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(40px) saturate(1.4)", WebkitBackdropFilter: "blur(40px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 24px 60px -28px rgba(0,0,0,0.25)" }}>
      <div className="flex h-full">
        {/* LINKS — glas-content */}
        <div className="flex-[2] p-5 sm:p-7 flex flex-col min-w-0">
          <div className="flex items-center gap-2.5">
            <Orbit />
            <h2 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-foreground">What Matters?</h2>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/55 mt-2 font-semibold">{dateStr} · {timeStr}</p>
          <div className="flex-1 flex items-center justify-center py-3">
            <BigRing value={pct} />
          </div>
          <p className="text-[11px] text-foreground/50 text-center">{doneCount} van {total} taken vandaag</p>
        </div>

        {/* RECHTS — fotokaart zonder overlay + afvinkbare planning */}
        <div className="flex-[3] p-3 sm:p-4 min-w-0">
          <div className="relative h-full w-full rounded-[22px] overflow-hidden">
            <Image src={PHOTO} fittingType="fill" alt="" className="absolute inset-0 w-full h-full" />

            {!closed ? (
              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1.5 max-h-[74%] overflow-auto">
                <AnimatePresence>
                  {items.map((it, i) => <Chip key={i} it={it} onToggle={() => toggle(i)} />)}
                </AnimatePresence>
                {allDone && (
                  <motion.button onClick={close} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="self-center mt-1 rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg" style={{ background: ACCENT }}>
                    Markeer als gedaan & sluiten
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: ACCENT }}>
                  <Check className="h-3.5 w-3.5" strokeWidth={3} /> Gedaan
                </span>
                <button onClick={reopen} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-foreground" style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.08)" }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Heropenen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}