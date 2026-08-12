import React from "react";
import { cn } from "@/lib/utils";

export default function LayeredWidgetTile({ image, label, count, onClick, onHeaderClick, children, bodyClassName }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-2 rounded-[24px] p-3 pb-4 text-foreground w-full max-w-[380px] mx-auto",
        onClick && "cursor-pointer hover:-translate-y-0.5 transition-transform"
      )}
    >
      <div
        onClick={onHeaderClick}
        role={onHeaderClick ? "button" : undefined}
        tabIndex={onHeaderClick ? 0 : undefined}
        className={cn(
          "relative h-24 rounded-[18px] overflow-hidden shadow-[0_20px_44px_-18px_rgba(0,0,0,0.45)]",
          onHeaderClick && "cursor-pointer"
        )}
      >
        <img src={image} alt="" draggable={false} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/25 to-transparent" />
        <div className="absolute inset-0 px-5 flex items-end justify-between pb-4">
          <span className="text-[11px] uppercase tracking-[0.24em] font-semibold text-ivory/90">{label}</span>
          {count != null && <span className="text-lg font-display font-bold text-ivory tabular-nums leading-none">{count}</span>}
        </div>
      </div>
      <div className={cn("pt-3", bodyClassName)}>{children}</div>
    </div>
  );
}