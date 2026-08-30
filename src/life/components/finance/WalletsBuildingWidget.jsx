import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { calcPortfolio, fmtEuro } from "@/lib/financeUtils";
import HealthBadge from "./HealthBadge";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/097d5ac19_Make_editorial_fashion_photo_2K_202608281333.jpeg";
const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const EASE = [0.16, 1, 0.3, 1];

/** WalletsBuildingWidget — volledige breedte. Shell = zelfde lichte kleur als de
 *  Overview-shell (#f5f5f4). Linkerkant: de 6 wallets onder elkaar, namen
 *  consistent donker, kleurpunt + saldo-bar per wallet. Rechts een PhotoCard
 *  met overlay; tik een wallet → foto schuift links weg en rechts toont de
 *  wallet-inhoud grafisch op de wallet-kleur als achtergrond. */
export default function WalletsBuildingWidget() {
  const { data: portfolios, loading } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { limit: 500, realtime: true });
  const [selectedId, setSelectedId] = useState(null);

  const active = useMemo(() => (portfolios || []).filter((p) => !p.archived && p.active !== false).slice(0, 6), [portfolios]);
  const selected = (portfolios || []).find((p) => p.id === selectedId) || null;
  const selCalc = selected ? calcPortfolio(selected, (expenses || []).filter((e) => e.portfolio_id === selected.id)) : null;

  const fillOf = (p) => { const t = p.target_balance || 0; return t > 0 ? Math.min(100, Math.round(((p.current_balance || 0) / t) * 100)) : 100; };
  const fillDoel1 = (p) => { const t = p.target_balance || 0; return t > 0 ? Math.min(100, Math.round(((p.current_balance || 0) / t) * 100)) : 100; };
  const fillDoel2 = (p) => { const t = p.desired_buffer || 0; return t > 0 ? Math.min(100, Math.round(((p.current_balance || 0) / t) * 100)) : 0; };
  const overDoel1 = (p) => { const t = p.target_balance || 0; return t > 0 ? Math.max(0, Math.round(((p.current_balance || 0) - t) * 100) / 100) : 0; };
  const totalSum = active.reduce((s, p) => s + (Number(p.current_balance) || 0), 0);

  return (
    <div className="relative w-full h-[380px] rounded-[28px] overflow-hidden" style={{ background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      {/* content links */}
      <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: INK }}>Wallets.</p>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: MUTED }}>{active.length}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2.5 justify-end">
          {loading ? (
            <div className="flex items-center justify-center py-4"><div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" /></div>
          ) : active.length === 0 ? (
            <p className="text-[12px]" style={{ color: MUTED }}>Nog geen wallets.</p>
          ) : active.map((p, i) => {
            const fill = fillOf(p);
            const sel = selectedId === p.id;
            const color = p.color || "hsl(var(--smoke))";
            return (
              <button key={p.id} onClick={() => setSelectedId(sel ? null : p.id)} className="group w-full text-left rounded-lg px-1.5 -mx-1.5 py-1 transition-colors hover:bg-foreground/5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-[13px] font-display font-semibold uppercase leading-tight truncate transition-transform group-hover:translate-x-0.5" style={{ color: INK }}>{p.name}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold tabular-nums shrink-0" style={{ color }}>{fmtEuro(p.current_balance || 0)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${fill}%` }} transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.06 }} style={{ backgroundColor: color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* photo card rechts — schuift links weg bij selectie */}
      <div className="absolute inset-y-0 right-0 w-[42%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        {/* detail panel achter — wallet-kleur als achtergrond, grafisch */}
        <AnimatePresence>
          {selected && selCalc && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0" style={{ background: selected.color || "hsl(var(--smoke))" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.28), rgba(0,0,0,0.58))" }} />
              <div className="relative h-full flex flex-col p-4 text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-white/90"><ArrowLeft className="h-3 w-3" /> dicht</button>
                  <HealthBadge status={selCalc.status} />
                </div>

                <h3 className="text-[16px] font-display font-bold leading-tight truncate mt-2">{selected.name}</h3>

                {/* groot saldo */}
                <div className="mt-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">Saldo</p>
                  <p className="text-[30px] leading-none font-display font-bold tabular-nums">{fmtEuro(selected.current_balance || 0)}</p>
                </div>

                {/* grafische voortgang naar Doel 1 + Doel 2 */}
                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="flex items-end justify-between mb-1">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-white/70">{(selected.target_balance || 0) > 0 ? "Doel 1 · dekking" : "Doel 1 · geen lasten"}</p>
                      <p className="text-[14px] leading-none font-display font-bold tabular-nums">{fillDoel1(selected)}<span className="text-[10px]">%</span></p>
                    </div>
                    <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-white" initial={{ width: "0%" }} animate={{ width: `${fillDoel1(selected)}%` }} transition={{ duration: 0.7, ease: EASE }} />
                    </div>
                  </div>
                  {(selected.desired_buffer || 0) > 0 && (
                    <div>
                      <div className="flex items-end justify-between mb-1">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-white/70">Doel 2 · buffer</p>
                        <p className="text-[14px] leading-none font-display font-bold tabular-nums">{fillDoel2(selected)}<span className="text-[10px]">%</span></p>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: "hsl(var(--giulia-urgent))" }} initial={{ width: "0%" }} animate={{ width: `${fillDoel2(selected)}%` }} transition={{ duration: 0.7, ease: EASE }} />
                      </div>
                    </div>
                  )}
                </div>
                {overDoel1(selected) > 0 && <p className="text-[9px] uppercase tracking-[0.14em] text-white/70 mt-1.5">+ {fmtEuro(overDoel1(selected))} boven Doel 1 · vooruit gespaard</p>}

                {/* stat chips */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  <div className="rounded-lg bg-white/15 px-2 py-1.5">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Doel 1</p>
                    <p className="text-[12px] font-display font-bold tabular-nums leading-none mt-0.5">{(selected.target_balance || 0) > 0 ? fmtEuro(selected.target_balance || 0) : "geen lasten"}</p>
                  </div>
                  <div className="rounded-lg bg-white/15 px-2 py-1.5">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Doel 2 · buffer</p>
                    <p className="text-[12px] font-display font-bold tabular-nums leading-none mt-0.5">{fmtEuro(selected.desired_buffer || 0)}</p>
                  </div>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-white/80">
                  <span className="uppercase tracking-[0.14em]">Volgende betaling</span>
                  <span className="font-display font-bold tabular-nums">{fmtEuro(selCalc.next_expected_payment)}</span>
                </div>
                {selCalc.next_payment_date && <p className="text-[9px] text-white/60 mt-0.5">op {new Date(selCalc.next_payment_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* foto laag boven — schuift links weg */}
        <motion.div className="absolute inset-0" animate={{ x: selectedId ? "-102%" : "0%" }} transition={{ duration: 0.55, ease: EASE }}>
          <img src={PHOTO} alt="Wallets" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.68), rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.30))" }} />
          <div className="absolute bottom-0 inset-x-0 p-3 text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-90">Wallets.</p>
            <p className="text-[26px] leading-none font-display font-bold tabular-nums mt-1">{fmtEuro(totalSum)}</p>
            <p className="text-[9px] uppercase tracking-[0.14em] mt-1 opacity-70">{active.length} wallets · tik er één</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}