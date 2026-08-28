import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { calcPortfolio, fmtEuro } from "@/lib/financeUtils";
import HealthBadge from "./HealthBadge";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/f02aea791_Man_moving_in_motion_2K_202608281636.jpeg";
const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const EASE = [0.16, 1, 0.3, 1];

/** WalletsBuildingWidget — volledige breedte. Linkerkant: de 6 wallets onder
 *  elkaar met hun eigen kleur + saldo-bar. Rechts een PhotoCard met de nieuwe
 *  foto; tik een wallet → de foto schuift links weg en toont de wallet-inhoud.
 *  Glas = zelfde kleur als de PortfolioCards beneden (white/55). */
export default function WalletsBuildingWidget() {
  const { data: portfolios, loading } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { limit: 500, realtime: true });
  const [selectedId, setSelectedId] = useState(null);

  const active = useMemo(() => (portfolios || []).filter((p) => !p.archived && p.active !== false).slice(0, 6), [portfolios]);
  const selected = (portfolios || []).find((p) => p.id === selectedId) || null;
  const selCalc = selected ? calcPortfolio(selected, (expenses || []).filter((e) => e.portfolio_id === selected.id)) : null;

  const fillOf = (p) => {
    const target = p.target_balance || p.desired_buffer || 0;
    return target > 0 ? Math.min(100, Math.round(((p.current_balance || 0) / target) * 100)) : 100;
  };

  return (
    <div className="relative w-full h-[380px] rounded-[28px] overflow-hidden" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px) saturate(1.2)", WebkitBackdropFilter: "blur(12px) saturate(1.2)", border: "1px solid rgba(255,255,255,0.60)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      {/* content links */}
      <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: INK }}>What I'm Building.</p>
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
                    <span className="text-[13px] font-display font-semibold uppercase leading-tight truncate transition-transform group-hover:translate-x-0.5" style={{ color: sel ? color : INK }}>{p.name}</span>
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
        {/* detail panel achter (zelfde glas als de kaarten) */}
        <AnimatePresence>
          {selected && selCalc && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="absolute inset-0 flex flex-col p-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px) saturate(1.2)", WebkitBackdropFilter: "blur(12px) saturate(1.2)", border: "1px solid rgba(255,255,255,0.60)" }}>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: selected.color || INK }}><ArrowLeft className="h-3 w-3" /> dicht</button>
                <HealthBadge status={selCalc.status} />
              </div>
              <p className="text-[14px] font-display font-bold leading-tight truncate mb-0.5" style={{ color: INK }}>{selected.name}</p>
              <p className="text-[9px] uppercase tracking-[0.16em] mb-3" style={{ color: MUTED }}>{selected.category || "Wallet"}</p>
              <div className="space-y-2.5 text-[11px]" style={{ color: INK }}>
                <div className="flex items-center justify-between"><span style={{ color: MUTED }}>Saldo</span><span className="font-display font-bold tabular-nums" style={{ color: selected.color || INK }}>{fmtEuro(selected.current_balance || 0)}</span></div>
                <div className="flex items-center justify-between"><span style={{ color: MUTED }}>Doel</span><span className="font-display font-semibold tabular-nums">{fmtEuro(selected.target_balance || selected.desired_buffer || 0)}</span></div>
                <div className="flex items-center justify-between"><span style={{ color: MUTED }}>Reservering / mnd</span><span className="font-display font-semibold tabular-nums">{fmtEuro(Number(selected.monthly_reservation_actual) || selCalc.recommended_monthly)}</span></div>
                <div className="flex items-center justify-between"><span style={{ color: MUTED }}>Volgende betaling</span><span className="font-display font-semibold tabular-nums">{fmtEuro(selCalc.next_expected_payment)}</span></div>
                {selCalc.next_payment_date && <p className="text-[10px]" style={{ color: MUTED }}>op {new Date(selCalc.next_payment_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>}
              </div>
              <div className="mt-auto pt-3">
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${fillOf(selected)}%`, background: selected.color || INK }} />
                </div>
                <p className="text-[9px] uppercase tracking-[0.16em] mt-1.5" style={{ color: MUTED }}>{fillOf(selected)}% van doel</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* foto laag boven — schuift links weg */}
        <motion.div className="absolute inset-0" animate={{ x: selectedId ? "-102%" : "0%" }} transition={{ duration: 0.55, ease: EASE }}>
          <img src={PHOTO} alt="Wallets" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 inset-x-0 p-3" style={{ color: "white", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-85">What I'm Building.</p>
            <p className="text-[9px] uppercase tracking-[0.14em] mt-0.5 opacity-70">{active.length} wallets · tik er één</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}