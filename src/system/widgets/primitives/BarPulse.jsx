import React from "react";

/** BarPulse — geanimeerd staafgrafiek. Twee modi:
 *  - values:[]  simpele puls-staven (legacy, bv. Social) — ongewijzigd.
 *  - items:[{value,label,color,inactive,selected,onClick}]  gelabelde,
 *    gekleurde, klikbare staven (Things I Love) — pill-stijl met label. */
export default function BarPulse({ values = [], items, height = 40, gap = 6, accent = "var(--tile-accent)", className }) {
  if (items) {
    const MAX = 8;
    return (
      <div className={`flex items-end ${className || ""}`} style={{ height, gap }}>
        {items.map((it, i) => {
          const zero = it.value === 0;
          return (
            <button
              key={it.key ?? i}
              onClick={it.onClick}
              type="button"
              className="flex-1 h-full flex flex-col items-center justify-end"
              style={{ cursor: it.onClick ? "pointer" : "default" }}
            >
              <div
                className="w-full rounded-full transition-all duration-500"
                style={{
                  height: `${zero ? 3 : Math.max(8, (it.value / MAX) * 100)}%`,
                  background: it.color || accent,
                  opacity: it.inactive ? 0.35 : zero ? 0.3 : it.selected ? 1 : 0.78,
                  boxShadow: it.selected
                  ? `0 0 0 2px hsl(var(--ivory)), 0 6px 16px -4px rgba(0,0,0,0.5)`
                  : `0 5px 12px -4px rgba(0,0,0,0.38)`,
                }}
              />
              {it.label != null && (
                <span className="text-[7px] truncate w-full text-center mt-1 leading-none" style={{ opacity: it.inactive ? 0.4 : 0.72 }}>
                  {it.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  const max = Math.max(1, ...values);
  return (
    <div className={`flex items-end ${className || ""}`} style={{ height, gap }}>
      {values.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-full transition-all duration-700"
          style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: v ? accent : "currentColor", opacity: v ? 0.9 : 0.12 }}
        />
      ))}
    </div>
  );
}