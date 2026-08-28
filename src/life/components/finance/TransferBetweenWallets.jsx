import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeftRight, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const GLASS = { background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" };
const POPOVER = { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.95)", boxShadow: "0 24px 56px -18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.8)" };

/** WalletDropdown — custom OS-stijl glasmenu (geen native <select>). */
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
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 min-w-[160px] rounded-xl px-3 py-2 text-sm font-medium transition" style={GLASS}>
        {selected ? (
          <>
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: selected.color || "hsl(var(--smoke))" }} />
            <span className="truncate flex-1 text-left">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-1.5 left-0 w-full min-w-[200px] rounded-2xl p-1.5 max-h-72 overflow-y-auto no-scrollbar"
            style={POPOVER}
          >
            {options.length === 0 && <p className="px-2.5 py-2 text-sm text-muted-foreground">Geen wallets</p>}
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  onClick={() => { onChange(o.id); setOpen(false); }}
                  className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-1.5 text-sm text-left transition ${active ? "bg-foreground/8" : "hover:bg-foreground/6"}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: o.color || "hsl(var(--smoke))" }} />
                  <span className="truncate flex-1 font-medium">{o.name}</span>
                  <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{fmtEuro(o.current_balance || 0)}</span>
                  {active && <Check className="w-3.5 h-3.5 text-foreground/70 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** TransferBetweenWallets — lange strip-kaart om geld tussen wallets over te
 *  boeken. Van → Naar + bedrag; maakt een transfer-Transaction en verschuift
 *  de saldo's. */
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
    <div className="w-full rounded-[18px] bg-[#f5f5f4] p-4 flex flex-wrap items-center gap-3" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <div className="flex items-center gap-2 shrink-0 mr-2">
        <span className="h-9 w-9 rounded-full bg-foreground/8 flex items-center justify-center"><ArrowLeftRight className="w-4 h-4 text-foreground/60" /></span>
        <div className="leading-tight">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Transfer</p>
          <p className="text-sm font-display font-semibold">between wallets</p>
        </div>
      </div>
      <WalletDropdown value={fromId} onChange={setFromId} options={active} placeholder="Van wallet…" />
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      <WalletDropdown value={toId} onChange={setToId} options={active} placeholder="Naar wallet…" />
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center rounded-xl pl-3 pr-1 py-1" style={GLASS}>
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mr-1">€</span>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-24 bg-transparent py-1 text-sm outline-none tabular-nums" />
        </div>
        <button onClick={transfer} disabled={busy || !canTransfer} className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-40 transition">
          <ArrowRight className="w-4 h-4" />{busy ? "…" : "Transfer"}
        </button>
      </div>
    </div>
  );
}