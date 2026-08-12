import React from "react";
import { accentBg } from "@/lib/widgetAccent";

/** ActionRow — multiple sculpted action buttons; the "many actions" control. */
export default function ActionRow({ actions, accent, tone = "ivory" }) {
  const primary = accentBg[accent] || "bg-olive";
  const secondary = tone === "ivory"
    ? "bg-ivory/12 border border-ivory/20 text-ivory hover:bg-ivory/20"
    : "bg-charcoal/8 border border-charcoal/15 text-charcoal hover:bg-charcoal/15";

  return (
    <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
      {(actions || []).map((a, i) => (
        <button
          key={a}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition hover:-translate-y-0.5 active:scale-95 ${
            i === 0 ? `${primary} text-ivory` : secondary
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}