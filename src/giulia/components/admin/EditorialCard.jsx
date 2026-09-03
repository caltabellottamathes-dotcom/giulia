import React from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#b1bfc7";
const GREY = "#CCCCCC";
const BLACK = "#000000";
const INK = "#595c64";
export const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];

const BounceBalls = ({ color = "#000", count = 1, size = "clamp(7px, 0.55vw, 10px)", ml = "7px" }) => (
  <span className="inline-flex items-end gap-[3px] align-baseline" style={{ marginLeft: ml }} aria-hidden>
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color, width: size, height: size, animationDelay: `${i * 0.18}s` }} />
    ))}
  </span>
);

/**
 * EditorialCard — de witte graph-paper kaart uit het Admin LIFE-ontwerp.
 * Links (38%) de editorial-kolom (eyebrow N°1, grote titel met stuiterdot,
 * meta-regel, voorstel, "On what matters | now_" N°2 met genummerde items,
 * "Le reste peut attendre"); rechts de functionele pagina-inhoud.
 */
export default function EditorialCard({ eyebrow, title1, title2, metaLine, proposal, heading1, heading2, itemsLabel, items = [], children }) {
  const [eyeA, ...eyeRest] = (eyebrow || "Giulia").split("|");
  const eyeB = eyeRest.length ? " | " + eyeRest.join("|").trim() : "";
  const list = (items || []).slice(0, 4);
  const firstColor = list.length ? (list[0].color || NUM_COLORS[0]) : NUM_COLORS[0];

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="absolute inset-0 rounded-bl-[20px] rounded-r-none graph-paper flex overflow-hidden shadow-[-40px_8px_64px_-18px_rgba(0,0,0,0.55)]"
    >
      {/* Editorial — left ~38% */}
      <div className="relative z-0 w-[38%] h-full flex flex-col overflow-y-auto no-scrollbar border-r" style={{ borderColor: GREY }}>
        <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">{eyeA.trim()}</span>{eyeB}</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
          </div>

          <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(34px, 3vw, 54px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
            {title1}<br />{title2}<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
          </h2>

          <div className="ml-[80px] mt-8 space-y-2">
            {metaLine && <p className="font-display font-medium tracking-[-0.05em] text-[12px]" style={{ color: BLACK }}>{metaLine}</p>}
            {proposal && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: GREY }}>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: BLUE }}><span className="font-bold">Voorstel</span> | Giulia adviseert_</p>
                <p className="font-body text-[12px] leading-[1.55] whitespace-pre-line" style={{ color: INK }}>{proposal}</p>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-8" />

          <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5" style={{ color: BLACK, fontSize: "clamp(24px, 1.9vw, 38px)" }}>
            {heading1}<br />{heading2}<BounceBalls color={firstColor} count={3} />
          </h3>

          <div className="h-px w-full" style={{ background: "#d8dab3" }} />
          <div className="flex items-center justify-between mt-5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">On what matters</span> | now_</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
          </div>

          <div className="mt-4 ml-[80px] space-y-3">
            {itemsLabel && <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>{itemsLabel}</p>}
            {list.length === 0 && <p className="font-body text-[12px]" style={{ color: INK }}>Niets dringends.</p>}
            {list.map((it, idx) => {
              const ic = it.color || NUM_COLORS[idx % NUM_COLORS.length];
              return (
                <button key={idx} onClick={it.onClick} className="flex gap-3 items-end text-left w-full hover:opacity-70 transition">
                  <span className="w-[84px] shrink-0 flex justify-end items-end gap-[5px]">
                    <BounceBalls color={ic} count={idx + 1} ml="0" />
                    <span className="font-display font-bold leading-none" style={{ color: ic, fontSize: "30px" }}>{it.n || String(idx + 1).padStart(2, "0")}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-display ${it.desc ? "font-bold text-[13px]" : "font-medium text-[12.5px] leading-[1.4]"} leading-tight`} style={{ color: ic }}>{it.title}</p>
                    {it.desc && <p className="font-body text-[12px] leading-[1.4] mt-1" style={{ color: "#333" }}>{it.desc}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>Le reste peut attendre</p>
          </div>
        </div>
      </div>

      {/* RECHTS — functionele pagina-inhoud */}
      <div className="relative z-20 flex-1 min-w-0 h-full">
        <div className="h-full pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
}