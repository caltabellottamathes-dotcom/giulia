import React from "react";

/**
 * WidgetHeader — a quiet, secondary label line. No icon chip: the hero
 * graphic below carries all the visual weight; this just orients the reader.
 */
export default function WidgetHeader({ label, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-current opacity-55">
        {label}
      </h3>
      {count != null && count !== "" && (
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-current opacity-40 tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}