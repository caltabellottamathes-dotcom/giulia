import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fmtEuro, calcPortfolio } from "@/lib/financeUtils";

const IVORY = "hsl(var(--ivory))";
const EASE = [0.16, 1, 0.3, 1];

/** WalletPhotoCard — dinner-widget-patroon maar per wallet.
 *  Shell: boven = saldo (+ voortgang naar doel), onder = vaste lasten die bij
 *  deze wallet horen. PhotoCard eroverheen: de nieuwe foto + wallet-naam;
 *  tik → schuift naar boven zodat de vaste-lastenlijst verschijnt. */
export default function WalletPhotoCard({ wallet, expenses, photoUrl }) {
  const [up, setUp] = useState(false);
  const potExpenses = useMemo(() => (expenses || []).filter((e) => e.portfolio_id === wallet.id), [expenses, wallet.id]);
  calcPortfolio(wallet, potExpenses); // health (niet weergegeven, wel berekend voor consistentie)
  const balance = Number(wallet.current_balance) || 0;
  const target = Number(wallet.target_balance) || Number(wallet.desired_buffer) || 0;
  const fill = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 100;
  const color = wallet.color || "hsl(var(--smoke))";

  return (
    <div className="relative w-full h-full rounded-[28px] overflow-hidden" style={{ color: IVORY }}>
      {/* glass shell */}
      <div className="absolute inset-0 rounded-[28px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-20" style={{ background: `linear-gradient(90deg, transparent, ${color} 18%, ${color} 82%, transparent)` }} />

      {/* BOVEN — saldo (zichtbaar wanneer foto beneden staat) */}
      <div className="absolute top-0 left-0 right-0 h-1/2 z-0 p-3 flex flex-col">
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-80">Saldo</p>
        <p className="text-[26px] leading-none font-display font-bold tabular-nums mt-1">{fmtEuro(balance)}</p>
        <div className="mt-auto w-full">
          <div className="flex items-end justify-between mb-1">
            <p className="text-[8px] uppercase tracking-[0.16em] opacity-65">Naar doel</p>
            <p className="text-[14px] leading-none font-display font-bold tabular-nums">{fill}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${fill}%`, background: color }} />
          </div>
          <p className="text-[8px] uppercase tracking-[0.14em] opacity-55 mt-1.5">Doel {fmtEuro(target)}</p>
        </div>
      </div>

      {/* ONDER — vaste lasten / transacties bij deze wallet */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 z-0 p-3 overflow-hidden flex flex-col">
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-80 shrink-0">Vaste lasten · {potExpenses.length}</p>
        <div className="mt-1.5 space-y-1 overflow-y-auto no-scrollbar flex-1 min-h-0">
          {potExpenses.length === 0 && <p className="text-[10px] opacity-60 italic">Geen vaste lasten gekoppeld.</p>}
          {potExpenses.slice(0, 6).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-2 py-1">
              <span className="text-[10px] font-medium truncate">{e.title}</span>
              <span className="text-[10px] font-display font-bold tabular-nums shrink-0">{fmtEuro(e.expected_amount ?? e.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PHOTO — schuift beneden ↔ boven */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-10"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ boxShadow: "0 -12px 30px -14px rgba(0,0,0,0.42), 0 12px 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <img src={photoUrl} alt={wallet.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute inset-0 p-3 flex flex-col" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
          <h3 className="text-[18px] leading-tight font-display font-bold tracking-[-0.02em] mt-auto">{wallet.name}</h3>
          <p className="text-[8px] uppercase tracking-[0.2em] mt-1 opacity-70">{up ? "tik → saldo" : "tik → laatste"}</p>
        </div>
      </motion.button>
    </div>
  );
}