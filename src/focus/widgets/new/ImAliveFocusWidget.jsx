import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusCoat;
const IVORY = "hsl(var(--ivory))";
const DEEP = "hsl(var(--d-focus-deep))";    // burgundy
const LIGHT = "hsl(var(--d-focus-light))";  // cream

/** ImAliveFocusWidget — "I'M ALIVE!" · Focus-twin. Foto-shell = focusCoat.
 *  GlassCard onder = de EKG. Klik op de kaart activeert het systeem
 *  (startGiulia) én toont de foto. EKG beweegt zodra er recente Activity
 *  < 10 min is; stil? → platte lijn, "DORMANT". Burgundy/cream. */

const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 50 L 18 50 L 24 50 L 30 28 L 36 72 L 42 40 L 48 50 L 60 50 L 66 50 L 72 34 L 78 66 L 84 50 L 100 50";
const AREA = PATH + " L 100 100 L 0 100 Z";

export default function ImAliveFocusWidget() {
  const { openModule } = usePanel();
  const { data: activity } = useEntityList("Activity", { sort: "-created_date", limit: 1, realtime: true });
  const [now, setNow] = useState(Date.now());
  const [idx, setIdx] = useState(0);
  const [starting, setStarting] = useState(false);
  const [manualActive, setManualActive] = useState(false);

  const lastTs = activity?.[0]?.created_date || activity?.[0]?.timestamp;
  const active = manualActive || (!!lastTs && now - new Date(lastTs).getTime() < 10 * 60 * 1000);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!active) return; const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800); return () => clearInterval(id); }, [active]);

  const start = async () => {
    if (starting) return;
    setStarting(true); setManualActive(true);
    try { await base44.functions.invoke("startGiulia", {}); } catch { /* ignore */ }
    finally { setStarting(false); }
  };

  return (
    <div className="w-full h-[480px]">
      <div className="relative w-full h-full rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: IVORY }}>
        <img src={PHOTO} alt="I'm Alive" className="absolute inset-0 w-full h-full object-cover" />
        <button type="button" onClick={() => openModule("activity")} aria-label="Open activiteit" className="absolute inset-0 z-0 cursor-pointer" />

        <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent flex items-start justify-between" style={{ color: IVORY }}>
          <WidgetHeader type="pulse" label="I'M ALIVE!" />
          <span className="flex items-center gap-1.5 pt-1 text-[7px] uppercase tracking-[0.18em] font-bold">
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? LIGHT : "rgba(255,255,255,0.35)" }} animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.4 }} transition={{ duration: 1, repeat: active ? Infinity : 0 }} />
            {active ? "online" : "dormant"}
          </span>
        </div>

        <button type="button" onClick={start} aria-label={active ? "Systeem actief" : "Systeem starten"} className="absolute left-0 right-0 bottom-0 h-[46%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden cursor-pointer text-left"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

          <div className="flex-1 relative min-h-0 overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="focusalive-stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={DEEP} /><stop offset="60%" stopColor={LIGHT} /><stop offset="100%" stopColor={LIGHT} /></linearGradient>
                <linearGradient id="focusalive-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={DEEP} stopOpacity="0.32" /><stop offset="100%" stopColor={DEEP} stopOpacity="0" /></linearGradient>
                <filter id="focusalive-glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="1.1" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <line x1="0" y1="50" x2="100" y2="50" stroke={DEEP} strokeOpacity="0.22" strokeWidth="0.3" />
              {active ? (
                <>
                  <path d={AREA} fill="url(#focusalive-fill)" stroke="none" opacity="0.35" />
                  <path d={PATH} fill="none" stroke="url(#focusalive-stroke)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
                  <path d={PATH} fill="none" stroke="url(#focusalive-stroke)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#focusalive-glow)" pathLength={100} strokeDasharray="14 86" className="ekg-sweep" />
                </>
              ) : (
                <path d="M 0 50 L 100 50" fill="none" stroke={DEEP} strokeOpacity="0.45" strokeWidth="1" />
              )}
            </svg>
            {active && (
              <motion.span className="absolute rounded-full" style={{ left: "47%", top: "18%", width: 10, height: 10, background: LIGHT, boxShadow: `0 0 14px ${LIGHT}` }} animate={{ scale: [1, 1.9, 1], opacity: [1, 0.35, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
            )}
          </div>

          <div className="flex items-end justify-between mt-1.5">
            <motion.span className="text-[17px] font-display font-bold uppercase tracking-tight leading-none" animate={active ? { color: [LIGHT, DEEP, LIGHT] } : { color: "rgba(255,255,255,0.5)" }} transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}>{active ? "ALIVE" : "DORMANT"}</motion.span>
            <div className="flex items-center gap-1">
              {STATES.map((s, i) => (
                <span key={s} className="text-[6px] uppercase tracking-[0.1em] font-bold" style={{ opacity: active && i === idx ? 1 : 0.3, color: active && i === idx ? LIGHT : IVORY }}>{s[0]}</span>
              ))}
            </div>
          </div>
          {!active && <p className="text-[8px] uppercase tracking-[0.2em] opacity-50 text-center mt-1">{starting ? "Starten…" : "Tik om te starten"}</p>}
        </button>
      </div>
    </div>
  );
}