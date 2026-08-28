import React, { useMemo, useState } from "react";
import { ArrowRight, ArrowLeftRight, ChevronDown } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

/** GlassSelect — frosted glass keuzemenu met afgeronde hoeken + custom chevron. */
function GlassSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full min-w-[150px] rounded-xl pl-3 pr-9 py-2 text-sm outline-none cursor-pointer font-medium"
        style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50" />
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
      <GlassSelect value={fromId} onChange={(e) => setFromId(e.target.value)}>
        <option value="">Van wallet…</option>
        {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </GlassSelect>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      <GlassSelect value={toId} onChange={(e) => setToId(e.target.value)}>
        <option value="">Naar wallet…</option>
        {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </GlassSelect>
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center rounded-xl pl-3 pr-1 py-1" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}>
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