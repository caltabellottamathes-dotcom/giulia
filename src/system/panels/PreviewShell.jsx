import React from "react";
import { useNavigate } from "react-router-dom";

function GraphicRule({ accent, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="h-px bg-marble/20" />
      <div className="absolute left-0 top-0 h-px w-16" style={{ background: accent }} />
    </div>
  );
}

export default function PreviewShell({ index, section, statement, kicker, accent = "#d8dab3", children, context = [], actions = [] }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full text-storm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-4">
          {index && <span className="text-storm/10 text-4xl font-bold leading-none tabular-nums select-none">{index}</span>}
          {section && <span className="text-storm/60 text-[11px] uppercase tracking-[0.3em] pt-2">{section}</span>}
        </div>
      </div>
      <div className="mt-1">
        {statement && <h2 className="text-storm text-xl sm:text-2xl font-bold tracking-tight">{statement}</h2>}
        {kicker && <p className="text-storm/60 text-[10px] mt-1 tracking-[0.25em] uppercase">{kicker}</p>}
      </div>
      <GraphicRule accent={accent} className="my-4" />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
      {context.length > 0 && (
        <>
          <GraphicRule accent={accent} className="my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {context.map((c, i) => (
              <div key={i}>
                <div className="flex items-center gap-2.5">
                  <span className="text-storm/30 text-[10px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-storm/80 text-[10px] uppercase tracking-[0.2em] font-semibold">{c.label}</p>
                </div>
                <p className="text-storm/70 text-xs mt-1.5 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
      <GraphicRule accent={accent} className="my-4" />
      <div className="flex flex-wrap gap-2">
        {actions.map((a, i) => {
          const handle = () => { if (a.onClick) a.onClick(); else if (a.to) navigate(a.to); };
          return a.primary ? (
            <button key={i} onClick={handle} className="px-4 py-2 rounded-full text-metal text-[10px] font-semibold tracking-[0.15em] uppercase hover:brightness-95 active:scale-95 transition-all" style={{ background: accent }}>{a.label}</button>
          ) : (
            <button key={i} onClick={handle} className="px-4 py-2 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-[10px] tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors">{a.label}</button>
          );
        })}
      </div>
    </div>
  );
}