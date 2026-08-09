import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * GiuliaStepCard — one bold step. The hero is a branded portrait in a rounded
 * frame with the step number as a sculpted badge in the corner. Tone shifts
 * the overlay warmth. Tactile action buttons, no icon glyphs.
 */
export default function GiuliaStepCard({ step, index, image, onComplete, onApprove, onReject, onSkip }) {
  const overdue = step.tone === "overdue";
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <div className="relative h-24 w-24 rounded-2xl overflow-hidden mb-5 shrink-0 float-shadow">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="h-full w-full" style={{ background: "var(--tile-accent)" }} />
        )}
        <div className={cn("absolute inset-0", overdue ? "bg-charcoal/40" : "bg-charcoal/25")} />
        <span className="absolute bottom-1.5 right-1.5 h-8 w-8 rounded-full flex items-center justify-center text-base font-display font-semibold shadow-md" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
          {index + 1}
        </span>
      </div>
      <p className="text-[10px] uppercase tracking-[0.24em] opacity-50 font-semibold mb-2">{step.kind}</p>
      <h4 className="text-xl font-display font-semibold text-current leading-tight mb-1.5 text-balance">{step.title}</h4>
      <p className="text-sm opacity-55 mb-6">{step.meta}</p>

      <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
        {step.type === "approval" ? (
          <>
            <button onClick={onApprove} className="h-12 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Goedkeuren</button>
            <button onClick={onReject} className="h-11 rounded-2xl font-semibold text-sm border border-current/15 text-current transition hover:bg-current/5">Afwijzen</button>
          </>
        ) : step.type === "task" ? (
          <>
            <button onClick={onComplete} className="h-12 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Voltooien</button>
            <button onClick={onSkip} className="h-11 rounded-2xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">Later</button>
          </>
        ) : step.type === "event" ? (
          <>
            <Link to="/agenda" className="h-12 rounded-2xl font-semibold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Bekijk in agenda</Link>
            <button onClick={onSkip} className="h-11 rounded-2xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">Volgende</button>
          </>
        ) : (
          <>
            <Link to="/email" className="h-12 rounded-2xl font-semibold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Open mail</Link>
            <button onClick={onSkip} className="h-11 rounded-2xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">Volgende</button>
          </>
        )}
      </div>
    </div>
  );
}