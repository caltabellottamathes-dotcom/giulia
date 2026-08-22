import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { WidgetHeader, URGENT } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";

const IVORY = "hsl(var(--ivory))";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio

/** ImAliveWidget — "I'M ALIVE!" · gebaseerd op widget 17 (SystemHeartbeat),
 *  grafisch versterkt. EKG met gradient-stroke + glow + area-fill, pulserende
 *  beat-dot, radial glow. Beweegt zodra Giulia + agenten actief zijn (recente
 *  Activity < 10 min). Stil? → platte lijn, dood, "DORMANT". Klik → startGiulia. */

const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 50 L 18 50 L 24 50 L 30 28 L 36 72 L 42 40 L 48 50 L 60 50 L 66 50 L 72 34 L 78 66 L 84 50 L 100 50";
const AREA = PATH + " L 100 100 L 0 100 Z";

export default function ImAliveWidget() {
  const { data: activity } = useEntityList("Activity", { sort: "-created_date", limit: 1, realtime: true });
  const [now, setNow] = useState(Date.now());
  const [idx, setIdx] = useState(0);
  const [starting, setStarting] = useState(false);
  const [manualActive, setManualActive] = useState(false);

  const lastTs = activity?.[0]?.created_date || activity?.[0]?.timestamp;
  const active = manualActive || (!!lastTs && now - new Date(lastTs).getTime() < 10 * 60 * 1000);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800);
    return () => clearInterval(id);
  }, [active]);

  const start = async () => {
    if (starting) return;
    setStarting(true);
    setManualActive(true);
    try { await base44.functions.invoke("startGiulia", {}); } catch { /* ignore */ }
    finally { setStarting(false); }
  };

  return (
    <div className="w-full max-w-[240px] mx-auto aspect-square">
      <WidgetShell domain="giulia" radius="large" interactive onClick={start} className="h-full min-h-0 ring-0 border-0" style={{ boxShadow: "none" }}>
        <div className="flex flex-col h-full p-3" style={{ color: IVORY }}>
          <WidgetHeader type="pulse" label="I'M ALIVE!" />

          <div className="flex-1 relative min-h-0 overflow-hidden">
            {/* radial glow die met de hartslag ademt */}
            <motion.div className="absolute inset-0" style={{ background: `radial-gradient(60% 80% at 50% 50%, ${URGENT} 0%, transparent 70%)` }}
              animate={active ? { opacity: [0.05, 0.22, 0.05], scale: [0.92, 1.08, 0.92] } : { opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="ekg-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={DEEP} />
                  <stop offset="60%" stopColor={LIGHT} />
                  <stop offset="100%" stopColor={URGENT} />
                </linearGradient>
                <linearGradient id="ekg-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={DEEP} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
                </linearGradient>
                <filter id="ekg-glow" x="-20%" y="-60%" width="140%" height="220%">
                  <feGaussianBlur stdDeviation="1.1" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <line x1="0" y1="50" x2="100" y2="50" stroke={DEEP} strokeOpacity="0.22" strokeWidth="0.3" />
              {active ? (
                <>
                  <path d={AREA} fill="url(#ekg-fill)" stroke="none" opacity="0.35" />
                  <path d={PATH} fill="none" stroke="url(#ekg-stroke)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
                  <motion.path d={PATH} fill="none" stroke="url(#ekg-stroke)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#ekg-glow)"
                    pathLength={100} strokeDasharray="14 86"
                    animate={{ strokeDashoffset: [0, -100] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} />
                </>
              ) : (
                <path d="M 0 50 L 100 50" fill="none" stroke={DEEP} strokeOpacity="0.45" strokeWidth="1" />
              )}
            </svg>

            {/* beat-dot die pompt */}
            {active && (
              <motion.span className="absolute rounded-full" style={{ left: "47%", top: "18%", width: 10, height: 10, background: URGENT, boxShadow: `0 0 14px ${URGENT}` }}
                animate={{ scale: [1, 1.9, 1], opacity: [1, 0.35, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
            )}

            <span className="absolute right-0 top-0 flex items-center gap-1 text-[7px] uppercase tracking-[0.18em] font-bold" style={{ color: IVORY }}>
              <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? URGENT : "rgba(255,255,255,0.35)" }}
                animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.4 }} transition={{ duration: 1, repeat: active ? Infinity : 0 }} />
              {active ? "online" : "dormant"}
            </span>
          </div>

          <div className="flex items-end justify-between mt-1.5">
            <motion.span className="text-[17px] font-display font-bold uppercase tracking-tight leading-none"
              animate={active ? { color: [URGENT, LIGHT, URGENT] } : { color: "rgba(255,255,255,0.5)" }}
              transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}>
              {active ? "ALIVE" : "DORMANT"}
            </motion.span>
            <div className="flex items-center gap-1">
              {STATES.map((s, i) => (
                <span key={s} className="text-[6px] uppercase tracking-[0.1em] font-bold" style={{ opacity: active && i === idx ? 1 : 0.3, color: active && i === idx ? URGENT : IVORY }}>{s[0]}</span>
              ))}
            </div>
          </div>
          {!active && (
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-50 text-center mt-1">{starting ? "Starten…" : "Tik om te starten"}</p>
          )}
        </div>
      </WidgetShell>
    </div>
  );
}