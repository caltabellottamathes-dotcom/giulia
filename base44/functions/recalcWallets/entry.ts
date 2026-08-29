import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcPortfolio } from '../../shared/financeEngine.ts';

/**
 * recalcWallets — verwerkt reeds-betaalde lasten (kassabon) die nog niet in de
 * wallet zijn afgeschreven, en herberekent alle portefeuilles (reservering,
 * volgende betaling, status). Trigger: handmatig ("recalculate") of na correcties.
 *
 * Backfill-regel: een done expense zonder expense-type Transaction wordt nu
 * verwerkt (bedrag van wallet afschrijven + transactie aanmaken). Expenses die
 * wél een expense-transactie hebben worden overgeslagen (al verwerkt door de
 * betaal-flow die zowel afschrijft als een transactie logt).
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const [expenses, transactions, portfolios] = await Promise.all([
      sr.entities.AdminObligation.list("-created_date", 500).catch(() => []),
      sr.entities.Transaction.list("-created_date", 1000).catch(() => []),
      sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []),
    ]);

    const txExpenseIds = new Set((transactions || []).filter((t) => t.type === "expense" && t.expense_id).map((t) => t.expense_id));
    const today = new Date().toISOString().slice(0, 10);
    const backfilled = [];

    for (const e of (expenses || []).filter((x) => x.status === "done")) {
      if (txExpenseIds.has(e.id)) continue; // al verwerkt
      const amt = Math.round((Number(e.actual_amount ?? e.expected_amount ?? e.amount) || 0) * 100) / 100;
      if (e.portfolio_id) {
        const pot = (portfolios || []).find((p) => p.id === e.portfolio_id);
        const newBal = Math.round(((Number(pot?.current_balance) || 0) - amt) * 100) / 100;
        try { await sr.entities.Portfolio.update(e.portfolio_id, { current_balance: newBal }); } catch {}
      }
      try {
        await sr.entities.Transaction.create({ portfolio_id: e.portfolio_id, expense_id: e.id, type: "expense", amount: amt, status: "completed", date: e.last_payment_date || today, note: `Verwerkt (recalc): ${e.title}` });
      } catch {}
      backfilled.push({ id: e.id, title: e.title, amount: amt, wallet: e.portfolio_id });
    }

    // Auto monthly_reservation — vul bestaande lasten zonder expliciete reservering
    const PERIODS = { weekly: 52, biweekly: 26, monthly: 12, bimonthly: 6, quarterly: 4, semiannual: 2, annual: 1, once: 1, variable: 12 };
    let reservationFilled = 0;
    for (const e of (expenses || [])) {
      if ((Number(e.monthly_reservation) || 0) > 0) continue;
      const a = Number(e.expected_amount ?? e.amount) || 0;
      if (a <= 0) continue;
      const ppy = PERIODS[e.frequency || "monthly"] || 12;
      const def = Math.round((a * ppy / 12) * 100) / 100;
      try { await sr.entities.AdminObligation.update(e.id, { monthly_reservation: def }); reservationFilled++; } catch {}
    }

    // Herbereken alle portefeuilles
    const recomputed = [];
    for (const p of (portfolios || [])) {
      const linked = (expenses || []).filter((e) => e.portfolio_id === p.id);
      const calc = calcPortfolio(p, linked);
      try {
        await sr.entities.Portfolio.update(p.id, {
          monthly_reservation_recommended: calc.recommended_monthly,
          next_expected_payment: calc.next_expected_payment,
          next_payment_date: calc.next_payment_date || undefined,
          required_reservation: calc.required_reservation,
          status: calc.status,
        });
        recomputed.push({ id: p.id, name: p.name, status: calc.status, recommended: calc.recommended_monthly });
      } catch {}
    }

    return Response.json({ ok: true, backfilled: backfilled.length, backfilledDetails: backfilled, reservationFilled, recomputed: recomputed.length, portfolios: recomputed });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}