import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const INK_DARK = "#2a2c30";
const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/502c59dfe_Textile_in_motion_detail_shot_202608282236.jpeg";

const effDate = (e) => e.next_payment_date || e.due_date;
const dueThisMonth = (dateStr) => {
  if (!dateStr) return true;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};
const isCycleFreq = (f) => ["quarterly", "semiannual", "annual", "bimonthly"].includes(f);
const hexToRgba = (hex, a) => {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return `rgba(120,120,120,${a})`;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/** LastenActionWidget — 4:3 photo-shell (4 afgeronde hoeken, flush) waarbinnen
 *  de kassabon-PhotoCard schuift (zoals ThingsHandleWidget doet).
 *  - Links op de foto: alle lasten + berekende reserveringen als glazen pillen
 *    met DO IT NOW! / RESERVEER.
 *  - Rechts: pistache kassabon-PhotoCard (4 afgeronde hoeken) schuift in bij
 *    de eerste actie en toont de editorial receipt + totaal.
 *  - Echte expenses (AdminObligation) met een maandelijkse of vervallen
 *    cyclus-frequentie → "DO IT NOW!" → echte betaling.
 *  - Cyclus-lasten die deze maand niet vervallen → "RESERVEER" → lokale
 *    reservering.
 *  - Berekende reserverings-items uit portefeuilles zonder open last →
 *    "DO IT NOW!" → lokale reservering. */
export default function LastenActionWidget({ expenses, portfolios, onReload }) {
  const { toast } = useToast();
  const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
  const potName = (id) => (portfolios || []).find((p) => p.id === id)?.name || "—";

  const openExpenses = useMemo(() => (expenses || []).filter((e) => e.status !== "done"), [expenses]);
  const openPortfolioIds = useMemo(() => new Set(openExpenses.map((e) => e.portfolio_id).filter(Boolean)), [openExpenses]);

  const reservationItems = useMemo(() => {
    return (portfolios || [])
      .filter((p) => !p.archived && p.active !== false && (p.kind === "vaste_last" || p.kind === "onvoorzien") && Number(p.monthly_reservation_actual) > 0 && !openPortfolioIds.has(p.id))
      .map((p) => ({
        id: `res-${p.id}`,
        kind: "reservation",
        title: `Reservering ${p.name}`,
        amount: Number(p.monthly_reservation_actual) || 0,
        portfolio_id: p.id,
        frequency: p.payment_frequency || "monthly",
        next_payment_date: null,
        color: p.color || "#9c9c9c",
        due: true,
      }));
  }, [portfolios, openPortfolioIds]);

  const expenseItems = useMemo(() => openExpenses.map((e) => {
    const cycle = isCycleFreq(e.frequency);
    const due = !cycle || dueThisMonth(effDate(e));
    return {
      id: e.id,
      kind: "expense",
      raw: e,
      title: e.title,
      amount: Number(e.expected_amount ?? e.amount) || 0,
      portfolio_id: e.portfolio_id,
      frequency: e.frequency,
      next_payment_date: effDate(e),
      color: colorOf(e.portfolio_id),
      due,
      cycle,
    };
  }), [openExpenses, portfolios]); // eslint-disable-line

  const [doneReservations, setDoneReservations] = useState(new Set());
  const [receipt, setReceipt] = useState([]);

  const items = [...expenseItems, ...reservationItems.filter((r) => !doneReservations.has(r.id))];
  const hasPaid = receipt.length > 0;
  const total = receipt.reduce((s, r) => s + r.amount, 0);

  const addReceipt = (title, amount, kind) => setReceipt((r) => [...r, { title, amount, kind }]);

  const payExpense = async (it) => {
    const amt = it.amount;
    const today = new Date().toISOString().slice(0, 10);
    try {
      await base44.entities.AdminObligation.update(it.id, { status: "done", last_payment_date: today, actual_amount: amt });
      const pot = (portfolios || []).find((p) => p.id === it.portfolio_id);
      if (pot) await base44.entities.Portfolio.update(it.portfolio_id, { current_balance: (Number(pot.current_balance) || 0) - amt });
      await base44.entities.Transaction.create({ portfolio_id: it.portfolio_id, expense_id: it.id, type: "expense", amount: amt, status: "completed", date: today, note: `Betaald: ${it.title}` });
      addReceipt(it.title, amt, "Betaald");
      toast({ title: "Betaald", description: `${fmtEuro(amt)} · ${potName(it.portfolio_id)}` });
      onReload?.();
    } catch {
      toast({ title: "Betaling mislukt", variant: "destructive" });
    }
  };

  const reserveLocal = (it) => {
    if (it.kind === "reservation") setDoneReservations((s) => new Set(s).add(it.id));
    addReceipt(it.title, it.amount, "Gereserveerd");
    toast({ title: "Gereserveerd", description: `${fmtEuro(it.amount)} · ${it.title}` });
  };

  const act = (it) => (it.kind === "expense" && it.due ? payExpense(it) : reserveLocal(it));
  const buttonLabel = (it) => (it.kind === "expense" && it.due ? "DO IT NOW!" : "RESERVEER");

  return (
    <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.40)" }}>
      {/* Photo-shell — 4 afgeronde hoeken, flush tegen de randen */}
      <img src={PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(20,22,26,0.74) 0%, rgba(20,22,26,0.52) 60%, rgba(20,22,26,0.34) 100%)" }} />

      {/* LINKS — lasten pillen (verkleint naar 50% zodra kassabon opent) */}
      <motion.div className="absolute inset-y-0 left-0 z-10 flex flex-col p-4" animate={{ width: hasPaid ? "50%" : "100%" }} transition={{ duration: 0.5, ease: EASE }} style={{ color: IVORY }}>
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold">Lasten · reserveringen</p>
          <span className="text-[9px] font-mono tabular-nums opacity-70">{items.length}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
          {items.length === 0 && <p className="text-[11px] italic opacity-70">Alles geregeld.</p>}
          <AnimatePresence>
            {items.map((it) => {
              const dim = !it.due;
              return (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 120 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="rounded-full pl-3 pr-1.5 py-1.5 flex items-center gap-2"
                  style={{ background: hexToRgba(it.color, dim ? 0.18 : 0.30), border: `1px solid ${hexToRgba(it.color, dim ? 0.35 : 0.55)}`, opacity: dim ? 0.66 : 1, color: IVORY }}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: it.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-display font-semibold truncate">{it.title}</p>
                    <p className="text-[9px] uppercase tracking-wide truncate opacity-75">
                      {potName(it.portfolio_id)} · {fmtEuro(it.amount)}{it.next_payment_date ? ` · ${new Date(it.next_payment_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => act(it)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-display font-bold transition"
                    style={it.due
                      ? { background: PISTACHIO, color: INK_DARK }
                      : { background: "transparent", color: IVORY, border: `1px solid ${hexToRgba(it.color, 0.7)}` }}
                  >
                    {it.due ? <><Check className="w-3 h-3" /> {buttonLabel(it)}</> : buttonLabel(it)}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* RECHTS — kassabon PhotoCard (4 afgeronde hoeken, schuift binnen de shell) */}
      <motion.div
        className="absolute inset-y-0 right-0 z-20 overflow-hidden rounded-[18px]"
        animate={{ left: hasPaid ? "50%" : "100%" }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ width: "50%", boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <div className="absolute inset-0" style={{ background: PISTACHIO }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(40,42,46,0.10), rgba(40,42,46,0.40))" }} />
        <div className="relative h-full flex flex-col p-4" style={{ color: INK_DARK }}>
          <p className="text-[9px] uppercase tracking-[0.28em] font-light opacity-70">Kassabon</p>
          <p className="text-[22px] font-display font-bold tracking-[-0.02em] leading-tight">Betaald · gereserveerd</p>
          <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar font-mono text-[10px]">
            {receipt.length === 0 && <p className="italic opacity-55">Nog niets betaald.</p>}
            {receipt.map((r, i) => (
              <div key={i} className="flex items-baseline gap-1.5 py-0.5">
                <span className="text-[8px] uppercase tracking-[0.14em] opacity-50 shrink-0">{r.kind === "Betaald" ? "B" : "R"}</span>
                <span className="truncate flex-1">{r.title}</span>
                <span className="tracking-[0.22em] opacity-25">·</span>
                <span className="tabular-nums shrink-0">{fmtEuro(r.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t flex items-baseline justify-between font-mono" style={{ borderColor: "rgba(40,42,46,0.25)" }}>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Totaal</span>
            <span className="text-[20px] font-display font-bold tabular-nums">{fmtEuro(total)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}