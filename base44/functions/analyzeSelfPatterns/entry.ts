import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import {
  capacityTrend, energyTrend, moodPattern, routineCompliance,
  calculateSelfBalance, dedupeInsightByTitle,
} from '../../shared/selfEngine.ts';

/**
 * analyzeSelfPatterns — dagelijkse SELF patroon-analyse.
 *
 * Laadt de laatste 14 dagen SelfCheckIn, SelfRoutine, PersonalTimeBlock en
 * TimeEntry (focus/life/self). Voert deterministische trend-detectie uit en
 * vraagt Gemini om de bevindingen te formuleren. Dedup op titel voorkomt
 * herhaling. Creëert SelfInsight-records van type:
 *   pattern / balance / capacity / imbalance / overload / under_recovery.
 *
 * Trigger: scheduled daily 21:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();

    const [checkIns, routines, timeBlocks, timeEntries, existingInsights] = await Promise.all([
      sr.entities.SelfCheckIn.filter({}, "-timestamp", 50).catch(() => []),
      sr.entities.SelfRoutine.list("-created_date", 100).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({}, "-start", 100).catch(() => []),
      sr.entities.TimeEntry.filter({}, "-created_date", 200).catch(() => []),
      sr.entities.SelfInsight.list("-created_date", 100).catch(() => []),
    ]);

    const findings = [];

    // 1. Capacity trend
    const cap = capacityTrend(checkIns);
    if (cap.trend === "declining" && cap.low) {
      findings.push({ type: "capacity", category: "capacity", title: "Capaciteit daalt en is laag", description: `Capaciteit zakt (gem. ${cap.avg}%, laatste ${cap.latest}%). Overweeg vandaag minder in te plannen.` });
    } else if (cap.trend === "declining") {
      findings.push({ type: "pattern", category: "capacity", title: "Capaciteit vertoont dalende trend", description: `Gem. capaciteit ${cap.avg}%, dalende lijn over recente check-ins.` });
    }

    // 2. Energy trend
    const en = energyTrend(checkIns);
    if (en.trend === "declining" && en.low) {
      findings.push({ type: "imbalance", category: "energy", title: "Energie uitgeput", description: `Energie laag (${en.latest}%) en daalt. Plan geen deep work; prioriteit op rust.` });
    } else if (en.trend === "declining") {
      findings.push({ type: "pattern", category: "energy", title: "Energie neemt af door de week", description: `Energiepatroon toont daling (gem. ${en.avg}%). Bekijk slaap of rust.` });
    }

    // 3. Mood pattern
    const mood = moodPattern(checkIns);
    if (mood.recurring.length && (mood.recurring.includes("anxious") || mood.recurring.includes("tired") || mood.recurring.includes("low"))) {
      findings.push({ type: "pattern", category: "mood", title: `Terugkerende stemming: ${mood.dominant}`, description: `"${mood.dominant}" komt herhaaldelijk voor. Patroon om op te letten.` });
    }

    // 4. Routine compliance
    const rc = routineCompliance(routines);
    if (rc.total >= 3 && rc.rate < 40) {
      findings.push({ type: "pattern", category: "routine", title: "Routines vallen weg", description: `Slechts ${rc.rate}% voltooid. ${rc.skipped} overgeslagen. Misschien te veel in één keer?` });
    }

    // 5. Balance focus/life/self
    const focusMin = sumTimeEntries(timeEntries, "focus");
    const lifeMin = sumTimeEntries(timeEntries, "life");
    const selfMin = sumTimeEntries(timeEntries, "self") + sumTimeBlocks(timeBlocks);
    const bal = calculateSelfBalance(focusMin, lifeMin, selfMin);
    if (bal.imbalance) {
      findings.push({ type: "imbalance", category: "capacity", title: "FOCUS domineert, SELF ondermaat", description: `Verdeling FOCUS ${bal.focusPct}% · LIFE ${bal.lifePct}% · SELF ${bal.selfPct}%. Risico op overbelasting.` });
    }
    if (bal.underRecovery) {
      findings.push({ type: "under_recovery", category: "rest", title: "Onderherstel", description: `Zelfzorg/rust slechts ${bal.selfPct}% van je tijd. Herstel is structureel ondermaat.` });
    }

    if (!findings.length) {
      return Response.json({ ok: true, created: 0, findings: [], message: "Geen nieuwe patronen gedetecteerd." });
    }

    // Gemini herverwoordt de bevindingen menselijker (enkele string → parse)
    let enriched = findings;
    try {
      const r = await geminiDecide({
        model: "gemini-3.1-flash-lite",
        prompt: `Je bent Giulia. Herverwoord elke titel + beschrijving korter, menselijker, in Salvo's stijl (droog, direct, geen performatief enthousiasme). Behoud type en category EXACT. Context-findings:\n${JSON.stringify(findings)}\n\nGeef UITSLUITEND een JSON-string met {"items":[...]} en verder niets.`,
        schema: { type: "object", properties: { json: { type: "string" } }, required: ["json"] },
        systemText: GIULIA_PERSONA,
        temperature: 0.4,
        keyName: "BACKDESK_GEMINI_API_KEY",
      });
      const parsed = r?.json ? JSON.parse(r.json) : null;
      if (parsed?.items?.length) enriched = parsed.items;
    } catch { /* behoud deterministische findings bij falen */ }

    // Maak SelfInsight records (dedup op titel)
    let created = 0;
    for (const f of enriched) {
      if (!f?.title) continue;
      if (dedupeInsightByTitle(existingInsights, f.title)) continue;
      await sr.entities.SelfInsight.create({
        title: f.title,
        type: f.type || "pattern",
        category: f.category || "capacity",
        description: f.description || "",
        status: "active",
        confidence: 0.6,
        period_start: new Date(now.getTime() - 14 * 86400000).toISOString().split("T")[0],
        period_end: now.toISOString().split("T")[0],
        agent_source: "analyzeSelfPatterns",
      }).catch(() => null);
      created++;
    }

    return Response.json({ ok: true, created, findings_count: enriched.length, balance: bal });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

function sumTimeEntries(entries, domain) {
  return (entries || []).filter((e) => e.domain === domain).reduce((s, e) => s + (e.duration_min || e.duration || 0), 0);
}
function sumTimeBlocks(blocks) {
  const d = new Date().toDateString();
  return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0);
}