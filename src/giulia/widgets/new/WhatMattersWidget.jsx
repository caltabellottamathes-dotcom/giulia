import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useTaskChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";

/* GIULIA palette — Earth Olive / Olive / Whipped Pistachio / Urgent (alleen bij urgentie) */
const EARTH = "hsl(var(--giulia-coral))";     // #595f34
const OLIVE = "hsl(var(--giulia-dust))";       // #94925d
const PISTACHIO = "hsl(var(--giulia-pistachio))"; // #d8dab3
const URGENT = "hsl(var(--giulia-urgent))";    // #d5e24a

/** Geanimeerde orbit — het emblem linksboven (iets groter nu). */
function Orbit() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0">
      <circle cx="17" cy="17" r="14.5" fill="none" stroke={EARTH} strokeWidth="1.5" strokeOpacity="0.4" />
      <motion.g style={{ transformOrigin: "17px 17px" }} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}>
        <circle cx="17" cy="2.5" r="3" fill={EARTH} />
      </motion.g>
      <motion.g style={{ transformOrigin: "17px 17px" }} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: -2.3 }}>
        <circle cx="31.5" cy="17" r="1.7" fill={OLIVE} />
      </motion.g>
      <motion.g style={{ transformOrigin: "17px 17px" }} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: -4.6 }}>
        <circle cx="17" cy="31.5" r="1.2" fill={PISTACHIO} />
      </motion.g>
      <circle cx="17" cy="17" r="2" fill={EARTH} />
    </svg>
  );
}

/** Grote live voortgangsring met ronddraaiende stippelring eromheen. */
function BigRing({ value }) {
  const size = 220, stroke = 12, r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <motion.circle cx={size / 2} cy={size / 2} r={r + 6} fill="none" stroke={EARTH} strokeWidth="1.5" strokeOpacity="0.35"
          strokeDasharray="1.5 7" style={{ transformOrigin: "110px 110px" }} animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={EARTH} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} animate={{ strokeDashoffset: off }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[4.5rem] font-display font-bold tabular-nums text-foreground leading-none tracking-[-0.04em]">{Math.round(value * 100)}</span>
        <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/55 mt-1 font-bold">% VOLBRACHT</span>
      </div>
    </div>
  );
}

/** Afvink-chip — extra transparant glas over de foto. */
function Chip({ it, onToggle, urgent }) {
  const accent = urgent ? URGENT : EARTH;
  return (
    <motion.button type="button" onClick={onToggle} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left transition-colors"
      style={{ background: "rgba(255,255,255,0.32)", backdropFilter: "blur(18px) saturate(1.2)", WebkitBackdropFilter: "blur(18px) saturate(1.2)", border: "1px solid rgba(255,255,255,0.42)" }}>
      <span className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: it.done ? accent : urgent ? URGENT : "hsl(var(--foreground) / 0.45)", background: it.done ? accent : "transparent" }}>
        {it.done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium leading-tight truncate ${it.done ? "text-foreground/40 line-through" : "text-foreground"}`}>{it.label}</p>
        {it.sub && <p className={`text-[10px] truncate ${it.done ? "text-foreground/30" : urgent ? "text-foreground/70 font-semibold" : "text-foreground/50"}`}>{it.sub}</p>}
      </div>
      {urgent && !it.done && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: URGENT }} />}
    </motion.button>
  );
}

/** What Matters? — 16:9 glas-shell, grafische typografie. Links: orbit+titel,
 *  enorme live datum/tijd, grote ring in de linkeronderhoek. Rechts: schone
 *  foto met transparante afvinkbare planning; vink aan → ring vult. */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, allDone, closed, close, reopen } = useTaskChecklist();
  const pct = total ? doneCount / total : 0;

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return (
    <div className="relative w-full aspect-video rounded-[28px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(40px) saturate(1.4)", WebkitBackdropFilter: "blur(40px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 24px 60px -28px rgba(0,0,0,0.25)" }}>
      <div className="flex h-full">
        {/* LINKS — grafische typografie */}
        <div className="flex-[2] relative p-6 sm:p-8 flex flex-col min-w-0">
          <div className="flex items-center gap-3">
            <Orbit />
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.02em] text-foreground">What Matters?</h2>
          </div>

          {/* enorme live datum + tijd */}
          <div className="flex-1 flex flex-col justify-center py-3">
            <p className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-[0.14em] text-foreground/65 leading-none">
              {weekday} · {dayNum} {month}
            </p>
            <div className="flex items-baseline mt-2">
              <motion.span key={hh + mm} className="text-[6.5rem] sm:text-[7.5rem] leading-[0.82] font-display font-bold tabular-nums tracking-[-0.05em] text-foreground"
                initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {hh}:{mm}
              </motion.span>
              <motion.span key={ss} className="text-3xl sm:text-4xl font-display font-bold tabular-nums text-foreground/40 ml-1"
                animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
                :{ss}
              </motion.span>
            </div>
            <motion.div className="h-2 rounded-full mt-3" style={{ background: PISTACHIO, maxWidth: 320 }}
              animate={{ width: ["24%", "68%", "24%"] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          {/* grote ring, linkeronderhoek */}
          <div className="flex items-end justify-start">
            <BigRing value={pct} />
          </div>
        </div>

        {/* RECHTS — fotokaart zonder overlay + transparante planning */}
        <div className="flex-[3] p-3 sm:p-4 min-w-0">
          <div className="relative h-full w-full rounded-[22px] overflow-hidden">
            <Image src={PHOTO} fittingType="fill" alt="" className="absolute inset-0 w-full h-full" />

            {!closed ? (
              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1.5 max-h-[76%] overflow-auto">
                <AnimatePresence>
                  {items.map((it, i) => <Chip key={i} it={it} onToggle={() => toggle(i)} urgent={/overdue|achterop|dringend/i.test(it.sub || "")} />)}
                </AnimatePresence>
                {allDone && (
                  <motion.button onClick={close} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="self-center mt-1 rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg" style={{ background: EARTH }}>
                    Markeer als gedaan & sluiten
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: EARTH }}>
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