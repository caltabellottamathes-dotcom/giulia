import React, { useState } from "react";
import ColorToggle from "./ColorToggle";

/**
 * Design 2 — "Solid Bento": full-bleed solid palette color per widget,
 * ivory type, the graphic hero blown up as large as the card allows. Bold,
 * high-contrast, poster-like — the OS's solid-palette decision taken all the way.
 */
const solidBg = { olive: "bg-olive", sand: "bg-sand", ridge: "bg-ridge", storm: "bg-storm", charcoal: "bg-charcoal" };

export default function VariantBento({ widget }) {
  const [color, setColor] = useState(widget.accent);
  const bg = solidBg[color] || solidBg[widget.accent];

  return (
    <div className={`relative aspect-[4/3] rounded-[20px] ${bg} p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.35)]`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ivory/10" />
      <Hero widget={widget} />
      <div className="flex items-end justify-between gap-3 relative z-10">
        <p className="text-[11px] text-ivory/70 leading-snug">{widget.sub}</p>
        <ColorToggle value={color} onChange={setColor} dark />
      </div>
    </div>
  );
}

function Hero({ widget }) {
  switch (widget.kind) {
    case "stat":
      return (
        <div className="relative z-10">
          <p className="text-6xl font-display font-bold tracking-tight text-ivory leading-none">{widget.value}</p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-ivory/60 mt-2.5">{widget.unit}</p>
        </div>
      );
    case "chat":
      return (
        <div className="relative z-10 flex items-center gap-3">
          <span className="h-14 w-14 rounded-full bg-ivory text-charcoal flex items-center justify-center font-display font-bold text-base shrink-0">
            {widget.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ivory">{widget.name}</p>
            <p className="text-xs text-ivory/65 truncate">{widget.message}</p>
          </div>
          {widget.unread > 0 && <span className="h-2.5 w-2.5 rounded-full bg-ivory animate-pulse-soft shrink-0" />}
        </div>
      );
    case "timeline":
      return (
        <div className="relative z-10 space-y-3">
          {widget.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-ivory/60 w-9 shrink-0">{it.time}</span>
              <span className="h-px flex-1 bg-ivory/25" />
              <span className="text-xs text-ivory truncate max-w-[7rem]">{it.label}</span>
            </div>
          ))}
        </div>
      );
    case "ring": {
      const r = 34, c = 2 * Math.PI * r, off = c - (widget.value / 100) * c;
      return (
        <div className="relative z-10 flex items-center justify-center">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="9" />
            <circle cx="44" cy="44" r={r} fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
          </svg>
          <p className="absolute text-2xl font-display font-bold text-ivory">{widget.value}<span className="text-xs text-ivory/70">%</span></p>
        </div>
      );
    }
    case "avatars":
      return (
        <div className="relative z-10 flex items-center">
          {widget.initials.map((n, i) => (
            <span
              key={i}
              style={{ marginLeft: i === 0 ? 0 : -12, zIndex: widget.initials.length - i }}
              className="h-12 w-12 rounded-full bg-ivory text-charcoal text-xs font-bold flex items-center justify-center border-2 border-current"
            >
              {n}
            </span>
          ))}
        </div>
      );
    case "preview":
      return (
        <div className="relative z-10 h-20 rounded-xl bg-ivory/12 border border-ivory/20 overflow-hidden flex items-end p-3">
          <span className="absolute top-2 right-2 h-6 min-w-6 px-1.5 rounded-full bg-ivory text-charcoal text-[10px] font-bold flex items-center justify-center">{widget.count}</span>
          <p className="text-xs text-ivory font-medium truncate">{widget.sub}</p>
        </div>
      );
    case "route":
      return (
        <div className="relative z-10 flex items-end gap-2 h-20">
          {widget.bars.map((b, i) => (
            <span key={i} className="w-3.5 rounded-full bg-ivory" style={{ height: `${b * 10}px`, opacity: 0.4 + (i / widget.bars.length) * 0.6 }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}