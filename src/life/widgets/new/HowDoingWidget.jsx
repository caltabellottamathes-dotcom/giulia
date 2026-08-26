import React, { useEffect, useMemo, useState } from "react";
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
 *  20:00 REFLECT). Bij een due-moment wordt de widget FYSIEK groter in het
 *  grid (breder span + 4:3) en gloeit met een urgent-neon rand; de kaart is
 *  flush met de shell (inset-0) met 4 afgeronde hoeken. Na invullen verkleint
 *  hij weer naar de compacte portret-idle. */
export default function HowDoingWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 30, realtime: true, externalTick: learnTick });
  const [justDone, setJustDone] = useState(false);

  const win = currentWindowKey();
  const next = nextWindowInfo();
  const completed = isCompletedForWindow(checkIns, win) || (justDone && win != null);
  const due = !completed; // win is altijd gezet (reflect loopt door 's nachts)

  // signaal naar Home → widget krijgt een breder span wanneer due
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("giulia:howdoing-due", { detail: due }));
  }, [due]);

  const todayDone = useMemo(() => WINDOW_ORDER.map((k) => isCompletedForWindow(checkIns, k)), [checkIns]);
  const latest = checkIns?.[0];

  const save = async (entity) => {
    await base44.entities.SelfCheckIn.create(entity);
    setJustDone(true);
  };

  const idleMain = latest?.energy != null ? `${latest.energy}` : latest?.mood ? latest.mood.split(" ")[0] : "—";
  const idleSub = latest?.energy != null ? "% energie" : latest?.mood ? "laatste mood" : "check in";

  const rootStyle = due ? { boxShadow: `0 0 0 2px ${URGENT}, 0 0 26px ${URGENT}cc, 0 0 52px ${URGENT}66` } : undefined;

  return (
    <div className={`relative w-full rounded-[28px] ${due ? "aspect-[4/3]" : "aspect-[2/3]"}`} style={rootStyle}>
      {/* flush kaart — 4 afgeronde hoeken, clip door eigen overflow-hidden */}
      <div className="absolute inset-0 rounded-[28px] overflow-hidden">
        <motion.img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
        <div className="absolute inset-0" style={{ background: due ? "linear-gradient(160deg, rgba(18,20,16,0.92), rgba(18,20,16,0.86))" : "linear-gradient(to top, rgba(20,22,26,0.86) 12%, rgba(20,22,26,0.30) 56%, rgba(20,22,26,0.10))" }} />

        {/* bovenste header — opent dailystate-paneel */}
        <div className="absolute top-0 left-0 right-0 z-20 cursor-pointer p-3.5 pb-2" onClick={() => openModule("dailystate")} style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <WidgetHeader type="pulse" label="How I'm Doing." count={WINDOWS[win].time} />
        </div>

        {/* body */}
        <AnimatePresence mode="wait">
          {due ? (
            <motion.div key="due" className="absolute inset-0 z-10 p-3 pt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CheckInFlow window={win} onSave={save} onDone={() => setJustDone(true)} theme="dark" accent={URGENT} />
            </motion.div>
          ) : (
            <motion.div key="idle" className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 pt-12" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative h-16 w-16 flex items-center justify-center">
                <motion.span className="absolute inset-0 rounded-full" style={{ border: `2px solid ${PISTACHIO}` }} animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.15, 0.6] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} />
                <motion.span className="absolute inset-3 rounded-full" style={{ border: `1px solid ${PISTACHIO}` }} animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.1, 0.4] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
                <span className="text-[15px] font-display font-black leading-none">{idleMain}</span>
              </div>
              <p className="text-[8.5px] uppercase tracking-[0.16em] opacity-60 mt-1.5">{idleSub}</p>

              <div className="flex items-center gap-2 mt-3.5">
                {WINDOW_ORDER.map((k, i) => {
                  const done = todayDone[i];
                  const isNow = win === k;
                  return (
                    <span key={k} className="flex items-center justify-center h-6 px-2 rounded-full text-[8.5px] font-bold transition-all"
                      style={{ background: done ? PISTACHIO : isNow ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)", color: done ? "#3a3d2a" : IVORY, opacity: done || isNow ? 1 : 0.45, boxShadow: isNow && !done ? `0 0 10px ${PISTACHIO}` : "none" }}>
                      {WINDOWS[k].time}
                    </span>
                  );
                })}
              </div>
              <p className="text-[8.5px] uppercase tracking-[0.14em] opacity-55 mt-2.5">Volgende: {next.label.toLowerCase()} {next.time}{next.tomorrow ? " morgen" : ""}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* pulserende urgent-neon ring wanneer due */}
      <AnimatePresence>
        {due && (
          <motion.span key="ring" className="absolute inset-0 rounded-[28px] pointer-events-none z-30"
            initial={{ opacity: 0 }} animate={{ opacity: [0.55, 1, 0.55] }} exit={{ opacity: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: `inset 0 0 0 2px ${URGENT}, 0 0 24px ${URGENT}aa, 0 0 48px ${URGENT}66` }} />
        )}
      </AnimatePresence>
    </div>
  );
}