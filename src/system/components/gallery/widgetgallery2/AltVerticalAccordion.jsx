import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt H — Vertical accordion (3:5 tall portrait). Rows expand to reveal a
 *  photo + detail; the active row grows while others shrink. Smooth height
 *  transition between rows. */
export default function AltVerticalAccordion({ widget }) {
  const rows = (widget.items && widget.items.length)
    ? widget.items.map((it, i) => ({ title: it.label, meta: it.time, text: it.label }))
    : [
        { title: widget.sub, meta: "01", text: widget.sub },
        { title: widget.page2?.title || "Details", meta: "02", text: widget.page2?.text || widget.sub },
        { title: widget.actions?.[0] || "Meer", meta: "03", text: widget.actions?.join(" · ") },
      ];
  const [open, setOpen] = useState(0);
  return (
    <div className="relative rounded-[24px] overflow-hidden glass-3 flex flex-col p-3 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/5", ...accentVars(widget.accent) }}>
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-[10px] uppercase tracking-[0.28em] font-semibold opacity-65">{widget.label}</span>
        {widget.value != null && <span className="text-2xl font-display font-bold leading-none">{widget.value}</span>}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 min-h-0">
        {rows.map((r, idx) => (
          <button key={idx} onClick={(e) => { e.stopPropagation(); setOpen(idx); }} className={`rounded-xl text-left overflow-hidden glass-1 transition-all ${open === idx ? "flex-1" : "shrink-0"}`}>
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-[10px] tabular-nums opacity-50">{r.meta}</span>
              <span className="text-[11px] font-medium truncate flex-1">{r.title}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: open === idx ? "var(--tile-accent)" : "rgba(255,255,255,0.2)" }} />
            </div>
            <AnimatePresence>
              {open === idx && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                  <div className="relative h-24 mx-3 mb-3 rounded-lg overflow-hidden">
                    <img src={widget.photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2 text-[10px] text-ivory/90 line-clamp-2">{r.text}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <button className="mt-2 rounded-full py-2 text-[11px] font-semibold transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{widget.actions?.[0] || "Openen"}</button>
    </div>
  );
}