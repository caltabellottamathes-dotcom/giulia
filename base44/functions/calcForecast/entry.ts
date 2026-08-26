import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcForecast, monthlyDistribution } from '../../shared/financeEngine.ts';

/**
 * calcForecast — projecteert per portefeuille het saldo over 1/3/6/12 maanden
 * op basis van inkomen + reserveringen + bekende betalingen. Persisteert niets;
 * retourneert de forecast-series + maandelijkse verdeling voor het dashboard.
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const body = await req.json().catch(() => ({}));
    const months = Number(body.months) || 12;
    const portfolios = await sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []);
    const expenses = await sr.entities.AdminObligation.list("-created_date", 300).catch(() => []);
    const incomes = await sr.entities.Income.list("-created_date", 100).catch(() => []);
    const series = calcForecast(portfolios, expenses, months);
    const distribution = monthlyDistribution(incomes, portfolios, expenses);
    return Response.json({ ok: true, series, distribution, months });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}