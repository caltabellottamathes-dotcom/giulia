import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { emitEvent } from '../../shared/eventEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';
import {
  overdueItems, compliance, domainBalance, sumDuration, daysSince,
} from '../../shared/domainEngine.ts';

/**
 * analyzeFocusPatterns — dagelijkse FOCUS patroon-analyse.
 * Spiegelt analyzeSelfPatterns / analyzeLifePatterns: 14-daagse scan van
 * taken, projecten en tijd → Insight via de unified pipeline + emitEvent.
 * Trigger: scheduled daily 21:30 Europe/Amsterdam.
 *
 * Verschil met runProactivity (12:00 & 16:00): dat is de LIVING schedule —
 * herplant, deblokkeer, signaleer dead-ends NU. Deze functie is de
 * avondreflectie — ze kijkt 14 dagen terug en formuleert langetermijnpatronen.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const fourteenDaysAgo = now.getTime() - 14 * 86400000;

    const [tasks, projects, timeEntries] = await Promise.all([
      sr.entities.Task.list("-created_date", 300).catch(() => []),
      sr.entities.Project.list("-created_date", 200).catch(() => []),
      sr.entities.TimeEntry.list("-created_date", 300).catch(() => []),
    ]);
    const existingInsights = await listInsights(base44, { domain: "focus", limit: 100 });

    const activeTasks = (tasks || []).filter((t) => !["archived", "completed"].includes(t.status));
    const comp = compliance(tasks, (t) => t.status === "completed");
    const overdue = overdueItems(tasks, { field: "deadline", days: 0 });
    const waiting = (tasks || []).filter((t) => t.status === "waiting");
    const stalledProjects = (projects || []).filter(
      (p) => ["in_progress", "planning"].includes(p.status) &&
        (!p.last_activity_date || (daysSince(p.last_activity_date) || 0) >= 14)
    );

    const focusMin = sumDuration((timeEntries || []).filter((e) => e.domain === "focus"), "duration_min");
    const lifeMin = sumDuration((timeEntries || []).filter((e) => e.domain === "life"), "duration_min");
    const selfMin = sumDuration((timeEntries || []).filter((e) => e.domain === "self"), "duration_min");
    const bal = domainBalance(focusMin, lifeMin, selfMin);

    const findings = [];

    if (comp.total >= 5 && comp.rate < 40) {
      findings.push({ type: "pattern", category: "Suggestion", title: "Voltooiingsgraad laag", description: `Slechts ${comp.rate}% van ${comp.total} actieve taken voltooid. Deel ze op of verlaag de lat.` });
    }
    if (overdue.length >= 5) {
      findings.push({ type: "pattern", category: "Risk", title: "Overdue taken stapelen op", description: `${overdue.length} taken zijn over deadline. Herplan of archiveer de oude ruis.` });
    }
    if (waiting.length >= 3) {
      findings.push({ type: "pattern", category: "Follow-up", title: "Meerdere taken wachten op input", description: `${waiting.length} taken staan op 'waiting'. Eén follow-up kan er meerdere deblokkeren.` });
    }
    if (stalledProjects.length >= 1) {
      findings.push({ type: "pattern", category: "Risk", title: `${stalledProjects.length} project${stalledProjects.length !== 1 ? "en" : ""} stilgevallen`, description: `${stalledProjects.slice(0, 3).map((p) => p.title).join(", ")} — 14+ dagen geen activiteit.` });
    }
    if (bal.imbalance) {
      findings.push({ type: "imbalance", category: "Suggestion", title: "FOCUS domineert je tijd", description: `Verdeling FOCUS ${bal.focusPct}% · LIFE ${bal.lifePct}% · SELF ${bal.selfPct}%. Risico op overbelasting.` });
    }
    if (bal.lifeNeglected) {
      findings.push({ type: "pattern", category: "Suggestion", title: "LIFE staat op de achtergrond", description: `Slechts ${bal.lifePct}% LIFE-activiteit. Plan één sociaal of huishoudelijk moment.` });
    }

    if (!findings.length) {
      return Response.json({ ok: true, created: 0, findings: [], balance: bal });
    }

    let enriched = findings;
    try {
      const r = await geminiDecide({
        model: "gemini-3.5-flash-lite",
        prompt: `Je bent Giulia. Herverwoord elke titel + beschrijving korter, menselijker, in Salvo's stijl (droog, direct, geen performatief enthousiasme). Behoud category EXACT (Risk/Suggestion/Opportunity/Follow-up/Trend/Review/Research). Findings:\n${JSON.stringify(findings)}\n\nGeef UITSLUITEND JSON: {"items":[...]}`,
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
        domain: "focus", title: f.title, type: f.type, category: f.category,
        description: f.description, confidence: 0.6, source: "analyzeFocusPatterns",
        existingInsights,
      });
      if (ins && !ins.skipped) {
        created++;
        await emitEvent(base44, { event_type: "FOCUS_INSIGHT_CREATED", object_type: "Insight", object_id: ins.id, domain: "focus", description: f.title, source: "analyzeFocusPatterns" });
      }
    }

    return Response.json({ ok: true, created, findings_count: enriched.length, completion: comp, balance: bal });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}