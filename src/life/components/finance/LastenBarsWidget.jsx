import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowLeft, Check, Receipt } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { fmtEuro } from "@/lib/financeUtils";

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const OLIVE = "#94925d";
const PISTACHIO = "#d8dab3";
const DAY = 86400000;
const effDate = (o) => o?.next_payment_date || o?.due_date;
const daysUntil = (o) => { const d = effDate(o); return d ? Math.round((new Date(d).getTime() - Date.now()) / DAY) : null; };
const amt = (o) => Number(o?.expected_amount ?? o?.amount) || 0;
function pressure(diff) {
  if (diff == null) return { label: "YOU'RE FINE!", color: OLIVE };
  if (diff < 0) return { label: "MISSED.", color: OLIVE };
  const d = Math.floor(diff / DAY);
  if (d >= 15) return { label: "YOU'RE FINE!", color: OLIVE };
  if (d >= 7) return { label: "YOU'VE GOT TIME.", color: OLIVE };
  if (d >= 3) return { label: "KEEP AN EYE.", color: MUTED };
  if (d >= 1) return { label: "DEAL WITH IT!", color: MUTED };
  return { label: "NOW, PLEASE!", color: PISTACHIO };
}

/** LastenBarsWidget — vaste lasten als handgetekende pillen (niet gekleurd) op
 *  een lichte kaart. Tussen balk en rechterkaart stuitert een bouncedot
 *  horizontaal. Tik een balk → rechts de ThingsHandle-inhoud + Betaal; na
 *  betaling schuift de balk weg en verschijnt de kassabon (pijl-rechtsboven →
 *  volledig overzicht van alles wat deze maand betaald is). */
export default function LastenBarsWidget({ expenses, portfolios, onReload }) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [paidBarId, setPaidBarId] = useState(null);
  const [receiptFor, setReceiptFor] = useState(null);
  const [full, setFull] = useState(false);
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

  const paidThisMonth = useMemo(() => {
    const now = new Date();
    return (expenses || [])
      .filter((e) => e.status === "done" && e.last_payment_date)
      .filter((e) => { const d = new Date(e.last_payment_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .sort((a, b) => String(b.last_payment_date).localeCompare(String(a.last_payment_date)));
  }, [expenses]);
  const paidTotal = paidThisMonth.reduce((s, e) => s + amt(e), 0);

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
    setFull(false);
    setSelectedId(next ? next.id : null);
  };

  return (
    <div className="relative w-full h-[340px] rounded-[24px] graph-paper overflow-visible" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      {/* LINKS — vaste lasten als handgetekende pillen (niet gekleurd) */}
      <div className="absolute inset-y-0 left-0 w-[56%] flex flex-col p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: INK }}>Vaste lasten.</p>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: MUTED }}>{bars.length}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2.5 justify-end">
          {bars.length === 0 && <p className="text-xs italic" style={{ color: MUTED }}>Geen openstaande vaste lasten.</p>}
          <AnimatePresence>
            {bars.map((b, i) => {
              const isPaid = paidBarId === b.id;
              const isSel = selected?.id === b.id && !receiptFor;
              if (isPaid) return null;
              return (
                <motion.button
                  key={b.id}
                  layout
                  onClick={() => { setSelectedId(b.id); setReceiptFor(null); setFull(false); }}
                  initial={false}
                  animate={isPaid ? { x: "130%", opacity: 0 } : { x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full rounded-[16px] px-4 py-2.5 flex items-center justify-between gap-3 text-left transition"
                  style={{ border: `2px ${isSel ? "solid" : "dashed"} ${isSel ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.55)"}`, background: "transparent", boxShadow: isSel ? "-8px 8px 20px -10px rgba(0,0,0,0.28)" : "none" }}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: colorOf(b.portfolio_id) }} />
                    <span className="text-sm font-display font-semibold truncate" style={{ color: INK }}>{b.title}</span>
                  </span>
                  <span className="text-sm font-mono tabular-nums font-bold shrink-0" style={{ color: INK }}>{fmtEuro(amt(b))}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* BOUNCEDOT — horizontaal stuitend tussen balk en kaart */}
      <motion.div className="absolute top-1/2 -translate-y-1/2 z-20" style={{ left: "calc(56% - 10px)" }} animate={{ x: [-14, 14, -14] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}>
        <span className="block rounded-full ontwerp-dot-bounce" style={{ width: 20, height: 20, background: selected ? colorOf(selected.portfolio_id) : OLIVE, boxShadow: "0 0 10px rgba(0,0,0,0.3)" }} />
      </motion.div>

      {/* RECHTS — kaart met ThingsHandle-inhoud / kassabon (lichte kaart) */}
      <div className="absolute inset-y-0 right-0 w-[42%] rounded-[20px] overflow-hidden z-20" style={{ background: "rgba(255,255,255,0.62)", border: "1px solid hsl(var(--foreground) / 0.08)", boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.22)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
        {/* pijl rechtsboven → volledig overzicht (alles betaald deze maand) */}
        <button onClick={() => setFull((v) => !v)} className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full flex items-center justify-center transition hover:bg-foreground/5" style={{ border: "1px solid hsl(var(--foreground) / 0.12)" }} title="Volledig overzicht">
          <ArrowUpRight className="w-4 h-4" style={{ color: INK }} />
        </button>

        <AnimatePresence mode="wait">
          {full ? (
            <motion.div key="full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute inset-0 p-4 flex flex-col" style={{ color: INK }}>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" style={{ color: OLIVE }} />
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold">Kassabon · deze maand</p>
              </div>
              <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
                {paidThisMonth.length === 0 && <p className="text-xs italic" style={{ color: MUTED }}>Nog niets betaald deze maand.</p>}
                {paidThisMonth.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--foreground) / 0.08)" }}>
                    <div className="min-w-0">
                      <p className="text-sm font-display font-semibold truncate">{e.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: MUTED }}>{nameOf(e.portfolio_id)} · {e.last_payment_date}</p>
                    </div>
                    <span className="text-sm font-mono tabular-nums font-bold shrink-0">{fmtEuro(amt(e))}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-1 border-t flex items-center justify-between" style={{ borderColor: "hsl(var(--foreground) / 0.12)" }}>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: OLIVE }}>Totaal betaald</p>
                <p className="text-lg font-display font-bold tabular-nums">{fmtEuro(paidTotal)}</p>
              </div>
              <button onClick={() => setFull(false)} className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold" style={{ background: "hsl(var(--foreground) / 0.06)", border: "1px solid hsl(var(--foreground) / 0.1)" }}>
                <ArrowLeft className="w-3.5 h-3.5" /> terug
              </button>
            </motion.div>
          ) : !receipt ? (
            <motion.div key="handle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: "-40%" }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 p-4 flex flex-col" style={{ color: INK }}>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-70">Things to Handle</p>
              <p className="text-[20px] font-black leading-[0.9] tracking-[-0.02em] mt-1">WHEN</p>
              <p className="text-[20px] font-black leading-[0.9] tracking-[-0.02em]">TO HANDLE?</p>
              <motion.p className="text-[20px] font-display font-black leading-[0.9] mt-1.5 tracking-[-0.03em]" style={{ color: status.color }}>{status.label}</motion.p>
              <div className="mt-auto">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">op komst</p>
                <p className="text-sm uppercase tracking-[0.1em] truncate font-semibold" style={{ color: OLIVE }}>{selected ? `${selected.title} · ${fmtEuro(amt(selected))}` : "—"}</p>
                {selected && <p className="text-[9px] uppercase tracking-[0.16em] opacity-50 mt-1">{nameOf(selected.portfolio_id)}{effDate(selected) ? ` · ${effDate(selected)}` : ""}</p>}
                <button onClick={pay} disabled={busy || !selected} className="mt-3 w-full rounded-full py-2.5 text-xs font-bold disabled:opacity-40 transition" style={{ background: PISTACHIO, color: "#2a2c30", boxShadow: "0 10px 24px -10px rgba(0,0,0,0.4)" }}>
                  {busy ? "…" : "Betaal nu"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="receipt" initial={{ x: "60%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 p-4 flex flex-col" style={{ color: INK }}>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" style={{ color: OLIVE }} />
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold">Kassabon</p>
              </div>
              <div className="mt-3 border-t pt-3" style={{ borderColor: "hsl(var(--foreground) / 0.12)" }}>
                <p className="text-sm font-display font-bold leading-tight">{receipt.title}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] mt-1" style={{ color: MUTED }}>{nameOf(receipt.portfolio_id)}</p>
              </div>
              <div className="mt-auto space-y-1.5 text-xs">
                <div className="flex justify-between"><span style={{ color: MUTED }}>Bedrag</span><span className="font-mono tabular-nums font-bold">{fmtEuro(amt(receipt))}</span></div>
                <div className="flex justify-between"><span style={{ color: MUTED }}>Datum</span><span className="font-mono tabular-nums">{new Date().toISOString().slice(0, 10)}</span></div>
                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "hsl(var(--foreground) / 0.12)" }}>
                  <span className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: OLIVE }}>Betaald</span>
                  <Check className="w-4 h-4" style={{ color: OLIVE }} />
                </div>
                <button onClick={back} className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold" style={{ background: "hsl(var(--foreground) / 0.06)", border: "1px solid hsl(var(--foreground) / 0.1)" }}>
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