import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";

const EASE = [0.16, 1, 0.3, 1];
const fmt = (n) => `€${Math.round(n).toLocaleString("en-US")}`;

// Vaste volgorde + kleuren per portefeuille.
const ORDER = ["wonen", "gezondheid", "communicatie", "dagelijks leven", "mobiliteit", "voorzorg"];
const NAME_COLOR = {
  wonen: "#d8dab3",
  gezondheid: "#301728",
  communicatie: "#595c64",
  "dagelijks leven": "#abab69",
  mobiliteit: "#8b8471",
  voorzorg: "#d0d9dd",
};
const LIGHT_COLORS = ["#d8dab3", "#d0d9dd", "#abab69"];
const textOn = (color) => (LIGHT_COLORS.includes(color) ? "#595c64" : "rgba(255,255,255,0.95)");

/**
 * WalletTreemapBar — live horizontale allocatie in afgeronde pills. Labels met
 * dunne verbindingslijnen staan BOVEN de bar; lijnen hebben variabele hoogtes
 * zodat de tekst volledig leesbaar blijft. Volle breedte = 100% inkomen; elke
 * pill = netto kosten per portefeuille (Dagelijks Leven = target); Voorzorg =
 * restant. Hover → pill strekt uit + expense-breakdown.
 */
export default function WalletTreemapBar() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { realtime: true });
  const { data: incomes } = useEntityList("Income", { realtime: true });
  const [hovered, setHovered] = useState(null);

  const { segments, total } = useMemo(() => {
    const pots = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    const find = (key) => pots.find((p) => p.name.toLowerCase().includes(key));
    const exps = expenses || [];
    const expenseCost = (p) =>
      exps.filter((e) => e.portfolio_id === p.id && e.status !== "done").reduce((s, e) => s + (e.expected_amount ?? e.amount ?? 0), 0);
    const itemsFor = (p) =>
      exps
        .filter((e) => e.portfolio_id === p.id && e.status !== "done")
        .map((e) => ({ title: e.title, amount: e.expected_amount ?? e.amount ?? 0 }))
        .filter((e) => e.amount > 0)
        .sort((a, b) => b.amount - a.amount);

    const totalIncome = (incomes || []).reduce((s, i) => s + (i.amount || 0), 0);
    const segs = [];
    let spent = 0;

    for (const key of ORDER) {
      if (key === "voorzorg") continue;
      const p = find(key);
      if (!p) continue;
      let cost, items;
      if (key === "dagelijks leven") {
        cost = p.target_balance || 0;
        items = [{ title: "Budget", amount: cost }];
      } else {
        cost = expenseCost(p);
        items = itemsFor(p);
      }
      if (cost <= 0) continue;
      segs.push({ id: p.id, name: p.name, color: NAME_COLOR[key], cost, items });
      spent += cost;
    }

    const voorzorg = find("voorzorg");
    const leftover = Math.max(0, totalIncome - spent);
    if (voorzorg && leftover > 0) {
      segs.push({ id: voorzorg.id, name: voorzorg.name, color: NAME_COLOR["voorzorg"], cost: leftover, items: [{ title: "Sparen", amount: leftover }] });
    }

    return { segments: segs, total: totalIncome > 0 ? totalIncome : spent + leftover };
  }, [portfolios, expenses, incomes]);

  return (
    <div className="w-full h-full rounded-[18px] glass-2 flex flex-col px-4 py-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Income allocation</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">{total > 0 ? `${fmt(total)} / mnd` : "—"}</p>
      </div>

      {/* LABELS + DUNNE LIJNEN boven de bar — variabele lijnhoogtes */}
      <div className="flex-1 min-h-0 flex items-end gap-[3px] mt-1">
        {segments.map((s, i) => {
          const w = hovered ? (hovered === s.id ? 100 : 0) : total > 0 ? (s.cost / total) * 100 : 0;
          if (w <= 0) return <div key={s.id} style={{ width: 0 }} />;
          const lineH = [10, 26, 16, 30, 20, 12][i % 6];
          return (
            <div key={s.id} className="relative flex flex-col items-center justify-end min-w-0" style={{ width: `${w}%` }}>
              <p className="text-[11px] font-mono font-semibold leading-tight whitespace-nowrap" style={{ color: s.color }}>{s.name.split(" ")[0]}</p>
              <p className="text-[11px] font-mono text-foreground/55 leading-tight whitespace-nowrap">{Math.round((s.cost / total) * 100)}%</p>
              <div className="w-px mt-[3px]" style={{ height: `${lineH}px`, background: s.color }} />
            </div>
          );
        })}
      </div>

      {/* PILLS — afgerond, onderaan, strakke spacing */}
      <div className="flex items-stretch w-full h-[clamp(22px,2.6vw,34px)] gap-[3px]">
        {segments.length === 0 && <p className="text-[10px] text-foreground/40 self-center">{total > 0 ? "" : "No income recorded."}</p>}
        {segments.map((s) => {
          const w = hovered ? (hovered === s.id ? 100 : 0) : total > 0 ? (s.cost / total) * 100 : 0;
          return (
            <motion.div
              key={s.id}
              className="relative h-full overflow-hidden rounded-full"
              style={{ background: s.color }}
              animate={{ width: `${w}%` }}
              transition={{ duration: 0.4, ease: EASE }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {w > 18 && !hovered && (
                <span className="absolute inset-0 flex items-center px-2 text-[8px] font-mono whitespace-nowrap" style={{ color: textOn(s.color) }}>
                  {Math.round((s.cost / total) * 100)}%
                </span>
              )}
              <AnimatePresence>
                {hovered === s.id && (
                  <motion.div
                    key="breakdown"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-stretch"
                  >
                    {s.items.map((it, idx) => {
                      const segPct = s.cost > 0 ? (it.amount / s.cost) * 100 : 0;
                      return (
                        <div
                          key={idx}
                          className="h-full flex items-center justify-center min-w-0"
                          style={{ width: `${segPct}%`, background: s.color, borderLeft: idx > 0 ? "1px solid rgba(255,255,255,0.28)" : "none" }}
                        >
                          {segPct > 8 && (
                            <span className="text-[8px] font-mono truncate px-1 whitespace-nowrap" style={{ color: textOn(s.color) }}>
                              {it.title} {Math.round(segPct)}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}