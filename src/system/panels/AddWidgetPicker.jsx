import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/**
 * AddWidgetPicker — widget-beheer per OS-laag. Mooie kaarten met de
 * branding-foto + full-caps naam per widget.
 */
const DOMAINS = [
  { key: "giulia", label: "GIULIA", accent: "hsl(var(--olive))" },
  { key: "focus", label: "FOCUS", accent: "hsl(var(--sand))" },
  { key: "life", label: "LIFE", accent: "hsl(var(--life-blue))" },
  { key: "system", label: "SYSTEM", accent: "hsl(var(--muted-foreground))" },
];

export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const [domain, setDomain] = useState("giulia");
  const widgets = WIDGET_LIST.filter((w) => w.domain === domain);
  const pinnedCount = widgets.filter((w) => addedTypes.includes(w.type)).length;
  const accent = DOMAINS.find((d) => d.key === domain)?.accent || "hsl(var(--olive))";

  const pick = (w) => {
    if (addedTypes.includes(w.type)) return;
    onAdd?.(w.type);
  };

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={420}>
      <div className="p-5 text-ivory">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">DASHBOARD</p>
          <span className="text-[10px] font-mono text-ivory/40 tabular-nums">{pinnedCount}/{widgets.length} GEPIND</span>
        </div>
        <h3 className="text-xl font-display font-semibold tracking-tight uppercase">Widget pinnen</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ivory/45 mt-1 mb-4">Tik een widget om hem op dit dashboard te zetten.</p>

        <div className="flex gap-1 p-1 rounded-full glass-card-2 mb-4 overflow-x-auto">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDomain(d.key)}
              className={cn("flex-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold tracking-[0.14em] transition whitespace-nowrap", domain === d.key ? "text-ivory" : "text-ivory/40 hover:text-ivory/75")}
              style={domain === d.key ? { background: d.accent } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <AnimatePresence mode="wait">
            <motion.div key={domain} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="col-span-2 grid grid-cols-2 gap-2.5">
              {widgets.map((w, i) => {
                const added = addedTypes.includes(w.type);
                return (
                  <motion.button
                    key={w.type}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.25 }}
                    onClick={() => pick(w)}
                    disabled={added}
                    className={cn("group relative aspect-[4/3] rounded-2xl overflow-hidden text-left border transition", added ? "border-white/10 opacity-60 cursor-default" : "border-white/15 hover:border-white/35 hover:-translate-y-0.5")}
                  >
                    <img src={w.image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-transparent" />
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] uppercase tracking-[0.16em] font-bold backdrop-blur-md" style={added ? { background: "rgba(255,255,255,0.16)", color: "hsl(var(--ivory))" } : { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.7)" }}>
                      {added ? (<><Check className="h-2.5 w-2.5" /> GEPIND</>) : (<><Plus className="h-2.5 w-2.5" /> PIN</>)}
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-[11px] uppercase tracking-[0.1em] font-bold text-ivory leading-tight" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{w.label}</span>
                    <span className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: accent, opacity: added ? 0.4 : 0.9 }} />
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </FloatingPanel>
  );
}