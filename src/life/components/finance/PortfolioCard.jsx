import React from "react";
import { ChevronRight } from "lucide-react";
import HealthBadge from "./HealthBadge";
import { fmtEuro, FREQ_LABELS, calcPortfolio } from "@/lib/financeUtils";

/** PortfolioCard — zelfstandige glazen financiële kaart. */
export default function PortfolioCard({ portfolio, expenses, onClick }) {
  const calc = calcPortfolio(portfolio, expenses);
  const actual = Number(portfolio.monthly_reservation_actual) || calc.recommended_monthly;
  const balance = Number(portfolio.current_balance) || 0;
  return (
    <button onClick={onClick} className="group text-left w-full rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.35)] p-5 hover:shadow-[0_24px_54px_-20px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{portfolio.category || "Portefeuille"}</p>
          <h3 className="text-lg font-display font-semibold tracking-tight text-foreground truncate">{portfolio.name}</h3>
        </div>
        <HealthBadge status={calc.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Current</p>
          <p className="text-2xl font-display font-semibold tabular-nums leading-none mt-0.5" style={{ color: "hsl(var(--d-focus-deep))" }}>{fmtEuro(balance)}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Reserved / mnd</p>
          <p className="text-2xl font-display font-semibold tabular-nums leading-none mt-0.5">{fmtEuro(actual)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">aanbevolen {fmtEuro(calc.recommended_monthly)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-foreground/10">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Next expense</p>
          <p className="text-sm font-display font-semibold">{fmtEuro(calc.next_expected_payment)}{calc.next_payment_date ? ` · ${new Date(calc.next_payment_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Target</p>
            <p className="text-sm font-display font-semibold tabular-nums">{fmtEuro(portfolio.target_balance || 0)}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </button>
  );
}