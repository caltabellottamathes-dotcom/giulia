import React from "react";
import { Link } from "react-router-dom";

function GraphicRule({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="h-px bg-marble/20" />
      <div className="absolute left-0 top-0 h-px w-20 bg-plum" />
    </div>
  );
}

export default function ModuleShell({ index, section, statement, kicker, backTo = "/", backLabel = "← Home", children, context = [], actions = [] }) {
  return (
    <div className="h-[100dvh] w-full bg-metal overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.22) 0%, rgba(242,242,240,0.10) 28%, rgba(45,45,35,0) 60%)" }} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8 py-6 h-full">
        <div className="rounded-[28px] border border-marble/30 bg-marble/10 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] p-5 sm:p-8 h-full flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-baseline gap-5">
              <span className="text-storm/10 text-6xl font-bold leading-none tabular-nums select-none">{index}</span>
              <span className="text-storm/60 text-[11px] uppercase tracking-[0.3em] pt-3">{section}</span>
            </div>
            <Link to={backTo} className="shrink-0 text-storm/60 hover:text-storm text-sm pt-3">{backLabel}</Link>
          </div>

          <div className="mt-4">
            <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">{statement}</h1>
            {kicker && <p className="text-storm/60 text-xs mt-2 tracking-[0.25em] uppercase">{kicker}</p>}
          </div>

          <GraphicRule className="my-6" />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>

          {context.length > 0 && (
            <>
              <GraphicRule className="my-6" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {context.map((c, i) => (
                  <div key={c.label}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-storm/30 text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-storm/80 text-[10px] uppercase tracking-[0.2em] font-semibold">{c.label}</p>
                    </div>
                    <p className="text-storm/70 text-sm mt-2 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <GraphicRule className="my-6" />
          <div className="flex flex-wrap gap-2.5">
            {actions.map((a, i) => a.primary ? (
              <button key={i} className="px-6 py-3 rounded-full bg-plum text-storm text-xs font-semibold tracking-[0.15em] uppercase hover:brightness-125 active:scale-95 transition-all">{a.label}</button>
            ) : (
              <button key={i} className="px-6 py-3 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-xs tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors">{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}