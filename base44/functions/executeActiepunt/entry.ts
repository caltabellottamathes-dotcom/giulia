import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * executeActiepunt — voert een Giulia-actiepunt uit dat in een AdminEditorial
 * staat. Aangeroepen vanuit AdminCard bij klik op een actiepunt.
 *  - transfer / reserve: verplaats `amount` van from_id wallet naar to_id wallet
 *    (reserve = zelfde mechanisme, gelabeld als reservering).
 *  - pay: markeer expense_id done, schrijf `amount` af van de wallet van de last
 *    en log een expense-transactie.
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  const round = (n) => Math.round((Number(n) || 0) * 100) / 100;
  try {
    const body = await req.json().catch(() => ({}));
    const item = body?.item || body;
    if (!item || !item.action_type) return Response.json({ ok: false, error: "geen actie" });
    const today = new Date().toISOString().slice(0, 10);

    if (item.action_type === "transfer" || item.action_type === "reserve") {
      const amt = round(item.amount);
      if (amt <= 0 || !item.from_id || !item.to_id) return Response.json({ ok: false, error: "ongeldige transfer" });
      const [from, to] = await Promise.all([
        sr.entities.Portfolio.get(item.from_id).catch(() => null),
        sr.entities.Portfolio.get(item.to_id).catch(() => null),
      ]);
      if (!from || !to) return Response.json({ ok: false, error: "wallet niet gevonden" });
      await sr.entities.Portfolio.update(item.from_id, { current_balance: round((Number(from.current_balance) || 0) - amt) });
      await sr.entities.Portfolio.update(item.to_id, { current_balance: round((Number(to.current_balance) || 0) + amt) });
      await sr.entities.Transaction.create({ portfolio_id: item.from_id, type: "transfer", amount: amt, status: "completed", date: today, note: `Actiepunt → ${to.name}` });
      await sr.entities.Transaction.create({ portfolio_id: item.to_id, type: "transfer", amount: amt, status: "completed", date: today, note: `Actiepunt ← ${from.name}` });
      return Response.json({ ok: true, action: item.action_type, amount: amt, from: from.name, to: to.name });
    }

    if (item.action_type === "pay") {
      if (!item.expense_id) return Response.json({ ok: false, error: "geen expense" });
      const e = await sr.entities.AdminObligation.get(item.expense_id).catch(() => null);
      if (!e) return Response.json({ ok: false, error: "last niet gevonden" });
      const amt = round(item.amount || e.actual_amount || e.expected_amount || e.amount);
      await sr.entities.AdminObligation.update(item.expense_id, { status: "done", last_payment_date: today, actual_amount: amt });
      if (e.portfolio_id) {
        const pot = await sr.entities.Portfolio.get(e.portfolio_id).catch(() => null);
        if (pot) await sr.entities.Portfolio.update(e.portfolio_id, { current_balance: round((Number(pot.current_balance) || 0) - amt) });
        await sr.entities.Transaction.create({ portfolio_id: e.portfolio_id, expense_id: e.id, type: "expense", amount: amt, status: "completed", date: today, note: `Actiepunt betaald: ${e.title}` });
      }
      return Response.json({ ok: true, action: "pay", amount: amt, expense: e.title });
    }

    return Response.json({ ok: false, error: "onbekende actie" });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}