import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "glass", label: "Glas", swatch: "glass-card" },
  { key: "charcoal", label: "Metal", swatch: "bg-charcoal" },
  { key: "olive", label: "Clay", swatch: "bg-olive" },
  { key: "sand", label: "Sand", swatch: "bg-sand" },
  { key: "ridge", label: "Sky", swatch: "bg-ridge" },
  { key: "storm", label: "Storm", swatch: "bg-storm" },
];

/**
 * WidgetCell — grid cell hosting one widget, with hover controls to remove it
 * and to style it: glass / a palette color, plus transparency and blur.
 */
export default function WidgetCell({ def, widget, onRemove, onThemeChange }) {
  const Comp = def.Component;
  const [open, setOpen] = useState(false);
  const theme = widget?.theme || "glass";
  const color = widget?.color || "";
  const [op, setOp] = useState(widget?.opacity ?? 1);
  const [bl, setBl] = useState(widget?.blur ?? 0);

  useEffect(() => {
    setOp(widget?.opacity ?? 1);
    setBl(widget?.blur ?? 0);
  }, [widget?.id, widget?.opacity, widget?.blur]);

  const isActive = (opt) => (opt.key === "glass" ? theme === "glass" : theme === "solid" && color === opt.key);

  const pick = async (opt) => {
    const next = opt.key === "glass" ? { theme: "glass", color: "" } : { theme: "solid", color: opt.key };
    try { await base44.entities.DashboardWidget.update(widget.id, next); onThemeChange?.(widget.id, next); } catch {}
  };

  const commit = async (patch) => {
    try { await base44.entities.DashboardWidget.update(widget.id, patch); onThemeChange?.(widget.id, patch); } catch {}
  };

  return (
    <div className="relative group h-full">
      <div className="absolute top-2 right-2 z-30 flex gap-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-7 px-3 rounded-full bg-ivory text-charcoal shadow-md text-[11px] font-semibold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:-translate-y-0.5"
          aria-label="Widget stijl"
        >
          Stijl
        </button>
        <button
          onClick={onRemove}
          className="h-7 w-7 rounded-full bg-ivory text-charcoal shadow-md text-base leading-none opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:-translate-y-0.5"
          aria-label="Verwijderen"
        >
          ×
        </button>
      </div>

      {open && (
        <div className="absolute top-11 right-2 z-40 glass-3 rounded-2xl p-3 w-60 animate-scale-in space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => pick(opt)}
                title={opt.label}
                aria-label={opt.label}
                className={cn(
                  "h-7 rounded-lg border-2 transition",
                  opt.swatch,
                  isActive(opt) ? "border-ivory" : "border-white/15 hover:border-white/35"
                )}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ivory/70">
              <span>Transparantie</span>
              <span className="tabular-nums">{Math.round(op * 100)}</span>
            </div>
            <input
              type="range" min={0} max={100} value={Math.round(op * 100)}
              onChange={(e) => setOp(+e.target.value / 100)}
              onPointerUp={() => commit({ opacity: op })}
              className="w-full accent-ivory"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ivory/70">
              <span>Vervaging</span>
              <span className="tabular-nums">{bl}px</span>
            </div>
            <input
              type="range" min={0} max={40} value={bl}
              onChange={(e) => setBl(+e.target.value)}
              onPointerUp={() => commit({ blur: bl })}
              className="w-full accent-ivory"
            />
          </div>
        </div>
      )}

      <WidgetThemeProvider value={{ theme, color, opacity: op, blur: bl }}>
        <Comp />
      </WidgetThemeProvider>
    </div>
  );
}