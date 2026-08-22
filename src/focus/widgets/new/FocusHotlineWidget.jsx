import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-focus-deep))";   // burgundy
const LIGHT = "hsl(var(--d-focus-light))"; // cream
const IVORY = "hsl(var(--ivory))";
const FOCUS_MIN = 25;

/** FocusHotlineWidget — "FOCUS MODE!" · Focus-twin van Giulia's hotline.
 *  Foto-shell = focusSuspended. Glas-onder: een ademende gradient-bloom met
 *  een 25-min focus-countdown eroverheen. Tik om de deep-work timer te
 *  starten/stoppen. Burgundy/cream, geen stem. */
export default function FocusHotlineWidget() {
  const { openModule } = usePanel();
  const [remaining, setRemaining] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const bloomRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setRunning(false); return FOCUS_MIN * 60; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const speed = running ? 2.2 : 1.1;
      const breath = 0.10 * Math.sin(t * speed);
      const scale = 0.9 + (running ? 0.18 : 0.05) + breath;
      const opacity = 0.6 + (running ? 0.25 : 0.05) + 0.04 * Math.sin(t * speed);
      const el = bloomRef.current;
      if (el) { el.style.transform = `scale(${scale})`; el.style.opacity = String(opacity); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const toggle = () => setRunning((v) => !v);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const statusLabel = running ? "FOCUS" : remaining === FOCUS_MIN * 60 ? "TIK OM TE STARTEN" : "KLAAR";
  const statusColor = running ? LIGHT : "rgba(255,255,255,0.55)";

  return (
    <WidgetShell domain="focus" radius="large" className="w-full h-[480px] min-h-0">
      <img src={IMAGES.focusSuspended} alt="Focus Mode" className="absolute inset-0 w-full h-full object-cover" />
      <button type="button" onClick={() => openModule("agenda")} aria-label="Open agenda" className="absolute inset-0 z-0 cursor-pointer" />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent flex items-start justify-between" style={{ color: IVORY }}>
        <WidgetHeader label="FOCUS MODE!" type="pulse" />
        <span className="flex items-center gap-1.5 pt-1">
          <motion.span className="h-1 w-1 rounded-full" style={{ background: running ? LIGHT : "rgba(255,255,255,0.35)" }} animate={running ? { scale: [1, 1.9, 1], opacity: [1, 0.35, 1] } : {}} transition={{ duration: 0.9, repeat: running ? Infinity : 0, ease: "easeInOut" }} />
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[200px] rounded-t-[28px] flex flex-col items-center px-4 pt-3.5 pb-4 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <div className="flex items-center gap-2 shrink-0 self-start">
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: running ? LIGHT : "rgba(255,255,255,0.4)" }} animate={running ? { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] } : {}} transition={{ duration: 0.9, repeat: running ? Infinity : 0, ease: "easeInOut" }} />
          <span className="text-[9px] uppercase tracking-[0.32em] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
        </div>

        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <button onClick={toggle} aria-label={running ? "Stoppen" : "Start focus"} className="relative h-[170px] w-[170px] rounded-full cursor-pointer" style={{ border: "none", background: "transparent" }}>
            <span ref={bloomRef} className="absolute inset-0 rounded-full will-change-transform" style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 48%, transparent 72%)`, filter: "blur(2px)", opacity: 0.92 }} />
            <span className="absolute inset-0 flex items-center justify-center text-[40px] font-display font-bold tabular-nums tracking-[-0.03em]" style={{ color: IVORY }}>{mm}:{ss}</span>
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}