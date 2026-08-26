import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcPortfolio } from '../../shared/financeEngine.ts';

/**
 * calcReservations — herrekent per portefeuille de aanbevolen maandelijkse
 * reservering, benodigde reservering, volgende betaling en health-status, en
 * persisteert deze (recommended / required / status). De werkelijke reservering
 * (monthly_reservation_actual) blijft ongemoeid — override blijft staan.
 * Trigger: handmatig, of na aanmaken/wijzigen van een expense.
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const portfolios = await sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []);
    const expenses = await sr.entities.AdminObligation.list("-created_date", 300).catch(() => []);
    let updated = 0;
    for (const p of portfolios) {
      const calc = calcPortfolio(p, expenses);
      await sr.entities.Portfolio.update(p.id, {
        monthly_reservation_recommended: calc.recommended_monthly,
        next_expected_payment: calc.next_expected_payment,
        next_payment_date: calc.next_payment_date || undefined,
        required_reservation: calc.required_reservation,
        status: calc.status,
      }).catch(() => null);
      updated++;
    }
    return Response.json({ ok: true, recomputed: updated });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}