import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoGlassWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { WINDOWS, WINDOW_ORDER, currentWindowKey, nextWindowInfo, isCompletedForWindow } from "@/life/components/checkInConfig";
import { ConcentricRings } from "@/life/components/SelfViz";
import { BLUE, SAND, moodScore } from "@/glass/components/self/palette";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3"; // Whipped Pistachio
const INK = "#2a2d22";

const openCheckIn = () => window.dispatchEvent(new CustomEvent("giulia:open-howdoing-checkin"));

/** HowImDoing-widget — P·2:3·B (PhotoShell + GlassCard, portret).
 *  Blijft altijd in zijn normale portret-stand op het dashboard. Als er
 *  een check-in openstaat knippert een Whipped Pistachio-gloed en toont
 *  een "Begin check-in"-knop — die opent de grote pop-up (zie
 *  HowDoingCheckInOverlay), NIET een inline flow. Na invullen toont de
 *  widget weer zijn normale ringen-stand. */
export default function HowDoingWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 30, realtime: true, externalTick: learnTick });

  const win = currentWindowKey();
  const next = nextWindowInfo();
  const completed = isCompletedForWindow(checkIns, win);
  const due = !completed;

  // Auto-open de grote check-in pop-up zolang er een check-in openstaat.
  // setTimeout voorkomt de effect-volgorde-race (child-effect voor parent-
  // listener): zo staat Home's listener altijd eerst.
  useEffect(() => {
    if (!due) return;
    const t = setTimeout(openCheckIn, 0);
    return () => clearTimeout(t);
  }, [due]);

  const todayDone = useMemo(() => WINDOW_ORDER.map((k) => isCompletedForWindow(checkIns, k)), [checkIns]);
  const latest = checkIns?.[0];
  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = moodScore(latest?.mood);
  const stateText = latest ? (latest.mood ? latest.mood.split(" ")[0].toUpperCase() : "IN") : "CHECK IN";
  const W = WINDOWS[win];

  return (
    <div className="relative w-full">
      <PhotoGlassWidget
        shape="2:3"
        photo={PHOTO}
        glassPosition="bottom"
        glassFraction={0.72}
        domain="life"
        radius="large"
        overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/10"
        photoChildren={
          <div className="absolute top-0 left-0 right-0 z-20 cursor-pointer p-3.5 pb-2" onClick={() => openModule("dailystate")} style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <WidgetHeader type="pulse" label="How I'm Doing." count={W.time} />
          </div>
        }
        glassChildren={
          <div className="flex flex-col h-full items-center justify-center" style={{ color: IVORY }}>
            <ConcentricRings size={84} arcs={[{ pct: energy, c: BLUE }, { pct: capacity, c: SAND }, { pct: mood, c: "rgba(216,218,179,0.7)" }]}>
              <span className="text-ivory text-[10px] font-bold block leading-none">{due ? "CHECK IN" : stateText}</span>
            </ConcentricRings>

            {due ? (
              <button onClick={openCheckIn} className="mt-3 rounded-full px-5 py-2 text-[12px] font-bold transition hover:brightness-95" style={{ background: PISTACHIO, color: INK }}>Begin check-in</button>
            ) : (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
                {WINDOW_ORDER.map((k, i) => {
                  const done = todayDone[i];
                  const isNow = win === k;
                  return (
                    <span key={k} className="flex items-center justify-center h-5 px-1.5 rounded-full text-[8px] font-bold"
                      style={{ background: done ? PISTACHIO : isNow ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)", color: done ? INK : IVORY, opacity: done || isNow ? 1 : 0.45, boxShadow: isNow && !done ? `0 0 8px ${PISTACHIO}` : "none" }}>
                      {WINDOWS[k].time}
                    </span>
                  );
                })}
              </div>
            )}

            <p className="text-[8px] uppercase tracking-[0.14em] opacity-55 mt-2 text-center">Volgende: {next.label.toLowerCase()} {next.time}{next.tomorrow ? " morgen" : ""}</p>
          </div>
        }
      />

      {/* knipperende Whipped Pistachio-gloed zolang de check-in openstaat */}
      <AnimatePresence>
        {due && (
          <motion.span key="glow" className="absolute inset-0 rounded-[28px] pointer-events-none z-30"
            initial={{ opacity: 0 }} animate={{ opacity: [0.35, 1, 0.35] }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: `inset 0 0 0 2px ${PISTACHIO}, 0 0 22px ${PISTACHIO}cc, 0 0 46px ${PISTACHIO}88` }} />
        )}
      </AnimatePresence>
    </div>
  );
}