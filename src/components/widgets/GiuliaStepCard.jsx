import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * GiuliaStepCard — one big, clear step: icon, title, meta, and the one or
 * two actions that actually matter for this item.
 */
export default function GiuliaStepCard({ step, onComplete, onApprove, onReject, onSkip }) {
  const Icon = step.icon;
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <span
        className={cn(
          "h-16 w-16 rounded-3xl flex items-center justify-center mb-5 border",
          step.tone === "overdue" ? "bg-red-500/15 border-red-500/40" : "bg-ivory/10 border-ivory/20"
        )}
      >
        <Icon className={cn("h-7 w-7", step.tone === "overdue" ? "text-red-400" : "text-ivory")} strokeWidth={1.5} />
      </span>
      <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 font-semibold mb-2">{step.kind}</p>
      <h4 className="text-xl font-display font-semibold text-ivory leading-tight mb-1.5 text-balance">{step.title}</h4>
      <p className="text-sm text-ivory/55 mb-7">{step.meta}</p>

      <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
        {step.type === "approval" ? (
          <>
            <button onClick={onApprove} className="h-12 rounded-2xl bg-olive text-ivory font-semibold text-sm hover:bg-olive/90 transition">
              Goedkeuren
            </button>
            <button onClick={onReject} className="h-12 rounded-2xl bg-ivory/10 border border-ivory/20 text-ivory font-semibold text-sm hover:bg-ivory/15 transition">
              Afwijzen
            </button>
          </>
        ) : step.type === "task" ? (
          <>
            <button onClick={onComplete} className="h-12 rounded-2xl bg-olive text-ivory font-semibold text-sm hover:bg-olive/90 transition">
              Voltooien
            </button>
            <button onClick={onSkip} className="h-11 rounded-2xl text-ivory/60 font-medium text-sm hover:text-ivory transition">
              Later
            </button>
          </>
        ) : step.type === "event" ? (
          <>
            <Link to="/agenda" className="h-12 rounded-2xl bg-olive text-ivory font-semibold text-sm flex items-center justify-center hover:bg-olive/90 transition">
              Bekijk in agenda
            </Link>
            <button onClick={onSkip} className="h-11 rounded-2xl text-ivory/60 font-medium text-sm hover:text-ivory transition">
              Volgende
            </button>
          </>
        ) : (
          <>
            <Link to="/email" className="h-12 rounded-2xl bg-olive text-ivory font-semibold text-sm flex items-center justify-center hover:bg-olive/90 transition">
              Open mail
            </Link>
            <button onClick={onSkip} className="h-11 rounded-2xl text-ivory/60 font-medium text-sm hover:text-ivory transition">
              Volgende
            </button>
          </>
        )}
      </div>
    </div>
  );
}