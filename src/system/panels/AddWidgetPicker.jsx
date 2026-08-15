import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/**
 * AddWidgetPicker — puur widget-beheer, editoriaal en compact.
 * Eén kolom, hairline-rijen: icon-chip + naam + pin-status. Geen zware
 * beeldkaarten, geen chaos. Ingedeeld per thema (FOCUS / LIFE / SELF).
 */
const THEMES = [
  { key: "focus", label: "FOCUS", categories: ["core", "work", "comms", "intelligence"], accent: "hsl(var(--olive))" },
  { key: "life", label: "LIFE", categories: ["life"], accent: "hsl(var(--life-blue-deep))" },
  { key: "self", label: "SELF", categories: ["self"], accent: "hsl(var(--self-burgundy))" },
];

export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const [theme, setTheme] = useState("focus");
  const active = THEMES.find((t) => t.key === theme);
  const widgets = WIDGET_LIST.filter((w) => active.categories.includes(w.category));
  const pinnedCount = widgets.filter((w) => addedTypes.includes(w.type)).length;

  const pick = (w) => {
    if (addedTypes.includes(w.type)) return;
    onAdd?.(w.type);
  };

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={380}>
      <div className="p-5 text-ivory">
        {/* Header — compact, editorial */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Dashboard</p>
          <span className="text-[10px] font-mono text-ivory/40 tabular-nums">{pinnedCount}/{widgets.length} gepind</span>
        </div>
        <h3 className="text-xl font-display font-semibold tracking-tight">Widget pinnen</h3>
        <p className="text-[12px] text-ivory/45 mt-1 mb-4">Tik een widget om hem op je dashboard te zetten.</p>

        {/* Theme segmented control — slim */}
        <div className="flex gap-1 p-1 rounded-full glass-card-2 mb-4">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className={cn("flex-1 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition", theme === t.key ? "text-ivory" : "text-ivory/40 hover:text-ivory/75")}
              style={theme === t.key ? { background: t.accent } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List — single column, hairline rows */}
        <div className="space-y-0.5">
          <AnimatePresence mode="wait">
            <motion.div key={theme} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {widgets.length ? widgets.map((w, i) => {
                const added = addedTypes.includes(w.type);
                const Icon = w.icon;
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
                    <span className="shrink-0 h-8 w-8 rounded-lg glass-card-2 flex items-center justify-center">
                      {Icon ? <Icon className="h-3.5 w-3.5 text-ivory/70" /> : null}
                    </span>
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
              }) : (
                <div className="px-3 py-10 text-center">
                  <p className="text-[12px] text-ivory/45">SELF-modules komen binnenkort.</p>
                  <p className="text-[10px] text-ivory/30 mt-1">Rituelen, reflectie & zelfzorg.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </FloatingPanel>
  );
}