import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt C — Square (1:1) auto-rotating card stack. Two card edges peek behind
 *  the front card; the front content crossfades through 3 data views. */
export default function AltCardStack({ widget }) {
  const data = [
    { big: widget.value ?? 0, label: widget.unit, text: widget.sub },
    { big: null, label: widget.page2?.title, text: widget.page2?.text },
    { big: widget.actions?.length ?? 0, label: "acties", text: widget.actions?.join(" · ") },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % data.length), 3200);
    return () => clearInterval(t);
  }, [data.length]);

  return (
    <div className="relative rounded-[24px] overflow-hidden glass-3 shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars(widget.accent) }}>
      {/* peeking stack edges */}
      <div className="absolute inset-x-7 top-6 bottom-12 rounded-2xl glass-1" />
      <div className="absolute inset-x-4 top-3 bottom-9 rounded-2xl glass-2" />
      {/* front card */}
      <div className="absolute inset-x-2 inset-y-2 rounded-2xl overflow-hidden">
        <img src={widget.photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/88 via-charcoal/25 to-charcoal/15" />
        <div className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/90">{widget.label}</div>
        <div className="absolute top-3 right-3 flex gap-1" onClick={(e) => e.stopPropagation()}>
          {data.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-ivory" : "w-1.5 bg-ivory/40"}`} aria-label={`kaart ${idx + 1}`} />
          ))}
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-ivory">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              {data[i].big != null && <div className="text-4xl font-display font-bold leading-none">{data[i].big}</div>}
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1">{data[i].label}</div>
              <div className="text-xs text-ivory/85 mt-1.5 line-clamp-2">{data[i].text}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}