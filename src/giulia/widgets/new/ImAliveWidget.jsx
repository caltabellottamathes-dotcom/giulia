import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { WidgetHeader, URGENT } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";

/** ImAliveWidget — "I'M ALIVE!" · gebaseerd op widget 17 (SystemHeartbeat).
 *  EKG-golf die beweegt zodra Giulia + haar agenten actief zijn (recente
 *  Activity < 10 min). Stil? → platte lijn, grafiek dood, "DORMANT". Klik op
 *  de widget → startGiulia (start Giulia + alle agenten). Kleursysteem GIULIA. */

const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 50 L 18 50 L 24 50 L 30 28 L 36 72 L 42 40 L 48 50 L 60 50 L 66 50 L 72 34 L 78 66 L 84 50 L 100 50";

export default function ImAliveWidget() {
  const { data: activity } = useEntityList("Activity", { sort: "-created_date", limit: 1, realtime: true });
  const [now, setNow] = useState(Date.now());
  const [idx, setIdx] = useState(0);
  const [starting, setStarting] = useState(false);

  const lastTs = activity?.[0]?.created_date || activity?.[0]?.timestamp;
  const active = !!lastTs && now - new Date(lastTs).getTime() < 10 * 60 * 1000;

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
    try { await base44.functions.invoke("startGiulia", {}); } catch { /* ignore */ }
    finally { setStarting(false); }
  };

  return (
    <div className="w-[340px]">
      <WidgetShell domain="giulia" radius="large" interactive onClick={start} className="min-h-0" style={{ aspectRatio: "4 / 3" }}>
        <div className="flex flex-col h-full p-3" style={{ color: "var(--tile-accent)" }}>
          <WidgetHeader type="pulse" label="I'M ALIVE!" />
          <div className="flex-1 relative min-h-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.4" />
              {active ? (
                <motion.path d={PATH} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }} />
              ) : (
                <path d="M 0 50 L 100 50" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
              )}
            </svg>
            <span className="absolute right-0 top-0 flex items-center gap-1 text-[7px] uppercase tracking-[0.18em] font-bold" style={{ color: "currentColor" }}>
              <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? URGENT : "rgba(255,255,255,0.35)" }}
                animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.4 }} transition={{ duration: 1, repeat: active ? Infinity : 0 }} />
              {active ? "online" : "dormant"}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 gap-0.5">
            {STATES.map((s, i) => (
              <span key={s} className="text-[6.5px] uppercase tracking-[0.08em] font-bold" style={{ opacity: active && i === idx ? 1 : 0.3, color: "currentColor" }}>{s}</span>
            ))}
          </div>
          {!active && (
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-50 text-center mt-1">{starting ? "Starten…" : "Tik om te starten"}</p>
          )}
        </div>
      </WidgetShell>
    </div>
  );
}