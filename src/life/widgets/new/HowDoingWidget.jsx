import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import CheckInFlow from "@/life/components/CheckInFlow";
import { WINDOWS, WINDOW_ORDER, currentWindowKey, nextWindowInfo, isCompletedForWindow } from "@/life/components/checkInConfig";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const URGENT = "hsl(var(--giulia-urgent))";

/** HowImDoing-widget — 3 check-in momenten (10:00 ORIENT · 16:00 CHECK ·
 *  20:00 REFLECT). Bij een due-moment vergroot de glaskaart tot de volle widget
 *  en gloeit hij met een urgent-neon rand totdat de check-in is ingevuld;
 *  daarna verkleint hij weer naar de compacte idle-weergave. */
export default function HowDoingWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 30, realtime: true, externalTick: learnTick });
  const [justDone, setJustDone] = useState(false);

  const win = currentWindowKey();
  const next = nextWindowInfo();
  const completed = isCompletedForWindow(checkIns, win) || (justDone && win != null);
  const due = win != null && !completed;

  const todayDone = useMemo(
    () => WINDOW_ORDER.map((k) => isCompletedForWindow(checkIns, k)),
    [checkIns]
  );

  const save = async (entity) => {
    await base44.entities.SelfCheckIn.create(entity);
    setJustDone(true);
  };

  const glassIdle = {
    "--tile-accent": PISTACHIO,
    background: "rgba(120,128,133,0.18)",
    backdropFilter: "blur(16px) saturate(1.3)",
    WebkitBackdropFilter: "blur(16px) saturate(1.3)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
    color: IVORY,
  };
  const glassDue = {
    "--tile-accent": URGENT,
    background: "rgba(28,30,24,0.78)",
    backdropFilter: "blur(22px) saturate(1.4)",
    WebkitBackdropFilter: "blur(22px) saturate(1.4)",
    border: `1px solid ${URGENT}`,
    boxShadow: `0 0 0 1px ${URGENT}, 0 0 22px ${URGENT}99, 0 0 46px ${URGENT}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
    color: IVORY,
  };

  return (
    <div className="relative w-full aspect-[2/3] rounded-[28px] overflow-hidden" style={{ "--tile-accent": PISTACHIO, color: IVORY }}>
      <motion.img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.9) 14%, rgba(20,22,26,0.32) 58%, rgba(20,22,26,0.12))" }} />

      {/* bovenin de PhotoShell — bewegende icoon + titel, opent dailystate-paneel */}
      <div className="absolute top-0 left-0 right-0 z-20 cursor-pointer p-3.5 pb-2" onClick={() => openModule("dailystate")} style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
        <WidgetHeader type="pulse" label="How I'm Doing." count={win ? WINDOWS[win].time : next.tomorrow ? `morgen ${WINDOWS.orient.time}` : next.time} />
      </div>

      {/* urgent-neon pulserende rand wanneer due */}
      <AnimatePresence>
        {due && (
          <motion.span
            key="glow" className="pointer-events-none absolute inset-0 rounded-[28px] z-30"
            initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.9, 0.5] }} exit={{ opacity: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: `inset 0 0 0 2px ${URGENT}, 0 0 26px ${URGENT}aa, 0 0 52px ${URGENT}66` }}
          />
        )}
      </AnimatePresence>

      {/* glaskaart — due: volledig + urgent; idle: onder 62% */}
      <motion.div
        className={`absolute left-0 right-0 bottom-0 z-10 flex flex-col p-3 overflow-hidden ${due ? "pt-12" : ""}`}
        style={due ? glassDue : glassIdle}
        initial={false}
        animate={{ height: due ? "100%" : "62%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${due ? URGENT : PISTACHIO} 18%, ${due ? URGENT : PISTACHIO} 82%, transparent)` }} />

        <AnimatePresence mode="wait">
          {due ? (
            <motion.div key="due" className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CheckInFlow window={win} onSave={save} onDone={() => setJustDone(true)} theme="dark" accent={URGENT} />
            </motion.div>
          ) : (
            <motion.div key="idle" className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {/* adem-ring */}
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <motion.span className="absolute inset-0 rounded-full" style={{ border: `2px solid ${PISTACHIO}` }} animate={{ scale: [1, 1.2, 1], opacity: [0.75, 0.18, 0.75] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} />
                  <motion.span className="absolute inset-3 rounded-full" style={{ border: `1px solid ${PISTACHIO}` }} animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.1, 0.5] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
                  <span className="text-[11px] font-display font-black tracking-[0.02em] whitespace-nowrap" style={{ color: IVORY }}>{win ? "KLAAR" : "RUST"}</span>
                </div>

                {/* 3 dagelijkse momenten */}
                <div className="flex items-center gap-2 mt-3">
                  {WINDOW_ORDER.map((k, i) => {
                    const done = todayDone[i];
                    const isNow = win === k;
                    return (
                      <span key={k} className="flex flex-col items-center gap-1">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full text-[8.5px] font-bold transition-all"
                          style={{ background: done ? PISTACHIO : isNow ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)", color: done ? "#3a3d2a" : IVORY, opacity: done || isNow ? 1 : 0.45, boxShadow: isNow && !done ? `0 0 10px ${PISTACHIO}` : "none" }}>
                          {WINDOWS[k].time}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <p className="text-[9.5px] uppercase tracking-[0.16em] opacity-60 mt-3">
                  {win ? (completed ? `Volgende: ${next.label.toLowerCase()} ${next.time}` : "Tijd om in te checken") : `Volgende: ${next.label.toLowerCase()} ${next.time}${next.tomorrow ? " (morgen)" : ""}`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}