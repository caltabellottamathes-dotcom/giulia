import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * GiuliaStepCard — one bold step. The hero is a large numeric badge (the
 * step index) sized like a piece of type, color-coded by tone. Action
 * buttons are sculpted and tactile. No icon glyphs.
 */
export default function GiuliaStepCard({ step, index, onComplete, onApprove, onReject, onSkip }) {
  const overdue = step.tone === "overdue";
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center mb-5"
        style={overdue
          ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" }
          : { background: "rgba(255,255,255,0.08)", color: "currentColor" }}
      >
        <span className="text-4xl font-display font-semibold tracking-[-0.04em] leading-none">
          {index + 1}
        </span>
      </div>
      <p className="text-[10px] uppercase tracking-[0.24em] opacity-50 font-semibold mb-2">{step.kind}</p>
      <h4 className="text-xl font-display font-semibold text-current leading-tight mb-1.5 text-balance">{step.title}</h4>
      <p className="text-sm opacity-55 mb-6">{step.meta}</p>

      <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
        {step.type === "approval" ? (
          <>
            <button onClick={onApprove} className="h-12 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
              Goedkeuren
            </button>
            <button onClick={onReject} className="h-11 rounded-2xl font-semibold text-sm border border-ivory/15 text-current transition hover:bg-ivory/5">
              Afwijzen
            </button>
          </>
        ) : step.type === "task" ? (
          <>
            <button onClick={onComplete} className="h-12 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
              Voltooien
            </button>
            <button onClick={onSkip} className="h-11 rounded-2xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">
              Later
            </button>
          </>
        ) : step.type === "event" ? (
          <>
            <Link to="/agenda" className="h-12 rounded-2xl font-semibold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
              Bekijk in agenda
            </Link>
            <button onClick={onSkip} className="h-11 rounded-2xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">
              Volgende
            </button>
          </>
        ) : (
          <>
            <Link to="/email" className="h-12 rounded-2xl font-semibold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
              Open mail
            </Link>
            <button onClick={onSkip} className="h-11 rounded-2xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">
              Volgende
            </button>
          </>
        )}
      </div>
    </div>
  );
}