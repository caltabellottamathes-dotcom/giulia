import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";

const FOAM = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/735fd2cb8_Fashion_photo_with_foam_blocks_202608290322.jpeg";
const IVORY = "rgba(255,255,255,0.92)";
const IVORY_DIM = "rgba(255,255,255,0.6)";
const PISTACHIO = "#d8dab3";
const MONTHS_NL = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const GLASS_CARD = { background: "rgba(255,255,255,0.14)", backdropFilter: "blur(18px) saturate(1.35)", WebkitBackdropFilter: "blur(18px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.22)", boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.4)" };

/** LastenHistoryWidget — kassabon-geschiedenis. Shell = foam-foto + donkere
 *  gradient + glas. Links alle maanden onder elkaar (label + totaal betaald).
 *  Tik op een maand → foto/rechts verschuift en toont de editorial kassabon
 *  (alle betaalde lasten van die maand + totaal). Data uit Transactions
 *  (type expense, completed). */
export default function LastenHistoryWidget({ portfolios, months = 8 }) {
  const [txns, setTxns] = useState([]);
  const [selKey, setSelKey] = useState(null);
  useEffect(() => { let active = true; base44.entities.Transaction.list("-date", 400).then((t) => { if (active) setTxns(t || []); }).catch(() => {}); return () => { active = false; }; }, []);

  const pots = (portfolios || []).filter((p) => !p.archived);
  const nameOf = (pid) => pots.find((p) => p.id === pid)?.name || "—";

  const byMonth = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${now.getMonth()}`;
    const map = {};
    for (const t of (txns || [])) {
      if (t.type !== "expense" || (t.status || "completed") !== "completed" || !t.date) continue;
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key > curKey) continue;
      if (!map[key]) map[key] = { key, label: `${MONTHS_NL[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, items: [], total: 0 };
      map[key].items.push(t);
      map[key].total += Number(t.amount) || 0;
    }
    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key)).slice(0, months);
  }, [txns, months]);

  const selected = byMonth.find((m) => m.key === selKey) || byMonth[0] || null;

  if (!byMonth.length) return <p className="text-sm text-muted-foreground italic">Nog geen betaalde lasten — betaal een vaste last om de geschiedenis op te bouwen.</p>;

  return (
    <div className="relative w-full h-[340px] rounded-[24px] overflow-hidden" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.40)" }}>
      <img src={FOAM} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,22,26,0.58), rgba(20,22,26,0.34) 55%, rgba(20,22,26,0.64))" }} />
      <div className="absolute inset-0 rounded-[24px]" style={{ background: "rgba(120,128,133,0.10)", border: "1px solid rgba(255,255,255,0.16)" }} />

      {/* LINKS — maanden onder elkaar */}
      <div className="absolute inset-y-0 left-0 w-[44%] flex flex-col p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: IVORY }}>Kassabon geschiedenis.</p>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: IVORY_DIM }}>{byMonth.length} mnd</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1.5 justify-end">
          {byMonth.map((m) => {
            const isSel = selected?.key === m.key;
            return (
              <button key={m.key} onClick={() => setSelKey(m.key)} className="relative w-full rounded-full pl-3 pr-3 py-1.5 flex items-center justify-between gap-2 text-left transition" style={{ background: isSel ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.10)", border: `1px solid ${isSel ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)"}` }}>
                <span className="text-[12px] font-display font-semibold uppercase tracking-[-0.01em]" style={{ color: IVORY }}>{m.label}</span>
                <span className="text-[12px] font-mono tabular-nums font-semibold shrink-0" style={{ color: IVORY }}>{fmtEuro(m.total)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RECHTS — glas-kaart met editorial kassabon van geselecteerde maand */}
      <div className="absolute inset-y-0 right-0 w-[54%] rounded-[20px] overflow-hidden z-20" style={GLASS_CARD}>
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div key={selected.key} initial={{ opacity: 0, x: "30%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "-30%" }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY }}>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" style={{ color: PISTACHIO }} />
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold">Kassabon · {selected.label}</p>
              </div>
              <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
                {selected.items.length === 0 && <p className="text-xs italic" style={{ color: IVORY_DIM }}>Niets betaald deze maand.</p>}
                {selected.items.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    <div className="min-w-0">
                      <p className="text-sm font-display font-semibold truncate">{t.note ? t.note.replace(/^Betaald ·\s*/, "") : "uitgave"}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: IVORY_DIM }}>{nameOf(t.portfolio_id)} · {String(t.date).slice(0, 10)}</p>
                    </div>
                    <span className="text-sm font-mono tabular-nums font-bold shrink-0">{fmtEuro(Number(t.amount) || 0)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-1 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: PISTACHIO }}>Totaal betaald</p>
                <p className="text-lg font-display font-bold tabular-nums">{fmtEuro(selected.total)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}