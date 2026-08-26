import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcPortfolio, monthlyIncome, monthlyDistribution, STATUS_LABEL } from '../../shared/financeEngine.ts';
import { createInsight } from '../../shared/insightHelper.ts';
import { emitEvent } from '../../shared/eventEngine.ts';

/**
 * runFinanceProactivity — scant de portefeuilles en emit proactieve
 * financiële signalen (Insights) zonder automatisch Tasks aan te maken.
 * Signalen: pot te laag gevuld, betaling nadert, reservering te laag,
 * kwartaal/jaarbetaling onvoldoende voorbereid, buffer onder gewenst,
 * onverwachte uitgave verlaagt buffer, inkomen dekt reserveringen niet.
 * Anti-spam: max 1 signaal per portefeuille per run; max 5 signalen totaal.
 */
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SIGNALS = 5;

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const portfolios = await sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []);
    const expenses = await sr.entities.AdminObligation.list("-created_date", 300).catch(() => []);
    const incomes = await sr.entities.Income.list("-created_date", 100).catch(() => []);
    const now = Date.now();
    const signals = [];
    let emitted = 0;

    // ── Per-portfolio signals ────────────────────────────────────────
    for (const p of portfolios) {
      if (emitted >= MAX_SIGNALS) break;
      const calc = calcPortfolio(p, expenses);
      const balance = Number(p.current_balance) || 0;
      const recommended = calc.recommended_monthly;
      const actual = Number(p.monthly_reservation_actual) || 0;

      // critical / short pot
      if (calc.status === "critical" || calc.status === "short") {
      await emit(base44, p, "Risk", `${p.name} loopt ${calc.status === "critical" ? "kritiek" : "krap"}`, `Er staat €${Math.round(balance)} in "${p.name}", maar de volgende betaling is €${Math.round(calc.next_expected_payment)}. Reserveer extra of vul de pot aan.`, signals);
      continue;
      }
      // payment nadert binnen 14 dagen
      if (calc.next_payment_date) {
      const d = new Date(calc.next_payment_date).getTime() - now;
      if (d > 0 && d <= 14 * DAY_MS && calc.next_expected_payment > balance * 1.1) {
        await emit(base44, p, "Risk", `${p.name}: betaling nadert`, `Binnen ${Math.round(d / DAY_MS)} dagen is €${Math.round(calc.next_expected_payment)} verschuldigd uit "${p.name}". Huidig saldo €${Math.round(balance)} is onvoldoende.`, signals);
        continue;
      }
      }
      // reservering te laag
      if (recommended > 0 && actual < recommended * 0.8) {
      await emit(base44, p, "Suggestion", `${p.name}: reservering te laag`, `Je reserveert €${Math.round(actual)}/mnd bij "${p.name}", aanbevolen is €${Math.round(recommended)}/mnd. Verhoog de reservering om achterstand op te lopen.`, signals);
      continue;
      }
      // buffer onder gewenst (onvoorzien)
      if (p.kind === "onvoorzien") {
      const used = Number(p.unexpected_used) || 0;
      const avail = balance - used;
      if (avail < (Number(p.desired_buffer) || 0) * 0.5) {
        await emit(base44, p, "Risk", `${p.name}: buffer laag`, `De onvoorziene-buffer van "${p.name}" is gedaald naar €${Math.round(avail)} (gewenst €${Math.round(p.desired_buffer || 0)}). Een onverwachte uitgave kan de pot legen.`, signals);
        continue;
      }
      }
      // kwartaal/jaarbetaling onvoldoende voorbereid
      const quarterlyExpenses = expenses.filter((e) => e.portfolio_id === p.id && (e.frequency === "quarterly" || e.frequency === "semiannual" || e.frequency === "annual") && e.status !== "done");
      for (const e of quarterlyExpenses) {
      if (!e.next_payment_date) continue;
      const d = new Date(e.next_payment_date).getTime() - now;
      const monthsToPay = Math.round(d / (30 * DAY_MS));
      const need = (Number(e.expected_amount) || 0) - balance;
      const monthsAccum = monthsToPay > 0 ? monthsToPay : 1;
      if (need > 0 && need / monthsAccum > (actual + 10)) {
        await emit(base44, p, "Risk", `${p.name}: ${e.frequency}-betaling onvoldoende`, `"${e.title}" (${e.frequency}) van €${Math.round(e.expected_amount || 0)} komt over ~${monthsToPay} mnd. Met huidige reservering €${Math.round(actual)}/mnd kom je €${Math.round(need)} tekort. Verhoog de reservering.`, signals);
        break;
      }
      }
      }

    // ── Income coverage signal ───────────────────────────────────────
    if (emitted < MAX_SIGNALS) {
      const dist = monthlyDistribution(incomes, portfolios, expenses);
      if (dist.income > 0 && dist.reserved > dist.income) {
        await createInsight(base44, {
          domain: "life", title: "Inkomen dekt reserveringen niet", type: "pattern", category: "Risk",
          description: `Je maandelijkse inkomen (€${Math.round(dist.income)}) is lager dan de benodigde reserveringen (€${Math.round(dist.reserved)}). Er blijft €${Math.round(dist.available)} over — verlaag reserveringen of verhoog inkomen.`,
          confidence: 0.85, source: "runFinanceProactivity",
        }).catch(() => null);
        await emitEvent(base44, { event_type: "FINANCE_INCOME_SHORTFALL", object_type: "Portfolio", object_id: null, domain: "life", description: "Inkomen dekt reserveringen niet", source: "runFinanceProactivity" }).catch(() => null);
        emitted++;
      }
    }

    return Response.json({ ok: true, emitted, signals });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}

async function emit(base44, p, category, title, description, signals) {
  await createInsight(base44, {
    domain: "life", title, type: "pattern", category, description,
    confidence: 0.8, source: "runFinanceProactivity",
  }).catch(() => null);
  signals.push({ portfolio: p.name, title });
}