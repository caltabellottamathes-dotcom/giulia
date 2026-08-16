import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { Sparkles, X, ArrowRight, Check } from "lucide-react";

const GIULIA_AVATAR = IMAGES.giuliaPortrait2 || IMAGES.giuliaConcierge;

/**
 * GiuliaBubble — proactieve, contextuele bubbels. Elke keer dat hij
 * opkomt wordt `proactiveBubble` aangeroepen, die de live staat leest
 * (te late taken, aankomende afspraak, ongelezen mail, goedkeuringen …)
 * en — als Giulia "tijd heeft" — écht een voorbereidende actie in gang
 * zet. Visueel echt glasmorphism: heel transparant, zware blur, dunne
 * licht rand, donkere tekst op matglas.
 */
export default function GiuliaBubble() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("proactiveBubble", {});
      const d = res?.data ?? res ?? {};
      if (!d || !d.line) return;
      setData(d);
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 11000);
    } catch { /* ignore */ }
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  const talk = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
    navigate("/chat");
  }, [navigate]);

  useEffect(() => {
    const initial = setTimeout(() => {
      show();
      const schedule = () => {
        const delay = 300000 + Math.random() * 300000; // 5–10 min
        timerRef.current = setTimeout(() => { show(); schedule(); }, delay);
      };
      schedule();
    }, 60000);
    return () => { clearTimeout(initial); clearTimeout(timerRef.current); };
  }, [show]);

  const glass = {
    background: "rgba(255,255,255,0.16)",
    backdropFilter: "blur(42px) saturate(1.6)",
    WebkitBackdropFilter: "blur(42px) saturate(1.6)",
    border: "1px solid rgba(255,255,255,0.45)",
    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.6), 0 18px 48px -20px rgba(0,0,0,0.22)",
  };
  const tailGlass = {
    background: "rgba(255,255,255,0.16)",
    backdropFilter: "blur(42px) saturate(1.6)",
    WebkitBackdropFilter: "blur(42px) saturate(1.6)",
    borderBottom: "1px solid rgba(255,255,255,0.45)",
    borderRight: "1px solid rgba(255,255,255,0.45)",
  };

  return (
    <AnimatePresence>
      {visible && data && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-20 lg:bottom-16 left-4 lg:left-10 z-40 max-w-[290px] lg:max-w-[330px]"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={talk}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); talk(); } }}
            className="group relative w-full text-left cursor-pointer rounded-[24px] rounded-bl-md p-4 text-foreground transition-colors"
            style={glass}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-[24px] rounded-bl-md"
              style={{ background: "radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.35), transparent 46%)" }}
            />
            <div className="relative flex items-start gap-3">
              <img src={GIULIA_AVATAR} alt="Giulia" className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-white/50" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3 text-olive shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-olive">Giulia</span>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{data.line}</p>
                {data.actionLabel && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-olive">
                    {data.actionDone ? <Check className="h-3 w-3" /> : <span className="h-2.5 w-2.5 rounded-full bg-olive/70 animate-pulse-soft" />}
                    {data.actionLabel}
                  </div>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-foreground/55 font-medium opacity-80 group-hover:opacity-100 group-hover:gap-1.5 transition-all">
                  Praat verder <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(); }}
                className="text-foreground/45 hover:text-foreground transition shrink-0 mt-0.5"
                aria-label="Sluiten"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 rotate-45" style={tailGlass} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}