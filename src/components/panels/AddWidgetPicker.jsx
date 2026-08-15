import React, { useState } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/**
 * AddWidgetPicker — widgets grouped behind three theme tabs (FOCUS / LIFE / SELF)
 * so the catalog stays compact instead of one long scroll.
 */
const THEMES = [
  { key: "focus", label: "FOCUS", blurb: "Werk, communicatie & kennis", categories: ["core", "work", "comms", "intelligence"], accent: "hsl(var(--olive))" },
  { key: "life", label: "LIFE", blurb: "Relaties, huishouden, admin & hobby's", categories: ["life"], accent: "hsl(var(--life-blue-deep))" },
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
        <img src={w.image} alt="" className={cn("h-full w-full object-cover transition-transform duration-500", !added && "group-hover:scale-105")} draggable={false} />
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
  const [theme, setTheme] = useState("focus");
  const active = THEMES.find((t) => t.key === theme);
  const widgets = WIDGET_LIST.filter((w) => active.categories.includes(w.category));

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={420}>
      <div className="p-6 lg:p-7 text-ivory">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold mb-2">Dashboard</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Widget toevoegen</h3>
        <p className="text-sm text-ivory/55 mt-1.5 mb-5">Kies een thema, dan een widget.</p>

        {/* Theme tabs */}
        <div className="flex gap-1.5 p-1 rounded-full glass-card-2 mb-5">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className={cn("flex-1 rounded-full px-3 py-2 text-[11px] font-semibold tracking-wide transition", theme === t.key ? "text-ivory" : "text-ivory/45 hover:text-ivory/80")}
              style={theme === t.key ? { background: t.accent } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40 font-semibold mb-3">{active.blurb}</p>

        {widgets.length ? (
          <div className="grid grid-cols-2 gap-3">
            {widgets.map((w) => (
              <WidgetTile key={w.type} w={w} added={addedTypes.includes(w.type)} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <div className="glass-card-2 rounded-2xl px-5 py-10 text-center">
            <p className="text-sm text-ivory/45">SELF-widgets komen binnenkort.</p>
            <p className="text-[11px] text-ivory/30 mt-1">Rituelen, reflectie & zelfzorg.</p>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}