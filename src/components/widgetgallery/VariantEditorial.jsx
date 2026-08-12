import React, { useState } from "react";
import ColorToggle from "./ColorToggle";

/**
 * Design 1 — "Ivory Editorial": light warm-white card, a thin colored
 * accent bar, and one oversized graphic hero per widget kind. Charcoal type,
 * airy and quiet — the OS's editorial register.
 */
const accentBg = { olive: "bg-olive", sand: "bg-sand", ridge: "bg-ridge", storm: "bg-storm", charcoal: "bg-charcoal" };
const accentText = { olive: "text-olive", sand: "text-sand", ridge: "text-ridge", storm: "text-storm", charcoal: "text-charcoal" };
const tint = { transparent: "", olive: "bg-olive/[0.06]", sand: "bg-sand/[0.08]", charcoal: "bg-charcoal/[0.04]", ridge: "bg-ridge/[0.10]" };

export default function VariantEditorial({ widget }) {
  const [color, setColor] = useState("transparent");
  const ab = accentBg[widget.accent];
  const at = accentText[widget.accent];

  return (
    <div className={`relative aspect-[4/3] rounded-[20px] bg-warm-white border border-border/60 p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-22px_rgba(0,0,0,0.16)] ${tint[color]}`}>
      <span className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full ${ab}`} />
      <div className="pt-1.5">
        <Hero widget={widget} ab={ab} at={at} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-[11px] text-muted-foreground leading-snug">{widget.sub}</p>
        <ColorToggle value={color} onChange={setColor} />
      </div>
    </div>
  );
}

function Hero({ widget, ab, at }) {
  switch (widget.kind) {
    case "stat":
      return (
        <div>
          <p className="text-5xl font-display font-bold tracking-tight text-charcoal leading-none">{widget.value}</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-2">{widget.unit}</p>
        </div>
      );
    case "chat":
      return (
        <div className="flex items-center gap-3">
          <span className={`h-12 w-12 rounded-full ${ab} text-ivory flex items-center justify-center font-display font-semibold text-sm shrink-0`}>
            {widget.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-charcoal">{widget.name}</p>
            <p className="text-xs text-muted-foreground truncate">{widget.message}</p>
          </div>
          {widget.unread > 0 && <span className={`h-2 w-2 rounded-full ${ab} animate-pulse-soft shrink-0`} />}
        </div>
      );
    case "timeline":
      return (
        <div className="space-y-2.5">
          {widget.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground w-9 shrink-0">{it.time}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${ab} shrink-0`} />
              <span className="text-xs text-charcoal truncate">{it.label}</span>
            </div>
          ))}
        </div>
      );
    case "ring": {
      const r = 32, c = 2 * Math.PI * r, off = c - (widget.value / 100) * c;
      return (
        <div className="flex items-center gap-4">
          <svg width="78" height="78" viewBox="0 0 78 78" className="-rotate-90">
            <circle cx="39" cy="39" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
            <circle cx="39" cy="39" r={r} fill="none" className={at} stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
          </svg>
          <p className="text-3xl font-display font-bold text-charcoal">{widget.value}<span className="text-sm text-muted-foreground">%</span></p>
        </div>
      );
    }
    case "avatars":
      return (
        <div className="flex items-center">
          {widget.initials.map((n, i) => (
            <span
              key={i}
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: widget.initials.length - i }}
              className={`h-11 w-11 rounded-full ${ab} text-ivory text-[11px] font-semibold flex items-center justify-center border-2 border-warm-white`}
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
            <span key={i} className={`w-3 rounded-full ${ab}`} style={{ height: `${b * 10}px`, opacity: 0.45 + (i / widget.bars.length) * 0.55 }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}