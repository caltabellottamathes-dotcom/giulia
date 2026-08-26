import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CheckInFlow from "@/life/components/CheckInFlow";
import { WINDOWS, currentWindowKey } from "@/life/components/checkInConfig";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const PISTACHIO = "#d8dab3"; // Whipped Pistachio
const INK = "#2a2d22";
const IVORY = "hsl(var(--ivory))";

/** HowDoingCheckInOverlay — grote pop-up met de check-in flow. Opent
 *  automatisch zodra een check-in openstaat (getriggerd vanuit de
 *  HowDoing-widget via het `giulia:open-howdoing-checkin` event). Na
 *  invullen wordt de entity opgeslagen en sluit de pop-up; de widget
 *  op het dashboard toont daarna weer zijn normale ringen-stand. */
export default function HowDoingCheckInOverlay({ open, onClose }) {
  const [started, setStarted] = useState(false);
  const win = currentWindowKey();
  const W = WINDOWS[win];

  // Reset de start-staat wanneer de pop-up sluit, zodat hij de volgende
  // keer weer netjes bij het beginscherm opent.
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
            className="relative w-full max-w-[600px] overflow-hidden rounded-[36px] border border-white/15 bg-charcoal/85 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ aspectRatio: "4 / 5", maxHeight: "88vh" }}
          >
            {/* Foto-accent (zacht, zodat de flow leesbaar blijft) */}
            <img src={PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/40" />

            {/* Knipperende Whipped Pistachio-gloed zolang de check-in niet gestart is */}
            <AnimatePresence>
              {!started && (
                <motion.span className="absolute inset-0 rounded-[36px] pointer-events-none z-30"
                  initial={{ opacity: 0 }} animate={{ opacity: [0.35, 1, 0.35] }} exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ boxShadow: `inset 0 0 0 2px ${PISTACHIO}, 0 0 24px ${PISTACHIO}cc, 0 0 52px ${PISTACHIO}88` }} />
              )}
            </AnimatePresence>

            <button onClick={onClose} className="absolute top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-ivory backdrop-blur transition hover:bg-white/20" aria-label="Sluiten">
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-20 h-full">
              <AnimatePresence mode="wait">
                {!started ? (
                  <motion.div key="start" className="flex h-full flex-col items-center justify-center px-8 text-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: IVORY }}>
                    <span className="text-[11px] uppercase tracking-[0.24em] opacity-60">{W.time}</span>
                    <h3 className="mt-2 text-4xl font-display font-black tracking-[-0.02em]" style={{ color: PISTACHIO }}>{W.label}</h3>
                    <p className="mt-3 max-w-[80%] text-sm leading-snug opacity-85">{W.subtitle}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.16em] opacity-50">5 vragen · ~2 min</p>
                    <button onClick={() => setStarted(true)} className="mt-6 rounded-full px-7 py-3 text-sm font-bold transition hover:brightness-95" style={{ background: PISTACHIO, color: INK }}>Begin check-in</button>
                  </motion.div>
                ) : (
                  <motion.div key="flow" className="h-full overflow-y-auto p-5 sm:p-6"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CheckInFlow window={win} onSave={save} onDone={done} theme="dark" accent={PISTACHIO} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}