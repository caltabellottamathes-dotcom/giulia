import React from "react";

/** BarPulse — geanimeerd staafgrafiek (live data). Eén vast, herbruikbaar blok:
 *  de 8-weekse activiteitsbalken uit What Social Life?, losgekoppeld van de widget. */
export default function BarPulse({ values = [], height = 40, gap = 6, accent = "var(--tile-accent)", className }) {
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