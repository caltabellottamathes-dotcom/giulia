import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AddWidgetPicker — dark glass panel listing widgets not yet on the dashboard.
 */
export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const available = WIDGET_LIST.filter((w) => !addedTypes.includes(w.type));

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={460} className="bg-charcoal/95 border-white/10">
      <div className="p-6 lg:p-7 text-ivory">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/60 font-semibold mb-2">Dashboard</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight text-ivory">Widget toevoegen</h3>
        <p className="text-sm text-ivory/55 mt-1.5 mb-6">Kies een widget om op je homepage te plaatsen.</p>

        {available.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {available.map((w) => (
              <button
                key={w.type}
                onClick={() => onAdd(w.type)}
                className="rounded-2xl p-4 flex flex-col items-start gap-3 text-left bg-white/5 border border-white/10 hover:border-ivory/40 hover:bg-white/10 transition-all"
              >
                <span className="h-9 w-9 rounded-xl bg-ivory/10 border border-ivory/20 flex items-center justify-center">
                  <w.icon className="h-4 w-4 text-ivory" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-ivory">{w.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-ivory/45">{w.category}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={cn("rounded-2xl p-8 flex flex-col items-center text-center bg-white/5 border border-white/10")}>
            <span className="h-10 w-10 rounded-full bg-ivory/15 flex items-center justify-center mb-3">
              <Check className="h-5 w-5 text-ivory" />
            </span>
            <p className="text-sm font-semibold text-ivory">Alle widgets staan op je dashboard</p>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}