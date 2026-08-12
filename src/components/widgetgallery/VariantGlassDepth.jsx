import React, { useState } from "react";
import ColorToggle from "./ColorToggle";

/**
 * Design 3 — "Glass Depth": dark refraction glass with a soft colored glow
 * behind the hero graphic, matching the chat/voice panels' refraction-panel
 * material. Moody, premium, the graphic seems to float in the glass.
 */
const glow = { olive: "bg-olive", sand: "bg-sand", ridge: "bg-ridge", storm: "bg-storm", charcoal: "bg-charcoal" };
const accentText = { olive: "text-olive", sand: "text-sand", ridge: "text-ridge", storm: "text-storm", charcoal: "text-charcoal" };

export default function VariantGlassDepth({ widget }) {
  const [color, setColor] = useState("transparent");
  const glowClass = glow[widget.accent];
  const at = accentText[widget.accent];

  return (
    <div className="relative aspect-[4/3] rounded-[20px] glass-dark p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_56px_-24px_rgba(0,0,0,0.55)]">
      <span className={`pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full ${glowClass} opacity-25 blur-3xl`} />
      {color !== "transparent" && <span className={`pointer-events-none absolute inset-0 ${glow[color]} opacity-[0.14]`} />}
      <div className="relative z-10">
        <Hero widget={widget} at={at} glowClass={glowClass} />
      </div>
      <div className="relative z-10 flex items-end justify-between gap-3">
        <p className="text-[11px] text-ivory/55 leading-snug">{widget.sub}</p>
        <ColorToggle value={color} onChange={setColor} dark />
      </div>
    </div>
  );
}

function Hero({ widget, at, glowClass }) {
  switch (widget.kind) {
    case "stat":
      return (
        <div>
          <p className="text-5xl font-display font-bold tracking-tight text-ivory leading-none">{widget.value}</p>
          <p className={`text-[10px] uppercase tracking-[0.22em] mt-2 ${at}`}>{widget.unit}</p>
        </div>
      );
    case "chat":
      return (
        <div className="flex items-center gap-3">
          <span className={`h-12 w-12 rounded-full ${glowClass} text-ivory flex items-center justify-center font-display font-semibold text-sm shrink-0`}>
            {widget.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ivory">{widget.name}</p>
            <p className="text-xs text-ivory/55 truncate">{widget.message}</p>
          </div>
          {widget.unread > 0 && <span className="h-2 w-2 rounded-full bg-olive animate-pulse-soft shrink-0" />}
        </div>
      );
    case "timeline":
      return (
        <div className="space-y-2.5">
          {widget.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-ivory/45 w-9 shrink-0">{it.time}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${glowClass} shrink-0`} />
              <span className="text-xs text-ivory/85 truncate">{it.label}</span>
            </div>
          ))}
        </div>
      );
    case "ring": {
      const r = 32, c = 2 * Math.PI * r, off = c - (widget.value / 100) * c;
      return (
        <div className="flex items-center gap-4">
          <svg width="78" height="78" viewBox="0 0 78 78" className="-rotate-90">
            <circle cx="39" cy="39" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
            <circle cx="39" cy="39" r={r} fill="none" className={at} stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
          </svg>
          <p className="text-3xl font-display font-bold text-ivory">{widget.value}<span className="text-sm text-ivory/50">%</span></p>
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
              className={`h-11 w-11 rounded-full ${glowClass} text-ivory text-[11px] font-semibold flex items-center justify-center border-2 border-charcoal/60`}
            >
              {n}
            </span>
          ))}
        </div>
      );
    case "preview":
      return (
        <div className={`relative h-20 rounded-xl ${glowClass} opacity-90 overflow-hidden flex items-end p-3`}>
          <span className="absolute top-2 right-2 h-6 min-w-6 px-1.5 rounded-full bg-charcoal/70 text-ivory text-[10px] font-bold flex items-center justify-center">{widget.count}</span>
          <p className="text-xs text-ivory font-medium truncate">{widget.sub}</p>
        </div>
      );
    case "route":
      return (
        <div className="flex items-end gap-1.5 h-20">
          {widget.bars.map((b, i) => (
            <span key={i} className={`w-3 rounded-full ${glowClass}`} style={{ height: `${b * 10}px`, opacity: 0.4 + (i / widget.bars.length) * 0.6 }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}