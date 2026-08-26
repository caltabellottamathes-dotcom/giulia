import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import CheckInFlow from "@/life/components/CheckInFlow";
import { WINDOWS, WINDOW_ORDER, currentWindowKey, nextWindowInfo, isCompletedForWindow } from "@/life/components/checkInConfig";
import { ConcentricRings } from "@/life/components/SelfViz";
import { BLUE, SAND, moodScore } from "@/glass/components/self/palette";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3"; // Whipped Pistachio
const INK = "#2a2d22";

/** HowImDoing-widget — PhotoShell + GlassCard (4 ronde hoeken, floating).
 *  Bij due: widget wordt breder (3→6 span, zelfde hoogte → andere widgets
 *  verkleinen niet) en verschijnt linksboven. Op de glasscard staat een
 *  startscherm; zolang de check-in niet gestart is knippert een Whipped
 *  Pistachio-gloed rondom. */
export default function HowDoingWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 30, realtime: true, externalTick: learnTick });
  const [justDone, setJustDone] = useState(false);
  const [started, setStarted] = useState(false);

  const win = currentWindowKey();
  const next = nextWindowInfo();
  const completed = isCompletedForWindow(checkIns, win) || (justDone && win != null);
  const FORCE_DUE = true; // tijdelijk aan — zet het check-in-moment zichtbaar
  const due = !completed || FORCE_DUE;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("giulia:howdoing-due", { detail: due }));
  }, [due]);

  const todayDone = useMemo(() => WINDOW_ORDER.map((k) => isCompletedForWindow(checkIns, k)), [checkIns]);
  const latest = checkIns?.[0];
  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = moodScore(latest?.mood);
  const stateText = latest ? (latest.mood ? latest.mood.split(" ")[0].toUpperCase() : "IN") : "CHECK IN";

  const save = async (entity) => {
    await base44.entities.SelfCheckIn.create(entity);
    setStarted(false);
    setJustDone(true);
  };

  const glass = {
    background: "rgba(120,128,133,0.16)",
    backdropFilter: "blur(18px) saturate(1.35)",
    WebkitBackdropFilter: "blur(18px) saturate(1.35)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 -10px 28px -12px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.22)",
    color: IVORY,
  };

  const W = WINDOWS[win];

  return (
    <div className={`relative w-full rounded-[28px] ${due ? "aspect-[4/3]" : "aspect-[2/3]"}`} style={{ "--tile-accent": PISTACHIO, color: IVORY }}>
      {/* PhotoShell */}
      <div className="absolute inset-0 rounded-[28px] overflow-hidden">
        <motion.img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.9) 14%, rgba(20,22,26,0.32) 58%, rgba(20,22,26,0.12))" }} />

        {/* header — opent dailystate-paneel */}
        <div className="absolute top-0 left-0 right-0 z-20 cursor-pointer p-3.5 pb-2" onClick={() => openModule("dailystate")} style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <WidgetHeader type="pulse" label="How I'm Doing." count={W.time} />
        </div>

        {/* GlassCard — floating, 4 ronde hoeken */}
        <motion.div
          className="absolute left-2 right-2 bottom-2 z-10 flex flex-col p-3 overflow-hidden rounded-[24px]"
          style={glass}
          initial={{ top: "42%" }}
          animate={{ top: due ? "12%" : "42%" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            {due && !started ? (
              <motion.div key="start" className="flex flex-col h-full items-center justify-center text-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: IVORY }}>
                <span className="text-[10px] uppercase tracking-[0.22em] opacity-60">{W.time}</span>
                <h3 className="text-[30px] font-display font-black tracking-[-0.02em] mt-1" style={{ color: PISTACHIO }}>{W.label}</h3>
                <p className="text-[13px] opacity-85 mt-1.5 max-w-[78%] leading-snug">{W.subtitle}</p>
                <p className="text-[9.5px] uppercase tracking-[0.16em] opacity-50 mt-3">5 vragen · ~2 min</p>
                <button onClick={() => setStarted(true)} className="mt-4 rounded-full px-6 py-2.5 text-[13px] font-bold transition hover:brightness-95" style={{ background: PISTACHIO, color: INK }}>Begin check-in</button>
              </motion.div>
            ) : due && started ? (
              <motion.div key="flow" className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CheckInFlow window={win} onSave={save} onDone={() => { setStarted(false); setJustDone(true); }} theme="dark" accent={PISTACHIO} />
              </motion.div>
            ) : (
              <motion.div key="idle" className="flex flex-col h-full items-center justify-center" style={{ color: IVORY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConcentricRings size={92} arcs={[{ pct: energy, c: BLUE }, { pct: capacity, c: SAND }, { pct: mood, c: "rgba(216,218,179,0.7)" }]}>
                  <span className="text-ivory text-[10px] font-bold block leading-none">{stateText}</span>
                </ConcentricRings>
                <div className="flex items-center gap-2 mt-3">
                  {WINDOW_ORDER.map((k, i) => {
                    const done = todayDone[i];
                    const isNow = win === k;
                    return (
                      <span key={k} className="flex items-center justify-center h-6 px-2 rounded-full text-[8.5px] font-bold"
                        style={{ background: done ? PISTACHIO : isNow ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)", color: done ? INK : IVORY, opacity: done || isNow ? 1 : 0.45, boxShadow: isNow && !done ? `0 0 10px ${PISTACHIO}` : "none" }}>
                        {WINDOWS[k].time}
                      </span>
                    );
                  })}
                </div>
                <p className="text-[8.5px] uppercase tracking-[0.14em] opacity-55 mt-2.5">Volgende: {next.label.toLowerCase()} {next.time}{next.tomorrow ? " morgen" : ""}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* knipperende Whipped Pistachio-gloed zolang de check-in niet gestart is */}
      <AnimatePresence>
        {due && !started && (
          <motion.span key="glow" className="absolute inset-0 rounded-[28px] pointer-events-none z-30"
            initial={{ opacity: 0 }} animate={{ opacity: [0.35, 1, 0.35] }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: `inset 0 0 0 2px ${PISTACHIO}, 0 0 22px ${PISTACHIO}cc, 0 0 46px ${PISTACHIO}88` }} />
        )}
      </AnimatePresence>
    </div>
  );
}