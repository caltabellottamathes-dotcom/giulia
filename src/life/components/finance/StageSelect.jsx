import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BTN = { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" };
const POP = { background: "rgba(28,30,34,0.94)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 24px 56px -18px rgba(0,0,0,0.55)" };

/** StageSelect — OS-stijl glas-dropdown voor de donkere stage-panelen. Donkere
 *  glasknop + glazen popover, ivory tekst, vinkje bij geselecteerde optie. */
export default function StageSelect({ value, onChange, options, placeholder, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value) || null;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm text-ivory transition" style={BTN}>
        {selected?.color ? <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: selected.color }} /> : null}
        <span className="flex-1 text-left truncate">{selected ? selected.label : (placeholder || "Kies…")}</span>
        <ChevronDown className={`w-4 h-4 text-ivory/60 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-1.5 left-0 w-full min-w-[180px] rounded-xl p-1.5 max-h-64 overflow-y-auto no-scrollbar"
            style={POP}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className={`flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-sm text-left text-ivory transition ${active ? "bg-white/15" : "hover:bg-white/10"}`}>
                  {o.color ? <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: o.color }} /> : null}
                  <span className="flex-1 truncate">{o.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-ivory/80 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}