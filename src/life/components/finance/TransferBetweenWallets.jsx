import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeftRight, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

// Whipped Pistachio achtergrond + donkere inkt. Links 3 grote BounceDots,
// rechts alle invulelementen als zwevende glas-morphism pillen.
const PISTACHIO = "#d8dab3";
const INK = "#2a2c30";
const MUTED = "rgba(40,42,46,0.62)";
const GLASS = { background: "rgba(40,42,46,0.08)", backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.55)", boxShadow: "0 10px 26px -12px rgba(40,42,46,0.32), inset 0 1px 0 rgba(255,255,255,0.5)", color: INK };
const POPOVER = { background: "rgba(40,42,46,0.10)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 24px 56px -18px rgba(40,42,46,0.40), inset 0 1px 0 rgba(255,255,255,0.55)" };

function WalletDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value) || null;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 w-full rounded-2xl px-3 py-2.5 text-sm font-medium transition" style={GLASS}>
        {selected ? (
          <>
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: selected.color || "#8b8471" }} />
            <span className="truncate flex-1 text-left" style={{ color: INK }}>{selected.name}</span>
            <span className="text-[10px] font-mono tabular-nums shrink-0" style={{ color: MUTED }}>{fmtEuro(selected.current_balance || 0)}</span>
          </>
        ) : (
          <span className="flex-1 text-left" style={{ color: MUTED }}>{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} style={{ color: MUTED }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-1.5 right-0 w-full min-w-[220px] rounded-2xl p-1.5 max-h-72 overflow-y-auto no-scrollbar"
            style={POPOVER}
          >
            {options.length === 0 && <p className="px-2.5 py-2 text-sm" style={{ color: MUTED }}>Geen wallets</p>}
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  onClick={() => { onChange(o.id); setOpen(false); }}
                  className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-1.5 text-sm text-left transition ${active ? "bg-black/10" : "hover:bg-black/6"}`}
                  style={{ color: INK }}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: o.color || "#8b8471" }} />
                  <span className="truncate flex-1 font-medium">{o.name}</span>
                  <span className="text-[11px] font-mono tabular-nums" style={{ color: MUTED }}>{fmtEuro(o.current_balance || 0)}</span>
                  {active && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: MUTED }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** TransferBetweenWallets — makeover: links 3 grote BounceDots, rechts alle
 *  invulelementen (Van → bedrag → Naar → Transfer). Whipped Pistachio, zwevende
 *  glas-morphism pillen. Boekt een transfer-Transaction + verschuift saldo's. */
export default function TransferBetweenWallets() {
  const { data: portfolios } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { toast } = useToast();
  const active = useMemo(() => (portfolios || []).filter((p) => !p.archived && p.active !== false), [portfolios]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const from = active.find((p) => p.id === fromId);
  const to = active.find((p) => p.id === toId);
  const canTransfer = !!from && !!to && from.id !== to.id && Number(amount) > 0;

  const transfer = async () => {
    if (!canTransfer) return;
    const amt = Number(amount);
    setBusy(true);
    try {
      await base44.entities.Transaction.create({ portfolio_id: to.id, type: "transfer", amount: amt, status: "completed", date: new Date().toISOString().slice(0, 10), note: `Transfer van ${from.name}` });
      await base44.entities.Portfolio.update(from.id, { current_balance: (Number(from.current_balance) || 0) - amt });
      await base44.entities.Portfolio.update(to.id, { current_balance: (Number(to.current_balance) || 0) + amt });
      toast({ title: "Transfer voltooid", description: `${fmtEuro(amt)} van ${from.name} naar ${to.name}` });
      setAmount("");
    } catch {
      toast({ title: "Transfer mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full rounded-[20px] p-5 flex items-center gap-5 sm:gap-7" style={{ background: PISTACHIO, boxShadow: "-16px 16px 44px -16px rgba(0,0,0,0.32)", color: INK }}>
      {/* LINKS — 3 grote BounceDots naast elkaar */}
      <div className="flex items-center gap-4 shrink-0">
        {[0, 0.18, 0.36].map((d, i) => (
          <span key={i} className="ontwerp-dot-bounce block rounded-full" style={{ width: 34, height: 34, background: INK, animationDelay: `${d}s`, boxShadow: "0 8px 18px -6px rgba(40,42,46,0.45)" }} />
        ))}
      </div>

      {/* divider */}
      <div className="h-16 w-px shrink-0 hidden sm:block" style={{ background: "rgba(40,42,46,0.18)" }} />

      {/* RECHTS — alle invulelementen */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          <div className="flex-1 min-w-[150px]"><WalletDropdown value={fromId} onChange={setFromId} options={active} placeholder="Van wallet…" /></div>
          <ArrowRight className="w-4 h-4 shrink-0 mx-0.5" style={{ color: canTransfer ? INK : MUTED }} />
          <div className="flex-1 min-w-[150px]"><WalletDropdown value={toId} onChange={setToId} options={active} placeholder="Naar wallet…" /></div>
          <div className="flex items-center rounded-2xl pl-3 pr-2 py-2.5 shrink-0" style={GLASS}>
            <span className="text-[11px] uppercase tracking-[0.16em] font-bold mr-1.5" style={{ color: MUTED }}>€</span>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-20 bg-transparent text-base font-display font-bold outline-none tabular-nums" style={{ color: INK }} />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={transfer} disabled={busy || !canTransfer} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold disabled:opacity-40 transition" style={{ background: INK, color: PISTACHIO, boxShadow: "0 12px 28px -12px rgba(40,42,46,0.45)" }}>
            <ArrowLeftRight className="w-4 h-4" />{busy ? "Bezig…" : "Transfer uitvoeren"}
          </button>
        </div>
      </div>
    </div>
  );
}