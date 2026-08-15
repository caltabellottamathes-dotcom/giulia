import React from "react";
import Ring from "@/system/widgets/Ring";
import CountUp from "@/system/widgets/CountUp";
import { accentBg, accentText } from "@/lib/widgetAccent";

/**
 * WidgetHero — the one big graphic element that answers the widget's single
 * question (bold number, animated ring, timeline, avatar cluster, bar-stack).
 * Shared across all 3 gallery designs so every design gets the same
 * bespoke-graphic quality, just staged differently.
 */
export default function WidgetHero({ widget, tone = "ivory", size = "lg" }) {
  const ab = accentBg[widget.accent];
  const at = accentText[widget.accent];
  const textMain = tone === "ivory" ? "text-ivory" : "text-charcoal";
  const textDim = tone === "ivory" ? "text-ivory/55" : "text-muted-foreground";
  const numSize = size === "xl" ? "text-[64px]" : "text-4xl";

  switch (widget.kind) {
    case "stat":
      return (
        <div>
          <CountUp value={widget.value} className={`${numSize} font-display font-bold tracking-tight leading-none ${textMain}`} />
          <p className={`text-[10px] uppercase tracking-[0.22em] mt-2 ${textDim}`}>{widget.unit}</p>
        </div>
      );
    case "chat":
      return (
        <div className="flex items-center gap-3">
          <span className={`h-12 w-12 rounded-full ${ab} text-ivory flex items-center justify-center font-display font-bold text-sm shrink-0`}>
            {widget.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${textMain}`}>{widget.name}</p>
            <p className={`text-xs truncate ${textDim}`}>{widget.message}</p>
          </div>
          {widget.unread > 0 && <span className={`h-2 w-2 rounded-full ${ab} animate-pulse-soft shrink-0`} />}
        </div>
      );
    case "timeline":
      return (
        <div className="space-y-2.5">
          {widget.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className={`text-[10px] font-mono w-9 shrink-0 ${textDim}`}>{it.time}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${ab} shrink-0`} />
              <span className={`text-xs truncate ${textMain}`}>{it.label}</span>
            </div>
          ))}
        </div>
      );
    case "ring":
      return (
        <div className="flex items-center gap-4">
          <Ring value={widget.value} max={100} size={size === "xl" ? 96 : 80} stroke={9} className={at}>
            <CountUp value={widget.value} className={`text-xl font-display font-bold ${textMain}`} />
          </Ring>
          <p className={`text-xs ${textDim}`}>{widget.sub}</p>
        </div>
      );
    case "avatars":
      return (
        <div className="flex items-center">
          {widget.initials.map((n, i) => (
            <span
              key={i}
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: widget.initials.length - i }}
              className={`h-11 w-11 rounded-full ${ab} text-ivory text-[11px] font-semibold flex items-center justify-center border-2 ${tone === "ivory" ? "border-charcoal/40" : "border-warm-white"}`}
            >
              {n}
            </span>
          ))}
        </div>
      );
    case "preview":
      return (
        <div className={`relative h-20 rounded-xl ${ab} overflow-hidden flex items-end p-3`}>
          <span className="absolute top-2 right-2 h-6 min-w-6 px-1.5 rounded-full bg-ivory text-charcoal text-[10px] font-bold flex items-center justify-center">{widget.count}</span>
          <p className="text-xs text-ivory font-medium truncate">{widget.sub}</p>
        </div>
      );
    case "route":
      return (
        <div className="flex items-end gap-1.5 h-20">
          {widget.bars.map((b, i) => (
            <span key={i} className={`w-3 rounded-full ${ab}`} style={{ height: `${b * 9}px`, opacity: 0.4 + (i / widget.bars.length) * 0.6 }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}