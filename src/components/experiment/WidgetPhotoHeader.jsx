import React from "react";

/**
 * WidgetPhotoHeader — the branded photo strip that tops every experiment
 * "widget" card. Same pattern as the dashboard widgets: a photo with a dark
 * gradient, a small uppercase label and an optional count, all in ivory.
 * If `onClick` is provided the header acts as a button (used by the stat set).
 */
export default function WidgetPhotoHeader({ image, label, count, onClick }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="relative h-16 shrink-0 overflow-hidden w-full text-left"
    >
      <img src={image} alt="" draggable={false} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/25 to-transparent" />
      <div className="absolute inset-0 px-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/90">{label}</span>
        {count != null && <span className="text-[10px] uppercase tracking-wider text-ivory/70 tabular-nums">{count}</span>}
      </div>
    </div>
  );
}