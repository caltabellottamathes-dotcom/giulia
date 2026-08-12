import React from "react";

// The standard manual color-toggle control every widget carries — lets Salvo
// preview the card against transparent or a palette color.
const SWATCHES = [
  { key: "transparent", className: "bg-transparent border border-current/40" },
  { key: "olive", className: "bg-olive" },
  { key: "sand", className: "bg-sand" },
  { key: "charcoal", className: "bg-charcoal" },
  { key: "ridge", className: "bg-ridge" },
];

export default function ColorToggle({ value, onChange, dark = false }) {
  return (
    <div className="flex items-center gap-1.5">
      {SWATCHES.map((s) => (
        <button
          key={s.key}
          onClick={(e) => { e.stopPropagation(); onChange(s.key); }}
          className={`h-3.5 w-3.5 rounded-full transition-all ${s.className} ${
            value === s.key ? "scale-125 ring-2 ring-offset-1 ring-current" : "opacity-60 hover:opacity-100 hover:scale-110"
          } ${dark ? "text-ivory" : "text-charcoal"}`}
          aria-label={`Kleur ${s.key}`}
        />
      ))}
    </div>
  );
}