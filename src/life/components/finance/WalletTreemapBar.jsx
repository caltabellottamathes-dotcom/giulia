import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";

const FALLBACK = ["#d0d9dd", "#595c64", "#abab69", "#8b8471", "#301728", "#d8dab3"];
const EASE = [0.16, 1, 0.3, 1];
const fmt = (n) => `€${Math.round(n).toLocaleString("en-US")}`;

/**
 * WalletTreemapBar — live horizontale treemap (glas-2). Volle breedte = 100%
 * van je netto lasten. Bars raken elkaar (geen witruimte); elk segment = exacte
 * netto kosten van één portefeuille, kleur = portefeuille-kleur. Dunne lijnen
 * naar beneden met naam + percentage. Hover → bar strekt uit tot volledige
 * breedte en onderverdeelt zich in de exacte expenses met hun percentage.
 */
export default function WalletTreemapBar() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { realtime: true });
  const [hovered, setHovered] = useState(null);

  const segments = useMemo(() => {
    const list = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    return list
      .map((p, i) => {
        const exps = (expenses || []).filter((e) => e.portfolio_id === p.id && e.status !== "done");
        const cost = exps.reduce((s, e) => s + (e.expected_amount ?? e.amount ?? 0), 0);
        const items = exps
          .map((e) => ({ title: e.title, amount: e.expected_amount ?? e.amount ?? 0 }))
          .filter((e) => e.amount > 0)
          .sort((a, b) => b.amount - a.amount);
        return {
          id: p.id,
          name: p.name,
          color: p.color || FALLBACK[i % FALLBACK.length],
          cost,
          items,
        };
      })
      .filter((s) => s.cost > 0)
      .sort((a, b) => b.cost - a.cost);
  }, [portfolios, expenses]);

  const total = segments.reduce((s, x) => s + x.cost, 0);

  return (
    <div className="w-full h-full rounded-[18px] glass-2 flex flex-col px-4 py-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Income allocation</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">{total > 0 ? `${fmt(total)} / mnd` : "—"}</p>
      </div>

      {/* BARS — raken elkaar, volledige breedte */}
      <div className="flex items-stretch w-full h-[clamp(20px,2.4vw,32px)] mt-3">
        {segments.length === 0 && <p className="text-[10px] text-foreground/40 self-center">{total > 0 ? "" : "No expenses linked yet."}</p>}
        {segments.map((s) => {
          const w = hovered ? (hovered === s.id ? 100 : 0) : total > 0 ? (s.cost / total) * 100 : 0;
          return (
            <motion.div
              key={s.id}
              className="relative h-full overflow-hidden"
              style={{ background: s.color }}
              animate={{ width: `${w}%` }}
              transition={{ duration: 0.4, ease: EASE }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
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
                            <span className="text-[8px] font-mono text-white/95 truncate px-1 whitespace-nowrap">
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

      {/* DUNNE LIJNEN + LABELS onder de bars */}
      <div className="flex w-full mt-1 min-h-[34px]">
        {segments.map((s) => {
          const w = hovered ? (hovered === s.id ? 100 : 0) : total > 0 ? (s.cost / total) * 100 : 0;
          if (w <= 0) return <div key={s.id} style={{ width: 0 }} />;
          return (
            <div key={s.id} className="relative flex flex-col items-center min-w-0" style={{ width: `${w}%` }}>
              <div className="w-px h-2 mx-auto" style={{ background: s.color }} />
              <p className="text-[8px] font-mono truncate w-full text-center" style={{ color: s.color }}>{s.name.split(" ")[0]}</p>
              <p className="text-[8px] font-mono text-foreground/45">{Math.round((s.cost / total) * 100)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}