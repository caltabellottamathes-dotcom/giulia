import React, { useEffect, useMemo, useState } from "react";
import { fmtEuro } from "@/lib/financeUtils";
import { base44 } from "@/api/base44Client";

const MONTHS_NL = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const COL_H = 240; // maximale kolomhoogte in px

/** MonthlyBarChartForecast — per áfgelopen maand een BarChart: alle uitgaven
 *  als individuele afgeronde vormen (pillen/cirkels) boven elkaar gestapeld.
 *  Geeft een totaalbeeld van hoe die maand er financieel uitzag. Donkere shell,
 *  verticale maandlabels. */
export default function MonthlyBarChartForecast({ portfolios, months = 6 }) {
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    let active = true;
    base44.entities.Transaction.list("-date", 300).then((t) => { if (active) setTxns(t || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const pots = (portfolios || []).filter((p) => !p.archived);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "#9b9684";

  const paid = useMemo(() => {
    return (txns || []).filter((t) => t.type === "expense" && (t.status || "completed") === "completed" && t.date).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [txns]);

  const byMonth = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${now.getMonth()}`;
    const map = {};
    for (const t of paid) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key > curKey) continue;
      if (!map[key]) map[key] = { key, label: `${MONTHS_NL[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, items: [], total: 0 };
      map[key].items.push({ id: t.id, title: String(t.note || "").replace(/^Betaald ·\s*/, ""), amount: Number(t.amount) || 0, color: colorOf(t.portfolio_id) });
      map[key].total += Number(t.amount) || 0;
    }
    const arr = Object.values(map).sort((a, b) => b.key.localeCompare(a.key)).slice(0, months);
    arr.forEach((m) => m.items.sort((a, b) => b.amount - a.amount));
    return arr;
  }, [paid, months]); // eslint-disable-line react-hooks/exhaustive-deps

  const globalMax = Math.max(1, ...byMonth.map((m) => m.total));

  if (!paid.length) return <p className="text-sm text-muted-foreground italic">Nog geen betaalde lasten — betaal een vaste last om de geschiedenis op te bouwen.</p>;

  return (
    <div className="rounded-[20px] p-5 overflow-x-auto no-scrollbar" style={{ background: "#111316", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.40)" }}>
      <div className="flex items-end gap-3 min-h-[300px]">
        {byMonth.map((m) => (
          <div key={m.key} className="flex-1 min-w-[96px] flex flex-col items-center h-full">
            <div className="flex-1 flex flex-col-reverse items-center justify-end gap-1.5" style={{ minHeight: COL_H }}>
              {m.items.map((it, i) => {
                const h = Math.max((it.amount / globalMax) * COL_H, 10);
                const small = it.amount < globalMax * 0.05;
                const outline = i % 2 === 1;
                if (small) {
                  return <span key={it.id} className="rounded-full" style={{ width: 16, height: 16, background: outline ? "transparent" : it.color, border: outline ? `1.5px solid ${it.color}` : "none" }} title={`${it.title} · ${fmtEuro(it.amount)}`} />;
                }
                return (
                  <div key={it.id} className="rounded-full" style={{ width: "64%", height: h, background: outline ? "transparent" : it.color, border: outline ? `1.5px solid ${it.color}` : "none", boxShadow: outline ? "none" : "0 8px 18px -8px rgba(0,0,0,0.5)" }} title={`${it.title} · ${fmtEuro(it.amount)}`} />
                );
              })}
            </div>
            <div className="mt-3 flex flex-col items-center gap-1">
              <p className="text-[11px] font-display font-bold text-white/85 tabular-nums">{fmtEuro(m.total)}</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/45 [writing-mode:vertical-rl] rotate-180">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}