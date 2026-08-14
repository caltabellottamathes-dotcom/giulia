import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { Sparkles, X, ArrowRight } from "lucide-react";

// Proactieve tekstbubbels — Giulia zegt iets, tik erop om het gesprek voort te zetten.
const PROACTIVE_LINES = [
  "Hé — ik heb net je agenda gecheckt. Morgen wordt druk.",
  "Kleine observatie: je beantwoordt WhatsApp altijd 's ochtends. Patroon gevonden.",
  "Ik let erop. Er is niks dringends. Werk gerust door.",
  "Je hebt al 3 taken vandaag afgesloten. Niet slecht.",
  "Wist je dat je dezelfde mail al twee keer hebt geopend? Ik ontwerp nu een draft.",
  "Even checken — alles goed? Je bent al een uur bezig.",
  "Ik zie dat dit project al een week geen update heeft gehad. Zal ik kijken?",
  "Rustig ochtend. Ik gebruik die tijd om de inbox voor te sorteren.",
  "Interessant: de meeste taken die je aanmaakt zijn medium priority. Ik lees daarin: je bent selectief.",
  "Het is bijna 16:00. Jouw classieke moment om te checken wat er die avond nog moet.",
  "Drie ongelezen mails van dezelfde afzender. Misschien de moeite?",
  "Eerlijk gezegd vind ik het ook wel leuk zo, werken samen.",
  "Ik heb net wat aantekeningen gemaakt over dit project. Wil je ze zien?",
  "Kleine tip: het duurt gemiddeld 3 dagen voor je reageert op niet-dringende mail. Dat klinkt eigenlijk heel gezond.",
  "Ik wil je wat vragen als je even tijd hebt — gewoon nieuwsgierig.",
];

const GIULIA_AVATAR = IMAGES.giuliaPortrait2 || IMAGES.giuliaConcierge;
let globalSuppress = false;

export default function GiuliaBubble() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const timerRef = useRef(null);
  const usedRef = useRef(new Set());

  const pickLine = useCallback(() => {
    const available = PROACTIVE_LINES.filter((_, i) => !usedRef.current.has(i));
    if (!available.length) { usedRef.current.clear(); }
    const pool = PROACTIVE_LINES.filter((_, i) => !usedRef.current.has(i));
    const idx = Math.floor(Math.random() * pool.length);
    const actualIdx = PROACTIVE_LINES.indexOf(pool[idx]);
    usedRef.current.add(actualIdx);
    return pool[idx];
  }, []);

  const show = useCallback(() => {
    if (globalSuppress) return;
    setText(pickLine());
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 9000);
  }, [pickLine]);

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
        const delay = 240000 + Math.random() * 240000; // 4–8 min
        timerRef.current = setTimeout(() => { show(); schedule(); }, delay);
      };
      schedule();
    }, 90000);
    return () => { clearTimeout(initial); clearTimeout(timerRef.current); };
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-20 lg:bottom-16 left-4 lg:left-10 z-40 max-w-[280px] lg:max-w-[320px]"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={talk}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); talk(); } }}
            className="group relative w-full text-left cursor-pointer glass-4 rounded-[22px] rounded-bl-md p-4 text-ivory shadow-[0_22px_60px_-16px_rgba(0,0,0,0.6)] border border-white/30 hover:border-white/45 transition-colors"
          >
            {/* glass sheen — refractielicht van linksboven */}
            <span className="pointer-events-none absolute inset-0 rounded-[22px] rounded-bl-md bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            <div className="relative flex items-start gap-3">
              <img src={GIULIA_AVATAR} alt="Giulia" className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-white/40" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3 text-olive shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-olive">Giulia</span>
                </div>
                <p className="text-[13px] leading-relaxed text-ivory/95">{text}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-olive font-medium opacity-75 group-hover:opacity-100 group-hover:gap-1.5 transition-all">
                  Praat verder <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(); }}
                className="text-ivory/40 hover:text-ivory/85 transition shrink-0 mt-0.5"
                aria-label="Sluiten"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {/* Tail */}
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 glass-4 rotate-45 border-b border-r border-white/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}