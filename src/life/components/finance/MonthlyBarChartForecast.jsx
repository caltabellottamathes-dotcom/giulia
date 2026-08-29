import React, { useEffect, useMemo, useState } from "react";
import { fmtEuro } from "@/lib/financeUtils";
import { base44 } from "@/api/base44Client";

const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** MonthlyBarChartForecast — witte kaart, x-as = alle 12 maanden van het jaar.
 *  Per maand een dunne, hoge stapel van afgeronde vormen (één per uitgave),
 *  hoogte ∝ bedrag. Totaalbeeld van hoe elke maand er financieel uitzag. */
export default function MonthlyBarChartForecast({ portfolios }) {
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    let active = true;
    base44.entities.Transaction.list("-date", 400).then((t) => { if (active) setTxns(t || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const pots = (portfolios || []).filter((p) => !p.archived);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "#9c9c9c";

  const year = new Date().getFullYear();
  const columns = useMemo(() => {
    const paid = (txns || []).filter((t) => t.type === "expense" && (t.status || "completed") === "completed" && t.date);
    const cols = MONTHS.map((label, m) => ({ label, m, items: [], total: 0 }));
    for (const t of paid) {
      const d = new Date(t.date);
      if (d.getFullYear() !== year) continue;
      const col = cols[d.getMonth()];
      col.items.push(t);
      col.total += Number(t.amount) || 0;
    }
    return cols;
  }, [txns, year]);

  const maxTotal = Math.max(1, ...columns.map((c) => c.total));
  const hasData = columns.some((c) => c.total > 0);

  return (
    <div className="rounded-[20px] p-5" style={{ background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.18)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-foreground/60">Uitgaven · visueel per maand · {year}</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/40">{hasData ? "12 maanden" : "—"}</p>
      </div>
      <div className="flex items-end justify-between gap-1 h-[240px] border-b border-foreground/10">
        {!hasData && <p className="text-sm text-foreground/40 italic w-full text-center self-center">Nog geen geschiedenis dit jaar.</p>}
        {columns.map((c) => {
          const colH = (c.total / maxTotal) * 100;
          return (
            <div key={c.m} className="flex-1 h-full flex flex-col justify-end items-center min-w-0">
              <div className="w-full flex flex-col justify-end items-center gap-[2px] px-[2px]" style={{ height: `${colH}%` }}>
                {c.items.map((t) => {
                  const a = Number(t.amount) || 0;
                  return (
                    <div key={t.id} style={{ flexGrow: a, flexBasis: 0 }} className="w-full flex justify-center">
                      <div className="w-full rounded-full" style={{ height: "100%", minHeight: 2, background: colorOf(t.portfolio_id) }} title={`${t.note || "uitgave"} · ${fmtEuro(a)}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-start justify-between gap-1 mt-2">
        {columns.map((c) => (
          <div key={c.m} className="flex-1 text-center min-w-0">
            <p className="text-[8px] uppercase tracking-[0.1em] font-semibold text-foreground/45 truncate">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}