import React from "react";
import { ArrowUpRight, Plus } from "lucide-react";

/** OnderdeelPaneel — de vaste, consistente structuur voor elk LEVEL 02-onderdeelpaneel.
 *  Zes vaste slots, altijd in dezelfde volgorde, zodat elk paneel dezelfde anatomie heeft:
 *  01 accentstreep · 02 headerfoto · 03 titelblok (eyebrow + titel + topic) ·
 *  04 actierij · 05 content · 06 context-footer. */
export default function OnderdeelPaneel({
  accent = "hsl(var(--olive))",
  photo,
  eyebrow = "SNELLE CONTEXT",
  title,
  topic,
  actions = [],
  context = [],
  children,
}) {
  return (
    <div className="flex flex-col h-full rounded-[28px] overflow-hidden glass-3">
      {/* 01 — accentstreep */}
      <div className="h-[3px] w-full shrink-0" style={{ background: accent }} />

      {/* 02 — headerfoto */}
      <div className="relative shrink-0 h-40 overflow-hidden">
        {photo && <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
      </div>

      {/* 03 — contentkaart ( overlapt de foto ) */}
      <div className="flex-1 -mt-8 rounded-t-[28px] overflow-y-auto">
        <div className="px-7 lg:px-9 pt-6 pb-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">{eyebrow}</p>
          <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">
            {title}
          </h2>
          {topic && <p className="text-[13px] text-ivory/60 mt-2.5 leading-relaxed max-w-prose">{topic}</p>}

          {/* 04 — actierij */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-5">
              {actions.map((a, i) => a.primary ? (
                <button key={i} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition">
                  {a.icon === "plus" && <Plus className="h-3 w-3" />}
                  {a.icon === "open" && <ArrowUpRight className="h-3.5 w-3.5" />}
                  {a.label}
                </button>
              ) : (
                <button key={i} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-2 text-[11px] font-semibold text-ivory transition">
                  {a.icon === "plus" && <Plus className="h-3 w-3" />}
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 05 — content */}
        <div className="px-7 lg:px-9 pb-7">{children}</div>

        {/* 06 — context-footer (drie vaste slots) */}
        {context.length > 0 && (
          <div className="px-7 lg:px-9 pb-7 pt-5 border-t border-ivory/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {context.map((c, i) => (
              <div key={c.label}>
                <div className="flex items-center gap-2.5">
                  <span className="text-ivory/30 text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-ivory/80 text-[10px] uppercase tracking-[0.2em] font-semibold">{c.label}</p>
                </div>
                <p className="text-ivory/65 text-sm mt-2 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}