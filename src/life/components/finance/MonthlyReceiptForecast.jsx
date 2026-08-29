import React, { useMemo } from "react";
import { fmtEuro } from "@/lib/financeUtils";

const MONTHS_NL = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** MonthlyReceiptForecast — per maand een kassabon van alle vaste lasten
 *  (recurring AdminObligations). Compacte receipt-stijl voor de Forecast-pagina. */
export default function MonthlyReceiptForecast({ expenses, portfolios, months = 6 }) {
  const pots = (portfolios || []).filter((p) => !p.archived);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "#94925d";

  const recurring = useMemo(() => {
    return (expenses || [])
      .filter((e) => e.frequency && e.frequency !== "once")
      .sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }, [expenses]);

  const monthlyTotal = recurring.reduce((s, e) => s + (Number(e.expected_amount ?? e.amount) || 0), 0);

  const monthsData = useMemo(() => {
    const now = new Date();
    const arr = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      arr.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTHS_NL[d.getMonth()]} '${String(d.getFullYear()).slice(2)}` });
    }
    return arr;
  }, [months]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {monthsData.map((m) => (
        <div key={m.key} className="rounded-[16px] graph-paper overflow-hidden flex flex-col" style={{ boxShadow: "-12px 12px 32px -16px rgba(0,0,0,0.28)" }}>
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b" style={{ borderColor: "hsl(var(--foreground) / 0.10)" }}>
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-foreground/70">Kassabon</p>
            <p className="text-[11px] font-display font-bold uppercase tracking-[-0.01em]">{m.label}</p>
          </div>
          <div className="flex-1 min-h-0 px-3.5 py-3 space-y-1.5">
            {recurring.length === 0 && <p className="text-xs italic text-muted-foreground">Geen terugkerende lasten.</p>}
            {recurring.map((e) => {
              const a = Number(e.expected_amount ?? e.amount) || 0;
              return (
                <div key={e.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: colorOf(e.portfolio_id) }} />
                    <span className="text-[12px] font-display font-medium truncate text-foreground/85">{e.title}</span>
                  </span>
                  <span className="text-[12px] font-mono tabular-nums text-foreground/80 shrink-0">{fmtEuro(a)}</span>
                </div>
              );
            })}
          </div>
          <div className="px-3.5 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "hsl(var(--foreground) / 0.10)", background: "hsl(var(--foreground) / 0.03)" }}>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Totaal</p>
            <p className="text-[15px] font-display font-bold tabular-nums">{fmtEuro(monthlyTotal)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}