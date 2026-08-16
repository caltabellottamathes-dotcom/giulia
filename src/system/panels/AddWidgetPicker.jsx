import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/**
 * AddWidgetPicker — widget-beheer, ingedeeld in de vijf OS-lagen
 * (GIULIA · FOCUS · LIFE · SELF · SYSTEM). Geen iconen: elke widget
 * krijgt een ronde foto (de branding-foto uit de widget zelf).
 */
const DOMAINS = [
  { key: "giulia", label: "GIULIA", accent: "hsl(var(--olive))" },
  { key: "focus", label: "FOCUS", accent: "hsl(var(--sand))" },
  { key: "life", label: "LIFE", accent: "hsl(var(--life-blue))" },
  { key: "self", label: "SELF", accent: "hsl(var(--self-primary))" },
  { key: "system", label: "SYSTEM", accent: "hsl(var(--muted-foreground))" },
];

export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const [domain, setDomain] = useState("giulia");
  const widgets = WIDGET_LIST.filter((w) => w.domain === domain);
  const pinnedCount = widgets.filter((w) => addedTypes.includes(w.type)).length;

  const pick = (w) => {
    if (addedTypes.includes(w.type)) return;
    onAdd?.(w.type);
  };

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={380}>
      <div className="p-5 text-ivory">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Dashboard</p>
          <span className="text-[10px] font-mono text-ivory/40 tabular-nums">{pinnedCount}/{widgets.length} gepind</span>
        </div>
        <h3 className="text-xl font-display font-semibold tracking-tight">Widget pinnen</h3>
        <p className="text-[12px] text-ivory/45 mt-1 mb-4">Tik een widget om hem op dit dashboard te zetten.</p>

        {/* Domain segmented control */}
        <div className="flex gap-1 p-1 rounded-full glass-card-2 mb-4 overflow-x-auto">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDomain(d.key)}
              className={cn("flex-1 rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-wide transition whitespace-nowrap", domain === d.key ? "text-ivory" : "text-ivory/40 hover:text-ivory/75")}
              style={domain === d.key ? { background: d.accent } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* List — single column, ronde foto + naam */}
        <div className="space-y-0.5">
          <AnimatePresence mode="wait">
            <motion.div key={domain} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {widgets.map((w, i) => {
                const added = addedTypes.includes(w.type);
                return (
                  <motion.button
                    key={w.type}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.18), duration: 0.2 }}
                    onClick={() => pick(w)}
                    disabled={added}
                    className={cn("group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors", added ? "opacity-55 cursor-default" : "hover:bg-ivory/8")}
                  >
                    <img src={w.image} alt="" draggable={false} className="shrink-0 h-9 w-9 rounded-full object-cover border border-white/15" />
                    <span className="flex-1 min-w-0 text-[13px] font-medium text-ivory truncate">{w.label}</span>
                    <span className="shrink-0">
                      {added ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-ivory/50 font-semibold"><Check className="h-3 w-3" /> Geplint</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-ivory/30 font-semibold group-hover:text-olive transition-colors"><Plus className="h-3 w-3" /> Pin</span>
                      )}
                    </span>
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