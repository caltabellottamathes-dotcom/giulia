import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { emitEvent } from '../../shared/eventEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';
import { notify } from '../../shared/notify.ts';
import {
  overdueItems, dueSoon, neglectedContacts, domainBalance,
  compliance, dedupeByTitle, daysSince, sumDuration,
} from '../../shared/domainEngine.ts';

/**
 * analyzeLifePatterns — dagelijkse LIFE patroon-analyse.
 *
 * Spiegelt analyzeSelfPatterns (SELF): scant huishouden, administratie,
 * sociale contacten en hobby's op patronen (achterstalligheid, verwaarlozing,
 * stilvallende hobby's, LIFE-vs-FOCUS balans). Formuleert bevindingen via
 * Gemini en slaat ze op als Insight (LIFE → Insight-entity), met emitEvent
 * door de unified event-laag. Dedup op titel voorkomt herhaling.
 *
 * Trigger: scheduled daily 21:15 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();

    const [household, admin, contacts, hobbies, socialPlans, timeEntries, existingInsights] = await Promise.all([
      sr.entities.HouseholdItem.list("-created_date", 200).catch(() => []),
      sr.entities.AdminObligation.list("-due_date", 100).catch(() => []),
      sr.entities.Contact.list("-created_date", 200).catch(() => []),
      sr.entities.Hobby.list("-created_date", 200).catch(() => []),
      sr.entities.SocialPlan.filter({ status: "planned" }, "-created_date", 50).catch(() => []),
      sr.entities.TimeEntry.filter({}, "-created_date", 200).catch(() => []),
      listInsights(base44, { domain: "life", limit: 100 }),
    ]);

    const findings = [];

    // 1. Household routines overdue
    const overdueHouse = overdueItems(household, { field: "next_due" }).filter((h) => h.status !== "done" && h.kind === "routine");
    if (overdueHouse.length >= 2) {
      findings.push({ type: "pattern", category: "Risk", title: "Huishouden loopt achter", description: `${overdueHouse.length} routines zijn over de datum: ${overdueHouse.slice(0, 3).map((h) => h.title).join(", ")}. Plan een inhaalmoment.` });
    }

    // 2. Admin obligations due soon
    const dueAdmin = dueSoon(admin, { field: "due_date", days: 7 }).filter((a) => a.status === "open");
    if (dueAdmin.length) {
      findings.push({ type: "pattern", category: "Risk", title: "Administratie due deze week", description: `${dueAdmin.length} verplichting${dueAdmin.length !== 1 ? "en" : ""} binnen 7 dagen: ${dueAdmin.map((a) => `${a.title}${a.amount ? ` (€${a.amount})` : ""}`).join(", ")}.` });
    }

    // 3. Neglected life-contacts
    const lifeContacts = (contacts || []).filter((c) => !c.relationship_domain || c.relationship_domain === "life");
    const neglected = neglectedContacts(lifeContacts);
    if (neglected.length >= 2) {
      findings.push({ type: "pattern", category: "Suggestion", title: "Contacten verwaarloosd", description: `${neglected.length} LIFE-contact${neglected.length !== 1 ? "en" : ""} niet gesproken op cadans: ${neglected.slice(0, 3).map((c) => c.name).join(", ")}.` });
    }

    // 4. Quiet hobbies
    const quietHobbies = (hobbies || []).filter((h) => h.status === "active" && (h.activity_level === "active" || h.activity_level === "reactivating")).filter((h) => {
      const d = daysSince(h.last_activity_date);
      return d != null && d > 30;
    });
    if (quietHobbies.length) {
      findings.push({ type: "pattern", category: "Suggestion", title: "Hobby's worden stil", description: `${quietHobbies.length} hobby${quietHobbies.length !== 1 ? "s" : ""} al >30 dagen stil: ${quietHobbies.slice(0, 3).map((h) => h.title).join(", ")}. Eén kleine prikkel kan ze weer leven.` });
    }

    // 5. Stale social plans
    const stalePlans = (socialPlans || []).filter((p) => daysSince(p.created_date) > 14);
    if (stalePlans.length) {
      findings.push({ type: "pattern", category: "Follow-up", title: "Sociale plannen staan stil", description: `${stalePlans.length} plan${stalePlans.length !== 1 ? "nen" : ""} al >14 dagen ongepland. Bevestig of laat los.` });
    }

    // 6. Balance FOCUS vs LIFE vs SELF
    const focusMin = sumDomain(timeEntries, "focus");
    const lifeMin = sumDomain(timeEntries, "life");
    const selfMin = sumDomain(timeEntries, "self");
    const bal = domainBalance(focusMin, lifeMin, selfMin);
    if (bal.lifeNeglected) {
      findings.push({ type: "imbalance", category: "Trend", title: "LIFE wordt verwaarloosd", description: `Verdeling FOCUS ${bal.focusPct}% · LIFE ${bal.lifePct}% · SELF ${bal.selfPct}%. LIFE-tijd is klein — risico op uitdroging van relaties en huishouden.` });
    }

    if (!findings.length) {
      return Response.json({ ok: true, created: 0, findings: [], message: "Geen nieuwe LIFE-patronen." });
    }

    // Gemini herverwoordt menselijker
    let enriched = findings;
    try {
      const r = await geminiDecide({
        model: "gemini-3.5-flash-lite",
        prompt: `Je bent Giulia. Herverwoord elke titel + beschrijving korter, menselijker, in Salvo's stijl (droog, direct). Behoud type en category EXACT. Context-findings:\n${JSON.stringify(findings)}\n\nGeef UITSLUITEND een JSON-string met {"items":[...]}.`,
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
      if (!f?.title || dedupeByTitle(existingInsights, f.title)) continue;
      const ins = await createInsight(base44, {
        domain: "life", title: f.title, type: f.type, category: f.category,
        description: f.description, confidence: 0.6, source: "analyzeLifePatterns",
        existingInsights,
      });
      if (ins && !ins.skipped) {
        created++;
        await emitEvent(base44, { event_type: "LIFE_INSIGHT_CREATED", object_type: "Insight", object_id: ins.id, domain: "life", description: f.title, source: "analyzeLifePatterns" });
      }
    }

    return Response.json({ ok: true, created, findings_count: enriched.length, balance: bal });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

function sumDomain(entries, domain) {
  return (entries || []).filter((e) => e.domain === domain).reduce((s, e) => s + (e.duration_min || e.duration || 0), 0);
}