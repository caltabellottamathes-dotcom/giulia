import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcPortfolio, STATUS_LABEL } from '../../shared/financeEngine.ts';

/**
 * calcPortfolioHealth — herrekent uitsluitend de health-status en benodigde
 * reservering per portefeuille (saldo + toekomstige betalingen + buffer +
 * reserveringsdekking). Snelere, lichtere run dan calcReservations.
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const portfolios = await sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []);
    const expenses = await sr.entities.AdminObligation.list("-created_date", 300).catch(() => []);
    const summary = [];
    for (const p of portfolios) {
      const calc = calcPortfolio(p, expenses);
      await sr.entities.Portfolio.update(p.id, {
        required_reservation: calc.required_reservation,
        status: calc.status,
        next_expected_payment: calc.next_expected_payment,
      }).catch(() => null);
      summary.push({ id: p.id, name: p.name, status: calc.status, label: STATUS_LABEL[calc.status] });
    }
    return Response.json({ ok: true, portfolios: summary });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}