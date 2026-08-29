import React, { useEffect, useMemo, useState } from "react";
import { fmtEuro } from "@/lib/financeUtils";
import { base44 } from "@/api/base44Client";

const MONTHS_NL = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** MonthlyBarChartForecast — per áfgelopen maand een kolom van gestapelde
 *  afgeronde vormen (één per uitgave), hoogte ∝ bedrag. Geeft een totaalbeeld
 *  van hoe die maand er financieel uitzag. Zwarte achtergrond (ref. mockup). */
export default function MonthlyBarChartForecast({ portfolios, months = 6 }) {
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    let active = true;
    base44.entities.Transaction.list("-date", 300).then((t) => { if (active) setTxns(t || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const pots = (portfolios || []).filter((p) => !p.archived);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "#9c9c9c";

  const byMonth = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${now.getMonth()}`;
    const paid = (txns || [])
      .filter((t) => t.type === "expense" && (t.status || "completed") === "completed" && t.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const map = {};
    for (const t of paid) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key > curKey) continue;
      if (!map[key]) map[key] = { key, label: MONTHS_NL[d.getMonth()], items: [], total: 0 };
      map[key].items.push(t);
      map[key].total += Number(t.amount) || 0;
    }
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key)).slice(-months);
  }, [txns, months]);

  const maxTotal = Math.max(1, ...byMonth.map((m) => m.total));

  return (
    <div className="rounded-[20px] overflow-hidden p-5" style={{ background: "#111113", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.45)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/60">Uitgaven · visueel per maand</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{byMonth.length} maanden</p>
      </div>
      <div className="flex items-end justify-between gap-3 h-[230px]">
        {byMonth.length === 0 && <p className="text-sm text-white/40 italic w-full text-center self-center">Nog geen geschiedenis — betaal een vaste last om op te bouwen.</p>}
        {byMonth.map((m) => {
          const colH = (m.total / maxTotal) * 100;
          return (
            <div key={m.key} className="flex-1 h-full flex flex-col justify-end items-center gap-2 min-w-0">
              <div className="w-full flex flex-col justify-end items-center gap-[3px]" style={{ height: `${colH}%` }}>
                {m.items.map((t) => {
                  const a = Number(t.amount) || 0;
                  const label = t.note ? t.note.replace(/^Betaald ·\s*/, "") : "uitgave";
                  return (
                    <div key={t.id} style={{ flexGrow: a, flexBasis: 0 }} className="w-full flex justify-center">
                      <div className="w-[72%] rounded-full" style={{ height: "100%", minHeight: 3, background: colorOf(t.portfolio_id) }} title={`${label} · ${fmtEuro(a)}`} />
                    </div>
                  );
                })}
              </div>
              <div className="rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] font-bold" style={{ background: "#c9d4d9", color: "#111113" }}>{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}