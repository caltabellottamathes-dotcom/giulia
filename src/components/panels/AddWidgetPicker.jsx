import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AddWidgetPicker — lists every available widget not yet on the dashboard.
 */
export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const available = WIDGET_LIST.filter((w) => !addedTypes.includes(w.type));

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={460}>
      <div className="p-6 lg:p-7">
        <p className="text-[10px] uppercase tracking-[0.28em] text-olive/80 font-semibold mb-2">Dashboard</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Widget toevoegen</h3>
        <p className="text-sm text-foreground/55 mt-1.5 mb-6">Kies een widget om op je homepage te plaatsen.</p>

        {available.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {available.map((w) => (
              <button
                key={w.type}
                onClick={() => onAdd(w.type)}
                className="glass-card-2 rounded-2xl p-4 flex flex-col items-start gap-3 text-left hover:-translate-y-0.5 hover:border-olive/30 transition-all"
              >
                <span className="h-9 w-9 rounded-xl bg-olive/15 border border-olive/25 flex items-center justify-center">
                  <w.icon className="h-4 w-4 text-olive" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-foreground">{w.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-foreground/40">{w.category}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={cn("glass-1 rounded-2xl p-8 flex flex-col items-center text-center")}>
            <span className="h-10 w-10 rounded-full bg-olive/15 flex items-center justify-center mb-3">
              <Check className="h-5 w-5 text-olive" />
            </span>
            <p className="text-sm font-semibold">Alle widgets staan op je dashboard</p>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}