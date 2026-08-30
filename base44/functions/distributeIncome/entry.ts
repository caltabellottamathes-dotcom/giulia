import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * distributeIncome — verdeelt ontvangen inkomen automatisch over wallets op
 * basis van de per-last monthly_reservation. Bedragen worden naar boven
 * afgerond (ceil) om te sparen/buffer op te bouwen. Per wallet één
 * "reservation"-transactie; de income wordt gemarkeerd via een "income"-
 * transactie zodat hij niet opnieuw verdeeld wordt.
 *
 * Trigger: Income-status → "received" (workflow). Handmatig: knop in INKOMEN.
 *  - zonder args: verwerk alle ontvangen inkomsten die nog niet verdeeld zijn.
 *  - { incomeId }: verwerk één specifieke income.
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  const round = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const ceilEuro = (n) => Math.ceil(Number(n) || 0);
  try {
    const body = await req.json().catch(() => ({}));
    const today = new Date().toISOString().slice(0, 10);

    const [incomes, portfolios, expenses, txns] = await Promise.all([
      sr.entities.Income.list("-created_date", 200).catch(() => []),
      sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []),
      sr.entities.AdminObligation.list("-created_date", 500).catch(() => []),
      sr.entities.Transaction.list("-created_date", 1000).catch(() => []),
    ]);

    const distributedIds = new Set((txns || []).filter((t) => t.type === "income" && t.income_id).map((t) => t.income_id));
    let received = (incomes || []).filter((i) => i.status === "received" && !distributedIds.has(i.id));
    if (body?.incomeId) {
      const specific = (incomes || []).find((i) => i.id === body.incomeId);
      if (specific && !distributedIds.has(specific.id)) received = [specific];
      else received = [];
    }
    if (!received.length) return Response.json({ ok: true, distributed: 0, note: "geen nieuwe ontvangen inkomsten" });

    const activeP = (portfolios || []).filter((p) => p.active !== false);
    const rawDemandOf = (pid) => {
      const p = activeP.find((x) => x.id === pid);
      const lastenRes = (expenses || [])
        .filter((e) => e.portfolio_id === pid && e.status !== "done")
        .reduce((s, e) => s + (Number(e.monthly_reservation) || 0), 0);
      const doel2 = Number(p?.desired_buffer) || 0;
      const bufferRes = doel2 > 0 ? (Number(p?.monthly_buffer_reservation) || 0) : 0;
      return lastenRes + bufferRes;
    };
    // Doel 2-cap: enkel aanvullend tot desired_buffer reserveren; rest is vrij besteedbaar.
    const demandOf = (p) => {
      const raw = rawDemandOf(p.id);
      const doel2 = Number(p.desired_buffer) || 0;
      if (doel2 <= 0) return raw;
      const bal = Number(p.current_balance) || 0;
      if (bal >= doel2) return 0;
      return Math.min(raw, Math.round((doel2 - bal) * 100) / 100);
    };

    const results = [];
    for (const inc of received) {
      const amt = round(inc.amount);
      // vraag per wallet (met Doel 2-cap, herberekend per income op actueel saldo)
      const walletDemand = activeP.map((p) => ({ id: p.id, name: p.name, kind: p.kind, demand: demandOf(p) }));
      const ceils = walletDemand.map((w) => ({ ...w, give: ceilEuro(w.demand) }));
      const sumCeils = ceils.reduce((s, w) => s + w.give, 0);

      let gives = [];
      if (sumCeils <= amt && sumCeils > 0) {
        // inkomen dekt afgeronde reserveringen → rest gaat naar sparen-wallets (buffer)
        gives = ceils.filter((w) => w.give > 0).map((w) => ({ id: w.id, give: w.give }));
        let leftover = round(amt - sumCeils);
        const sparen = ceils.filter((w) => w.kind === "sparen");
        if (leftover > 0 && sparen.length) {
          // gelijkmatig over sparen-wallets
          const each = Math.floor(leftover / sparen.length);
          let rem = leftover - each * sparen.length;
          for (const w of sparen) {
            let g = each + (rem > 0 ? 1 : 0); if (rem > 0) rem--;
            const ex = gives.find((x) => x.id === w.id);
            if (ex) ex.give += g; else gives.push({ id: w.id, give: g });
          }
        }
      } else if (sumCeils > amt) {
        // reserveringen overstijgen inkomen → proportioneel over amt, laatste vangt verschil
        const totalDemand = walletDemand.reduce((s, w) => s + w.demand, 0) || 1;
        let acc = 0;
        const ordered = walletDemand.filter((w) => w.demand > 0);
        ordered.forEach((w, i) => {
          if (i < ordered.length - 1) { const g = Math.max(1, Math.round((w.demand / totalDemand) * amt)); gives.push({ id: w.id, give: g }); acc += g; }
          else gives.push({ id: w.id, give: round(amt - acc) });
        });
      } else {
        // geen reserveringen ingesteld → alles naar sparen-wallets, anders sla over
        const sparen = activeP.filter((p) => p.kind === "sparen");
        if (sparen.length) gives.push({ id: sparen[0].id, give: amt });
      }

      let distributed = 0;
      for (const g of gives) {
        if (!g.give || g.give <= 0) continue;
        const pot = activeP.find((p) => p.id === g.id);
        if (!pot) continue;
        const newBal = round((Number(pot.current_balance) || 0) + g.give);
        try {
          await sr.entities.Portfolio.update(g.id, { current_balance: newBal });
          pot.current_balance = newBal;
          await sr.entities.Transaction.create({ portfolio_id: g.id, income_id: inc.id, type: "reservation", amount: g.give, status: "completed", date: today, note: `Reservering vanuit ${inc.description || "inkomen"}` });
        } catch {}
        distributed += g.give;
      }
      try {
        await sr.entities.Transaction.create({ income_id: inc.id, type: "income", amount: amt, status: "completed", date: today, note: `Inkomsten verdeeld: ${round(distributed)} van ${amt}` });
      } catch {}
      results.push({ id: inc.id, income: amt, distributed: round(distributed), wallets: gives.length });
    }
    return Response.json({ ok: true, distributed: results.length, results });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}