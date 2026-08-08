import React from "react";
import { X } from "lucide-react";

/**
 * WidgetCell — a tidy grid cell hosting one widget, with a hover-remove
 * control. No free-drag; layout is a clean sorted bento grid.
 */
export default function WidgetCell({ def, onRemove }) {
  const Comp = def.Component;
  return (
    <div className="relative group h-full">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-30 h-7 w-7 rounded-full bg-ivory text-charcoal shadow-sm flex items-center justify-center hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
        aria-label="Verwijderen"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <Comp />
    </div>
  );
}