import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";

/**
 * AddWidgetPicker — every available widget, presented as a branded photo card
 * (no icons). Light text over each photo.
 */
export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const available = WIDGET_LIST.filter((w) => !addedTypes.includes(w.type));

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={460}>
      <div className="p-6 lg:p-7 text-ivory">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold mb-2">Dashboard</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Widget toevoegen</h3>
        <p className="text-sm text-ivory/55 mt-1.5 mb-6">Kies een widget om op je homepage te plaatsen.</p>

        {available.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {available.map((w) => (
              <button
                key={w.type}
                onClick={() => onAdd(w.type)}
                className="glass-card-2 rounded-2xl overflow-hidden text-left hover:-translate-y-0.5 transition-all group"
              >
                <div className="relative h-20 overflow-hidden">
                  <img src={w.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[9px] uppercase tracking-wider text-ivory/70 font-semibold">{w.category}</span>
                </div>
                <div className="p-3">
                  <span className="text-sm font-semibold text-ivory">{w.label}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={cn("glass-1 rounded-2xl p-8 flex flex-col items-center text-center")}>
            <p className="text-3xl font-display font-semibold text-ivory mb-1">✓</p>
            <p className="text-sm font-semibold text-ivory">Alle widgets staan op je dashboard</p>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}