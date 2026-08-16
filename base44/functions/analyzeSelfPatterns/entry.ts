import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { emitEvent } from '../../shared/eventEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';
import { capacityTrend, energyTrend, moodPattern, routineCompliance, calculateSelfBalance } from '../../shared/selfEngine.ts';
import { domainBalance, sumDuration } from '../../shared/domainEngine.ts';

/**
 * analyzeSelfPatterns — dagelijkse SELF patroon-analyse.
 * Gebruikt de unified insightHelper (routes naar SelfInsight) + emitEvent.
 * Trigger: scheduled daily 21:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();

    const [checkIns, routines, timeBlocks, timeEntries] = await Promise.all([
      sr.entities.SelfCheckIn.filter({}, "-timestamp", 50).catch(() => []),
      sr.entities.SelfRoutine.list("-created_date", 100).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({}, "-start", 100).catch(() => []),
      sr.entities.TimeEntry.filter({}, "-created_date", 200).catch(() => []),
    ]);
    const existingInsights = await listInsights(base44, { domain: "self", limit: 100 });

    const findings = [];

    const cap = capacityTrend(checkIns);
    if (cap.trend === "declining" && cap.low) {
      findings.push({ type: "capacity", category: "capacity", title: "Capaciteit daalt en is laag", description: `Capaciteit zakt (gem. ${cap.avg}%, laatste ${cap.latest}%). Overweeg vandaag minder in te plannen.` });
    } else if (cap.trend === "declining") {
      findings.push({ type: "pattern", category: "capacity", title: "Capaciteit vertoont dalende trend", description: `Gem. capaciteit ${cap.avg}%, dalende lijn over recente check-ins.` });
    }

    const en = energyTrend(checkIns);
    if (en.trend === "declining" && en.low) {
      findings.push({ type: "imbalance", category: "energy", title: "Energie uitgeput", description: `Energie laag (${en.latest}%) en daalt. Plan geen deep work; prioriteit op rust.` });
    } else if (en.trend === "declining") {
      findings.push({ type: "pattern", category: "energy", title: "Energie neemt af door de week", description: `Energiepatroon toont daling (gem. ${en.avg}%). Bekijk slaap of rust.` });
    }

    const mood = moodPattern(checkIns);
    if (mood.recurring.length && (mood.recurring.includes("anxious") || mood.recurring.includes("tired") || mood.recurring.includes("low"))) {
      findings.push({ type: "pattern", category: "mood", title: `Terugkerende stemming: ${mood.dominant}`, description: `"${mood.dominant}" komt herhaaldelijk voor. Patroon om op te letten.` });
    }

    const rc = routineCompliance(routines);
    if (rc.total >= 3 && rc.rate < 40) {
      findings.push({ type: "pattern", category: "routine", title: "Routines vallen weg", description: `Slechts ${rc.rate}% voltooid. ${rc.skipped} overgeslagen. Misschien te veel in één keer?` });
    }

    const focusMin = sumDuration((timeEntries || []).filter((e) => e.domain === "focus"), "duration_min");
    const lifeMin = sumDuration((timeEntries || []).filter((e) => e.domain === "life"), "duration_min");
    const selfMin = sumDuration((timeEntries || []).filter((e) => e.domain === "self"), "duration_min") + sumDuration((timeBlocks || []).filter((b) => new Date(b.start).toDateString() === now.toDateString() && b.status !== "cancelled"), "duration_min");
    const bal = domainBalance(focusMin, lifeMin, selfMin);
    if (bal.imbalance) {
      findings.push({ type: "imbalance", category: "capacity", title: "FOCUS domineert, SELF ondermaat", description: `Verdeling FOCUS ${bal.focusPct}% · LIFE ${bal.lifePct}% · SELF ${bal.selfPct}%. Risico op overbelasting.` });
    }
    if (bal.underRecovery) {
      findings.push({ type: "under_recovery", category: "rest", title: "Onderherstel", description: `Zelfzorg/rust slechts ${bal.selfPct}% van je tijd. Herstel is structureel ondermaat.` });
    }

    if (!findings.length) {
      return Response.json({ ok: true, created: 0, findings: [], message: "Geen nieuwe patronen gedetecteerd." });
    }

    let enriched = findings;
    try {
      const r = await geminiDecide({
        model: "gemini-3.5-flash",
        prompt: `Je bent Giulia. Herverwoord elke titel + beschrijving korter, menselijker, in Salvo's stijl (droog, direct, geen performatief enthousiasme). Behoud type en category EXACT. Context-findings:\n${JSON.stringify(findings)}\n\nGeef UITSLUITEND een JSON-string met {"items":[...]}.`,
        schema: { type: "object", properties: { json: { type: "string" } }, required: ["json"] },
        systemText: GIULIA_PERSONA,
        temperature: 0.4,
        keyName: "BACKDESK_GEMINI_API_KEY",
      });
      const parsed = r?.json ? JSON.parse(r.json) : null;
      if (parsed?.items?.length) enriched = parsed.items;
    } catch { /* behoud deterministische findings */ }

    let created = 0;
    for (const f of enriched) {
      if (!f?.title) continue;
      const ins = await createInsight(base44, {
        domain: "self", title: f.title, type: f.type, category: f.category,
        description: f.description, confidence: 0.6, source: "analyzeSelfPatterns",
        period_start: new Date(now.getTime() - 14 * 86400000).toISOString().split("T")[0],
        period_end: now.toISOString().split("T")[0],
        existingInsights,
      });
      if (ins && !ins.skipped) {
        created++;
        await emitEvent(base44, { event_type: "SELF_INSIGHT_CREATED", object_type: "SelfInsight", object_id: ins.id, domain: "self", description: f.title, source: "analyzeSelfPatterns" });
      }
    }

    return Response.json({ ok: true, created, findings_count: enriched.length, balance: bal });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}