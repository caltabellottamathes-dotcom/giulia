import React, { useEffect, useMemo, useState } from "react";
import { fmtEuro } from "@/lib/financeUtils";
import { base44 } from "@/api/base44Client";

const MONTHS_NL = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** MonthlyReceiptForecast — geschiedenis: per áfgelopen maand de kassabon van
 *  echt gemaakte betalingen (Transactions type expense, completed). Van deze
 *  geschiedenis een forecast maken. */
export default function MonthlyReceiptForecast({ portfolios, months = 6 }) {
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    let active = true;
    base44.entities.Transaction.list("-date", 300).then((t) => { if (active) setTxns(t || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const pots = (portfolios || []).filter((p) => !p.archived);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "#94925d";

  const paid = useMemo(() => {
    return (txns || [])
      .filter((t) => t.type === "expense" && (t.status || "completed") === "completed" && t.date)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [txns]);

  const byMonth = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${now.getMonth()}`;
    const map = {};
    for (const t of paid) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key > curKey) continue; // alleen maanden die geweest zijn
      if (!map[key]) map[key] = { key, label: `${MONTHS_NL[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, items: [], total: 0 };
      map[key].items.push(t);
      map[key].total += Number(t.amount) || 0;
    }
    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key)).slice(0, months);
  }, [paid, months]);

  if (!paid.length) return <p className="text-sm text-muted-foreground italic">Nog geen betaalde lasten — betaal een vaste last om de geschiedenis op te bouwen.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {byMonth.map((m) => (
        <div key={m.key} className="rounded-[16px] graph-paper overflow-hidden flex flex-col" style={{ boxShadow: "-12px 12px 32px -16px rgba(0,0,0,0.28)" }}>
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b" style={{ borderColor: "hsl(var(--foreground) / 0.10)" }}>
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-foreground/70">Kassabon</p>
            <p className="text-[11px] font-display font-bold uppercase tracking-[-0.01em]">{m.label}</p>
          </div>
          <div className="flex-1 min-h-0 px-3.5 py-3 space-y-1.5">
            {m.items.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: colorOf(t.portfolio_id) }} />
                  <span className="text-[12px] font-display font-medium truncate text-foreground/85">{t.note ? t.note.replace(/^Betaald ·\s*/, "") : "uitgave"}</span>
                </span>
                <span className="text-[12px] font-mono tabular-nums text-foreground/80 shrink-0">{fmtEuro(Number(t.amount) || 0)}</span>
              </div>
            ))}
          </div>
          <div className="px-3.5 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "hsl(var(--foreground) / 0.10)", background: "hsl(var(--foreground) / 0.03)" }}>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Totaal</p>
            <p className="text-[15px] font-display font-bold tabular-nums">{fmtEuro(m.total)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}