import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/**
 * AddWidgetPicker — every available widget, presented as a branded photo card.
 * All widgets are listed (added ones are dimmed and marked "Toegevoegd") so the
 * full catalog is visible at a glance.
 */
export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={460}>
      <div className="p-6 lg:p-7 text-ivory">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold mb-2">Dashboard</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Widget toevoegen</h3>
        <p className="text-sm text-ivory/55 mt-1.5 mb-6">Alle widgets die je kunt plaatsen. Toegevoegde widgets zijn gemarkeerd.</p>

        <div className="grid grid-cols-2 gap-3">
          {WIDGET_LIST.map((w) => {
            const added = addedTypes.includes(w.type);
            return (
              <button
                key={w.type}
                onClick={() => !added && onAdd(w.type)}
                disabled={added}
                className={cn(
                  "glass-card-2 rounded-2xl overflow-hidden text-left transition-all group relative",
                  added ? "opacity-55 cursor-default" : "hover:-translate-y-0.5"
                )}
              >
                <div className="relative h-20 overflow-hidden">
                  <img
                    src={w.image}
                    alt=""
                    className={cn("h-full w-full object-cover transition-transform duration-500", !added && "group-hover:scale-105")}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[9px] uppercase tracking-wider text-ivory/70 font-semibold">{w.category}</span>
                  {added && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[9px] uppercase tracking-wider bg-ivory text-charcoal px-1.5 py-0.5 rounded-full font-semibold">
                      <Check className="h-2.5 w-2.5" /> Toegevoegd
                    </span>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ivory">{w.label}</span>
                  {added ? <Check className="h-3.5 w-3.5 text-ivory/50 shrink-0" /> : <Plus className="h-3.5 w-3.5 text-ivory/50 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </FloatingPanel>
  );
}