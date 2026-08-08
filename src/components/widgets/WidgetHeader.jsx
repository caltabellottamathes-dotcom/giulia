import React from "react";

/**
 * WidgetHeader — consistent, clear header for dashboard widgets.
 */
export default function WidgetHeader({ icon: Icon, label, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-olive/15 border border-olive/20 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-olive" strokeWidth={1.75} />
        </span>
        <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">
          {label}
        </h3>
      </div>
      {count != null && count !== "" && (
        <span className="text-[11px] text-foreground/45 tabular-nums font-medium">{count}</span>
      )}
    </div>
  );
}