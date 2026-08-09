import React from "react";

/**
 * WidgetHeader — bold graphic header for dashboard widgets.
 * A solid accent icon chip, a tight display-weight label (not a tiny
 * uppercase whisper), an optional tiny wide-tracked kicker beneath it, and
 * a large tabular count numeral on the right. Big type + small type together.
 */
export default function WidgetHeader({ icon: Icon, label, count, kicker }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-display font-semibold tracking-[-0.01em] text-current leading-none truncate">
            {label}
          </h3>
          {kicker && (
            <p className="text-[9px] uppercase tracking-[0.24em] text-current opacity-50 mt-1.5 font-semibold">
              {kicker}
            </p>
          )}
        </div>
      </div>
      {count != null && count !== "" && (
        <span className="text-[12px] font-semibold tabular-nums text-current opacity-55 leading-none shrink-0">
          {count}
        </span>
      )}
    </div>
  );
}