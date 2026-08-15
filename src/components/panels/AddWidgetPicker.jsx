import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/**
 * AddWidgetPicker — every available widget, grouped by the three LIFE-layer
 * themes (FOCUS / LIFE / SELF) so the catalog reads as one coherent OS rather
 * than a flat list. Each theme has its own accent and blurb.
 */
const THEMES = [
  { key: "focus", label: "FOCUS", blurb: "Werk, communicatie & kennis", categories: ["core", "work", "comms", "intelligence"], accent: "hsl(var(--olive))" },
  { key: "life", label: "LIFE", blurb: "Relaties, huishouden, admin & hobby's", categories: ["life"], accent: "hsl(var(--life-blue))" },
  { key: "self", label: "SELF", blurb: "Rust, zelfzorg & reflectie", categories: ["self"], accent: "hsl(var(--self-burgundy))" },
];

function WidgetTile({ w, added, onAdd }) {
  return (
    <button
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
}

export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={460}>
      <div className="p-6 lg:p-7 text-ivory">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold mb-2">Dashboard</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Widget toevoegen</h3>
        <p className="text-sm text-ivory/55 mt-1.5 mb-6">Geordend in de drie thema's van je OS.</p>

        <div className="space-y-6">
          {THEMES.map((theme) => {
            const widgets = WIDGET_LIST.filter((w) => theme.categories.includes(w.category));
            return (
              <div key={theme.key}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: theme.accent }} />
                  <h4 className="text-[11px] uppercase tracking-[0.24em] font-semibold text-ivory">{theme.label}</h4>
                  <span className="text-[10px] text-ivory/40">· {theme.blurb}</span>
                </div>
                {widgets.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {widgets.map((w) => (
                      <WidgetTile key={w.type} w={w} added={addedTypes.includes(w.type)} onAdd={onAdd} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card-2 rounded-2xl px-5 py-8 text-center">
                    <p className="text-sm text-ivory/45">SELF-widgets komen binnenkort.</p>
                    <p className="text-[11px] text-ivory/30 mt-1">Rituelen, reflectie & zelfzorg.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FloatingPanel>
  );
}