import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { URGENT } from "./domainAccent";

/** CheckChip — één afvinkrij. Transparant glas over de foto. urgent → #d5e24a. */
export function CheckChip({ it, onToggle, accent = "var(--tile-accent)" }) {
  const urgent = !!it.urgent;
  const a = urgent ? URGENT : accent;
  return (
    <motion.button
      type="button" onClick={onToggle} layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left transition-colors"
      style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      <span
        className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: it.done ? a : urgent ? URGENT : "rgba(255,255,255,0.5)", background: it.done ? a : "transparent" }}
      >
        {it.done && <Check className="h-3 w-3 text-black/80" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium leading-tight truncate ${it.done ? "text-white/40 line-through" : "text-white"}`}>{it.label}</p>
        {it.sub && <p className={`text-[10px] truncate ${it.done ? "text-white/30" : urgent ? "text-white/70 font-semibold" : "text-white/55"}`}>{it.sub}</p>}
      </div>
      {urgent && !it.done && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: URGENT }} />}
    </motion.button>
  );
}

/** CheckList — lijst + sluiten/heropenen-state. Accent + urgent-aware. */
export default function CheckList({ items = [], onToggle, accent, onClose, closed, onReopen, title = "Gedaan", maxH }) {
  const doneCount = items.filter((it) => it.done).length;
  const allDone = items.length > 0 && doneCount === items.length;

  if (closed) {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-black" style={{ background: "var(--tile-accent)" }}>
          <Check className="h-3.5 w-3.5" strokeWidth={3} /> {title}
        </span>
        {onReopen && (
          <button
            onClick={onReopen}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)" }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Heropenen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5" style={maxH ? { maxHeight: maxH, overflow: "auto" } : undefined}>
      <AnimatePresence>
        {items.map((it, i) => (
          <CheckChip key={it.id || i} it={it} onToggle={() => onToggle(i)} accent={accent} />
        ))}
      </AnimatePresence>
      {allDone && onClose && (
        <motion.button
          onClick={onClose} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="self-center mt-1 rounded-full px-5 py-2 text-xs font-bold text-black shadow-lg"
          style={{ background: "var(--tile-accent)" }}
        >
          Markeer als gedaan & sluiten
        </motion.button>
      )}
    </div>
  );
}