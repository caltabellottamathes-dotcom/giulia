import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PhotoGlassWidget, WidgetHeader } from "@/system/widgets/primitives";
import CheckInFlow from "@/life/components/CheckInFlow";
import { WINDOWS, currentWindowKey } from "@/life/components/checkInConfig";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const PISTACHIO = "#d8dab3"; // Whipped Pistachio
const INK = "#2a2d22";
const IVORY = "hsl(var(--ivory))";

/** HowDoingCheckInOverlay — een vergrote, exacte kopie van de
 *  HowDoing-widget: dezelfde PhotoGlassWidget-shell (2:3, foto boven,
 *  glass card onderin) waarin de check-in wordt ingevuld. Opent
 *  automatisch zodra een check-in openstaat. Na invullen sluit de
 *  pop-up en toont de widget op het dashboard weer zijn normale stand. */
export default function HowDoingCheckInOverlay({ open, onClose }) {
  const [started, setStarted] = useState(false);
  const win = currentWindowKey();
  const W = WINDOWS[win];

  // Reset naar het beginscherm wanneer de pop-up sluit.
  useEffect(() => { if (!open) setStarted(false); }, [open]);

  const save = async (entity) => {
    await base44.entities.SelfCheckIn.create(entity);
    setStarted(false);
    onClose();
  };
  const done = () => { setStarted(false); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-charcoal/55 backdrop-blur-md" onClick={onClose} />

          <motion.div
            className="relative float-shadow"
            style={{ width: "min(460px, 58vh)" }}
            initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* knipperende Whipped Pistachio-gloed zolang de check-in niet gestart is */}
            <AnimatePresence>
              {!started && (
                <motion.span className="absolute inset-0 rounded-[28px] pointer-events-none z-30"
                  initial={{ opacity: 0 }} animate={{ opacity: [0.35, 1, 0.35] }} exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ boxShadow: `inset 0 0 0 2px ${PISTACHIO}, 0 0 22px ${PISTACHIO}cc, 0 0 46px ${PISTACHIO}88` }} />
              )}
            </AnimatePresence>

            <button onClick={onClose} className="absolute top-3.5 right-3.5 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-ivory backdrop-blur transition hover:bg-black/50" aria-label="Sluiten">
              <X className="h-4 w-4" />
            </button>

            <PhotoGlassWidget
              shape="2:3"
              photo={PHOTO}
              glassPosition="bottom"
              glassFraction={0.72}
              domain="life"
              radius="large"
              overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/10"
              photoChildren={
                <div className="absolute top-0 left-0 right-0 z-20 p-3.5 pb-2" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                  <WidgetHeader type="pulse" label="How I'm Doing." count={W.time} />
                </div>
              }
              glassChildren={
                <AnimatePresence mode="wait" className="h-full">
                  {!started ? (
                    <motion.div key="start" className="flex flex-col h-full items-center justify-center text-center px-4"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: IVORY }}>
                      <span className="text-[10px] uppercase tracking-[0.22em] opacity-60">{W.time}</span>
                      <h3 className="text-[26px] font-display font-black tracking-[-0.02em] mt-1" style={{ color: PISTACHIO }}>{W.label}</h3>
                      <p className="text-[12px] opacity-85 mt-1.5 max-w-[82%] leading-snug">{W.subtitle}</p>
                      <p className="text-[9px] uppercase tracking-[0.16em] opacity-50 mt-2.5">5 vragen · ~2 min</p>
                      <button onClick={() => setStarted(true)} className="mt-3 rounded-full px-5 py-2 text-[12px] font-bold transition hover:brightness-95" style={{ background: PISTACHIO, color: INK }}>Begin check-in</button>
                    </motion.div>
                  ) : (
                    <motion.div key="flow" className="h-full overflow-y-auto"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <CheckInFlow window={win} onSave={save} onDone={done} theme="dark" accent={PISTACHIO} />
                    </motion.div>
                  )}
                </AnimatePresence>
              }
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}