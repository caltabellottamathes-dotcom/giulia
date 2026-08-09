import React, { useState } from "react";
import { X, Palette } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "glass", label: "Glas", swatch: "glass-card", ring: "ring-ivory" },
  { key: "charcoal", label: "Metal", swatch: "bg-charcoal", ring: "ring-ivory" },
  { key: "olive", label: "Clay", swatch: "bg-olive", ring: "ring-ivory" },
  { key: "sand", label: "Sand", swatch: "bg-sand", ring: "ring-charcoal" },
];

/**
 * WidgetCell — a tidy grid cell hosting one widget, with hover controls to
 * remove it and to pick its appearance (glass or a full palette color).
 */
export default function WidgetCell({ def, widget, onRemove, onThemeChange }) {
  const Comp = def.Component;
  const [open, setOpen] = useState(false);
  const theme = widget?.theme || "glass";
  const color = widget?.color || "";

  const isActive = (opt) =>
    opt.key === "glass" ? theme === "glass" : theme === "solid" && color === opt.key;

  const pick = async (opt) => {
    setOpen(false);
    const next = opt.key === "glass"
      ? { theme: "glass", color: "" }
      : { theme: "solid", color: opt.key };
    try {
      await base44.entities.DashboardWidget.update(widget.id, next);
      onThemeChange?.(widget.id, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative group h-full">
      <div className="absolute top-2 right-2 z-30 flex gap-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-7 w-7 rounded-full bg-ivory text-charcoal shadow-sm flex items-center justify-center hover:scale-105 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
          aria-label="Widget stijl"
        >
          <Palette className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="h-7 w-7 rounded-full bg-ivory text-charcoal shadow-sm flex items-center justify-center hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
          aria-label="Verwijderen"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute top-11 right-2 z-40 glass-3 rounded-2xl p-2 flex items-center gap-1.5 animate-scale-in">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => pick(opt)}
              title={opt.label}
              aria-label={opt.label}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition",
                opt.swatch,
                isActive(opt) ? "border-ivory" : "border-white/20 hover:border-white/40"
              )}
            />
          ))}
        </div>
      )}

      <WidgetThemeProvider value={{ theme, color }}>
        <Comp />
      </WidgetThemeProvider>
    </div>
  );
}