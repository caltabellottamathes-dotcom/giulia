import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CAT_TONE = {
  core: { chip: "bg-sand text-charcoal", bar: "hsl(var(--sand))" },
  work: { chip: "bg-olive text-ivory", bar: "hsl(var(--olive))" },
  comms: { chip: "bg-blue-grey text-charcoal", bar: "hsl(var(--blue-grey))" },
  intelligence: { chip: "bg-charcoal text-ivory", bar: "hsl(var(--charcoal))" },
};

/**
 * AddWidgetPicker — a premium, editorial widget gallery. Full-bleed photo
 * header, bold display title, and strong palette tiles per category.
 */
export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const available = WIDGET_LIST.filter((w) => !addedTypes.includes(w.type));

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={560}>
      {/* Editorial photo header */}
      <div className="relative h-32 overflow-hidden">
        <img src={IMAGES.portraitBootHands} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/25" />
        <div className="relative h-full flex flex-col justify-end p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sand font-semibold mb-1.5">Dashboard</p>
          <h3 className="text-[28px] font-display font-semibold tracking-[-0.02em] text-ivory leading-none">Widget toevoegen</h3>
        </div>
      </div>

      <div className="p-6 lg:p-7">
        <p className="text-sm text-foreground/55 mb-5">Til je dashboard naar een hoger niveau — kies een module om toe te voegen.</p>

        {available.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {available.map((w) => {
              const tone = CAT_TONE[w.category] || CAT_TONE.work;
              return (
                <button
                  key={w.type}
                  onClick={() => onAdd(w.type)}
                  className="group relative overflow-hidden rounded-2xl bg-stone border border-charcoal/10 p-4 flex flex-col items-start gap-3 text-left hover:-translate-y-1 transition-all duration-300 shadow-[0_18px_44px_-16px_hsl(30_10%_20%/0.16)]"
                >
                  <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: tone.bar }} />
                  <span className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shrink-0", tone.chip)}>
                    <w.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-display font-semibold text-charcoal leading-tight">{w.label}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/45 font-semibold mt-1">{w.category}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal/70 group-hover:text-olive transition">
                    <Plus className="h-3 w-3" /> Toevoegen
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-olive text-ivory p-8 flex flex-col items-center text-center">
            <span className="h-11 w-11 rounded-full bg-ivory/15 flex items-center justify-center mb-3">
              <Check className="h-6 w-6 text-ivory" />
            </span>
            <p className="text-base font-display font-semibold">Alles staat op je dashboard</p>
            <p className="text-xs text-ivory/70 mt-1">Geen widgets meer om toe te voegen.</p>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}