import React from "react";
import { X } from "lucide-react";

const BLUE = "#b1bfc7";

/** Editorial masthead voor de mobiele Mattia-chat — zelfde taal als de
 *  Admin-pagina's: mono eyebrow "Mattia | mobile_", grote display-titel met
 *  stuiterdot, N°-marker. Sluitknop linksboven. */
export default function MattiaMobileMasthead({ onClose }) {
  return (
    <div className="shrink-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 border-b" style={{ borderColor: "#CCCCCC" }}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>
              <span className="font-bold text-black">Mattia</span> | mobile_
            </p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] text-[clamp(30px,8.5vw,40px)] text-black"
            style={{ textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}
          >
            Zeg het,<br />Mattia hoort<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "10px", height: "10px" }} />
          </h1>
        </div>
        <button onClick={onClose} aria-label="Sluiten" className="shrink-0 -ml-2 p-2 text-charcoal/45 hover:text-charcoal transition">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}