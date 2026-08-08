import React from "react";

/**
 * WidgetHeader — consistent header for dashboard widgets.
 * Icon chip is a SOLID palette accent (reads on every tile color); the label
 * and count inherit the tile's text color so contrast is always correct.
 */
export default function WidgetHeader({ icon: Icon, label, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span
          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <h3 className="text-[11px] uppercase tracking-[0.22em] font-semibold text-current opacity-70">
          {label}
        </h3>
      </div>
      {count != null && count !== "" && (
        <span className="text-[11px] tabular-nums font-medium text-current opacity-50">{count}</span>
      )}
    </div>
  );
}