import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fmtEuro, calcPortfolio } from "@/lib/financeUtils";

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const EASE = [0.16, 1, 0.3, 1];

/** WalletPhotoCard — dinner-widget-patroon maar per wallet.
 *  Shell: lichte kaartkleur, donkere tekst, slagschaduw naar links. Boven = saldo,
 *  onder = vaste lasten. PhotoCard eroverheen: foto + wallet-naam; tik → schuift
 *  naar boven. Klik op de shell (saldo / vaste lasten) → opent de wallet-stage
 *  met alle info + editor. */
export default function WalletPhotoCard({ wallet, expenses, photoUrl }) {
  const [up, setUp] = useState(false);
  const potExpenses = useMemo(() => (expenses || []).filter((e) => e.portfolio_id === wallet.id), [expenses, wallet.id]);
  calcPortfolio(wallet, potExpenses);
  const balance = Number(wallet.current_balance) || 0;
  const openExp = potExpenses.filter((e) => e.status !== "done");
  const goal1 = openExp.reduce((s, e) => s + (Number(e.expected_amount ?? e.amount) || 0), 0) || Number(wallet.target_balance) || 0;
  const buffer = Number(wallet.desired_buffer) || 0;
  const fill1 = goal1 > 0 ? Math.min(100, Math.round((balance / goal1) * 100)) : 100;
  const bufferProg = goal1 > 0 ? Math.min(100, Math.round((Math.max(0, balance - goal1) / Math.max(1, buffer)) * 100)) : (buffer > 0 ? Math.min(100, Math.round((balance / buffer) * 100)) : 100);
  const color = wallet.color || "hsl(var(--smoke))";

  const openWallet = () => window.dispatchEvent(new CustomEvent("giulia:open-wallet", { detail: wallet.id }));

  return (
    <div className="relative w-full h-full rounded-[28px] overflow-hidden" style={{ background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)", color: INK }}>
      {/* BOVEN — saldo (klik → open wallet-stage) */}
      <button type="button" onClick={openWallet} className="absolute top-0 left-0 right-0 h-1/2 z-0 p-3 flex flex-col text-left cursor-pointer hover:bg-foreground/[0.03] transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: MUTED }}>Saldo</p>
          <ArrowUpRight className="w-3.5 h-3.5" style={{ color: MUTED }} />
        </div>
        <p className="text-[26px] leading-none font-display font-bold tabular-nums mt-1">{fmtEuro(balance)}</p>
        <div className="mt-auto w-full space-y-2">
          <div>
            <div className="flex items-end justify-between mb-1">
              <p className="text-[8px] uppercase tracking-[0.16em] font-bold" style={{ color: MUTED }}>{goal1 > 0 ? "Doel 1 · Dekking" : "Doel 1 · geen lasten"}</p>
              <p className="text-[13px] leading-none font-display font-bold tabular-nums">{fill1}%</p>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${fill1}%`, background: color }} />
            </div>
            <p className="text-[8px] uppercase tracking-[0.14em] mt-1" style={{ color: MUTED }}>{goal1 > 0 ? `${fmtEuro(balance)} / ${fmtEuro(goal1)}` : "altijd dekking"}</p>
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <p className="text-[8px] uppercase tracking-[0.16em] font-bold" style={{ color: MUTED }}>Doel 2 · Buffer</p>
              <p className="text-[13px] leading-none font-display font-bold tabular-nums">{bufferProg}%</p>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${bufferProg}%`, background: color, opacity: 0.6 }} />
            </div>
            <p className="text-[8px] uppercase tracking-[0.14em] mt-1" style={{ color: MUTED }}>Buffer {fmtEuro(buffer)}</p>
          </div>
          {balance - goal1 > 0 && <p className="text-[8px] uppercase tracking-[0.14em] mt-2 font-bold" style={{ color }}>Spaar (gereserveerd) {fmtEuro(Math.round((balance - goal1) * 100) / 100)}</p>}
        </div>
      </button>

      {/* ONDER — vaste lasten (klik → open wallet-stage) */}
      <button type="button" onClick={openWallet} className="absolute bottom-0 left-0 right-0 h-1/2 z-0 p-3 overflow-hidden flex flex-col text-left cursor-pointer hover:bg-foreground/[0.03] transition-colors">
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold shrink-0" style={{ color: MUTED }}>Vaste lasten · {potExpenses.length}</p>
        <div className="mt-1.5 space-y-1 overflow-y-auto no-scrollbar flex-1 min-h-0">
          {potExpenses.length === 0 && <p className="text-[10px] italic" style={{ color: MUTED }}>Geen vaste lasten gekoppeld.</p>}
          {potExpenses.slice(0, 6).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-foreground/[0.04] px-2 py-1">
              <span className="text-[10px] font-medium truncate">{e.title}</span>
              <span className="text-[10px] font-display font-bold tabular-nums shrink-0">{fmtEuro(e.expected_amount ?? e.amount)}</span>
            </div>
          ))}
        </div>
      </button>

      {/* PHOTO — schuift beneden ↔ boven */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-10"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ background: color, boxShadow: "0 -12px 30px -14px rgba(0,0,0,0.42), 0 12px 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.36), rgba(255,255,255,0.08))" }} />
        <div className="absolute inset-0 p-3 flex flex-col text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
          <span className="h-2 w-2 rounded-full shrink-0 bg-white/75" />
          <h3 className="text-[18px] leading-tight font-display font-bold tracking-[-0.02em] mt-auto">{wallet.name}</h3>
          <p className="text-[8px] uppercase tracking-[0.2em] mt-1 opacity-80">{up ? "tik → saldo" : "tik → laatste"}</p>
        </div>
      </motion.button>
    </div>
  );
}