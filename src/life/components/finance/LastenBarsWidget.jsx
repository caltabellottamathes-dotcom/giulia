import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const RIDGE = "#b1bec6";
const DAY = 86400000;
const effDate = (o) => o?.next_payment_date || o?.due_date;
const daysUntil = (o) => { const d = effDate(o); return d ? Math.round((new Date(d).getTime() - Date.now()) / DAY) : null; };
const amt = (o) => Number(o?.expected_amount ?? o?.amount) || 0;
function pressure(diff) {
  if (diff == null) return { label: "YOU'RE FINE!", color: OLIVE };
  if (diff < 0) return { label: "MISSED.", color: PISTACHIO };
  const d = Math.floor(diff / DAY);
  if (d >= 15) return { label: "YOU'RE FINE!", color: OLIVE };
  if (d >= 7) return { label: "YOU'VE GOT TIME.", color: OLIVE };
  if (d >= 3) return { label: "KEEP AN EYE.", color: RIDGE };
  if (d >= 1) return { label: "DEAL WITH IT!", color: RIDGE };
  return { label: "NOW, PLEASE!", color: PISTACHIO };
}

/** LastenBarsWidget — vaste lasten als horizontale afgeronde balken in wallet-kleur
 *  (links). Tik een balk → rechts de ThingsHandle GlassCard-inhoud (WHEN TO HANDLE?
 *  + status + titel + bedrag + Betaal). Na betaling schuift de balk naar rechts
 *  (uitgevoerd) en de PhotoCard-inhoud verandert naar de kassabon. */
export default function LastenBarsWidget({ expenses, portfolios, onReload }) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [paidBarId, setPaidBarId] = useState(null);
  const [receiptFor, setReceiptFor] = useState(null);
  const [busy, setBusy] = useState(false);

  const pots = useMemo(() => (portfolios || []).filter((p) => !p.archived), [portfolios]);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "hsl(var(--smoke))";
  const nameOf = (pid) => pots.find((p) => p.id === pid)?.name || "—";

  const bars = useMemo(() => {
    return (expenses || [])
      .filter((e) => (e.status || "open") !== "done" && e.frequency && e.frequency !== "once")
      .sort((a, b) => (daysUntil(a) ?? 9999) - (daysUntil(b) ?? 9999));
  }, [expenses]);

  const selected = bars.find((b) => b.id === selectedId) || bars[0] || null;
  const diff = selected ? new Date(effDate(selected)).getTime() - Date.now() : null;
  const status = pressure(diff);
  const receipt = receiptFor ? (expenses || []).find((e) => e.id === receiptFor) : null;

  const pay = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const a = amt(selected);
      await base44.entities.AdminObligation.update(selected.id, { status: "done", last_payment_date: new Date().toISOString().slice(0, 10), actual_amount: a });
      await base44.entities.Transaction.create({ portfolio_id: selected.portfolio_id, expense_id: selected.id, type: "expense", amount: a, status: "completed", date: new Date().toISOString().slice(0, 10), note: `Betaald · ${selected.title}` });
      setPaidBarId(selected.id);
      setReceiptFor(selected.id);
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
      onReload && onReload();
      toast({ title: "Betaald", description: `${selected.title} · ${fmtEuro(a)}` });
    } catch {
      toast({ title: "Betaling mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    const next = bars.find((b) => b.id !== paidBarId) || null;
    setReceiptFor(null);
    setPaidBarId(null);
    setSelectedId(next ? next.id : null);
  };

  return (
    <div className="relative w-full h-[340px] rounded-[28px] overflow-hidden" style={{ boxShadow: "-16px 16px 44px -16px rgba(0,0,0,0.40)" }}>
      {/* SHELL — photo + dark gradient + glass */}
      <img src={PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,22,26,0.82), rgba(20,22,26,0.50) 60%, rgba(20,22,26,0.72))" }} />
      <div className="absolute inset-0 rounded-[28px]" style={{ background: "rgba(120,128,133,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)" }} />

      {/* LINKS — vaste lasten als afgeronde balken in wallet-kleur */}
      <div className="absolute inset-y-0 left-0 w-[52%] flex flex-col p-4 z-10" style={{ color: IVORY }}>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold">Vaste lasten.</p>
          <span className="text-[9px] font-mono tabular-nums opacity-60">{bars.length}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2 justify-end">
          {bars.length === 0 && <p className="text-xs italic opacity-50">Geen openstaande vaste lasten.</p>}
          <AnimatePresence>
            {bars.map((b) => {
              const isPaid = paidBarId === b.id;
              const isSel = selected?.id === b.id && !receiptFor;
              if (isPaid) return null;
              return (
                <motion.button
                  key={b.id}
                  layout
                  onClick={() => { setSelectedId(b.id); setReceiptFor(null); }}
                  className="w-full rounded-full pl-3.5 pr-3 py-2 flex items-center justify-between gap-2 text-left"
                  style={{ background: colorOf(b.portfolio_id), color: "rgba(20,22,26,0.88)", boxShadow: "0 8px 20px -10px rgba(0,0,0,0.45)", outline: isSel ? "2px solid rgba(255,255,255,0.85)" : "none", outlineOffset: "1px" }}
                >
                  <span className="text-xs font-bold truncate">{b.title}</span>
                  <span className="text-xs font-mono tabular-nums font-bold shrink-0">{fmtEuro(amt(b))}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* RECHTS — PhotoCard met ThingsHandle GlassCard-inhoud; na betaling → kassabon */}
      <div className="absolute inset-y-0 right-0 w-[48%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        <img src={PHOTO} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(20,22,26,0.42), rgba(20,22,26,0.78))" }} />
        <AnimatePresence mode="wait">
          {!receipt ? (
            <motion.div key="handle" initial={{ x: 0, opacity: 1 }} exit={{ x: "-110%", opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-90">Things to Handle</p>
              <p className="text-[22px] font-black leading-[0.9] tracking-[-0.02em] mt-1">WHEN</p>
              <p className="text-[22px] font-black leading-[0.9] tracking-[-0.02em]">TO HANDLE?</p>
              <motion.p className="text-[22px] font-display font-black leading-[0.9] mt-1.5 tracking-[-0.03em]" style={{ color: status.color }}>{status.label}</motion.p>
              <div className="mt-auto">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">op komst</p>
                <p className="text-sm uppercase tracking-[0.1em] truncate font-semibold" style={{ color: PISTACHIO }}>{selected ? `${selected.title} · ${fmtEuro(amt(selected))}` : "—"}</p>
                {selected && <p className="text-[9px] uppercase tracking-[0.16em] opacity-50 mt-1">{nameOf(selected.portfolio_id)}{effDate(selected) ? ` · ${effDate(selected)}` : ""}</p>}
                <button onClick={pay} disabled={busy || !selected} className="mt-3 w-full rounded-full py-2.5 text-xs font-bold disabled:opacity-40 transition" style={{ background: PISTACHIO, color: "#2a2c30", boxShadow: "0 10px 24px -10px rgba(0,0,0,0.5)" }}>
                  {busy ? "…" : "Betaal nu"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="receipt" initial={{ x: "110%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" style={{ color: PISTACHIO }} />
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold">Kassabon</p>
              </div>
              <div className="mt-3 border-t border-white/20 pt-3">
                <p className="text-sm font-display font-bold leading-tight">{receipt.title}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] opacity-60 mt-1">{nameOf(receipt.portfolio_id)}</p>
              </div>
              <div className="mt-auto space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="opacity-60">Bedrag</span><span className="font-mono tabular-nums font-bold">{fmtEuro(amt(receipt))}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Datum</span><span className="font-mono tabular-nums">{new Date().toISOString().slice(0, 10)}</span></div>
                <div className="flex justify-between items-center pt-2 border-t border-white/20">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: PISTACHIO }}>Betaald</span>
                  <Check className="w-4 h-4" style={{ color: PISTACHIO }} />
                </div>
                <button onClick={back} className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <ArrowLeft className="w-3.5 h-3.5" /> terug naar lasten
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}