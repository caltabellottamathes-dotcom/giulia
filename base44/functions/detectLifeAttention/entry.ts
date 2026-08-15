import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emitEvent } from '../../shared/eventEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';
import { notify } from '../../shared/notify.ts';
import { overdueItems, dueSoon, neglectedContacts, dedupeByTitle, daysSince } from '../../shared/domainEngine.ts';

/**
 * detectLifeAttention — proactieve LIFE-bewaking. Spiegelt detectSelfOverload
 * (SELF): signaleert wat NU aandacht verdient in de LIFE-laag — achterstallig
 * huishouden, naderende admin-deadlines, ernstig verwaarloosde contacten,
 * stilvallende hobby's. Volledig deterministisch. Creëert Insights +
 * Notifications via de unified helpers en emitEvent.
 *
 * Trigger: scheduled 12:30 & 16:30 Europe/Amsterdam (net na runProactivity).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();

    const [household, admin, contacts, hobbies, existingInsights] = await Promise.all([
      sr.entities.HouseholdItem.list("-created_date", 200).catch(() => []),
      sr.entities.AdminObligation.list("-due_date", 100).catch(() => []),
      sr.entities.Contact.list("-created_date", 200).catch(() => []),
      sr.entities.Hobby.list("-created_date", 200).catch(() => []),
      listInsights(base44, { domain: "life", limit: 50 }),
    ]);

    let signals = 0;
    const todayStr = now.toISOString().split("T")[0];

    // ── 1. Overdue household (vandaag of eerder, niet done) ───────────
    const overdueHouse = overdueItems(household, { field: "next_due", days: 0 }).filter((h) => h.status !== "done");
    if (overdueHouse.length >= 2) {
      const title = "Huishouden heeft inhaalschuld";
      if (!dedupeByTitle(existingInsights, title)) {
        const ins = await createInsight(base44, {
          domain: "life", title, type: "pattern", category: "Risk",
          description: `${overdueHouse.length} items over datum: ${overdueHouse.slice(0, 4).map((h) => h.title).join(", ")}.`,
          confidence: 0.8, source: "detectLifeAttention",
        });
        if (ins && !ins.skipped) {
          signals++;
          await emitEvent(base44, { event_type: "LIFE_OVERDUE_DETECTED", object_type: "HouseholdItem", object_id: overdueHouse[0].id, domain: "life", description: title, source: "detectLifeAttention" });
        }
      }
      await notify(base44, {
        title: "Huishouden loopt achter",
        message: `${overdueHouse.length} klusjes staan klaar. Wil je dat ik er 2 van inplanning?`,
        kind: "question", requires_response: true, related_route: "/life/household", agent_source: "detectLifeAttention", push: true,
      });
    }

    // ── 2. Admin due within 3 days ─────────────────────────────────────
    const urgentAdmin = dueSoon(admin, { field: "due_date", days: 3 }).filter((a) => a.status === "open");
    if (urgentAdmin.length) {
      const title = "Administratie dringt";
      if (!dedupeByTitle(existingInsights, title)) {
        const ins = await createInsight(base44, {
          domain: "life", title, type: "pattern", category: "Risk",
          description: `${urgentAdmin.length} verplichting${urgentAdmin.length !== 1 ? "en" : ""} binnen 3 dagen: ${urgentAdmin.map((a) => a.title).join(", ")}.`,
          confidence: 0.85, source: "detectLifeAttention",
        });
        if (ins && !ins.skipped) signals++;
      }
      await notify(base44, {
        title: "Admin deadline nadert",
        message: `${urgentAdmin.map((a) => a.title).join(", ")} moet deze week gedaan.`,
        kind: "remark", requires_response: false, related_route: "/life/personal-admin", agent_source: "detectLifeAttention", push: true,
      });
    }

    // ── 3. Severely neglected contacts (>2x desired frequency) ────────
    const lifeContacts = (contacts || []).filter((c) => !c.relationship_domain || c.relationship_domain === "life");
    const severe = (neglectedContacts(lifeContacts) || []).filter((c) => {
      if (!c.desired_frequency_days || !c.last_contact_date) return false;
      return daysSince(c.last_contact_date) >= c.desired_frequency_days * 2;
    });
    if (severe.length) {
      const title = "Contacten glijden weg";
      if (!dedupeByTitle(existingInsights, title)) {
        const ins = await createInsight(base44, {
          domain: "life", title, type: "pattern", category: "Suggestion",
          description: `${severe.length} contact${severe.length !== 1 ? "en" : ""} al lang niet gesproken: ${severe.slice(0, 3).map((c) => c.name).join(", ")}. Eén berichtje volstaat vaak.`,
          confidence: 0.7, source: "detectLifeAttention",
        });
        if (ins && !ins.skipped) signals++;
      }
      await notify(base44, {
        title: "Iemand mist je",
        message: `${severe[0].name} al ${daysSince(severe[0].last_contact_date)} dagen niet gesproken. Stuur een berichtje?`,
        kind: "question", requires_response: true, related_route: "/life/social-pulse", agent_source: "detectLifeAttention",
      });
    }

    // ── 4. Hobbies going quiet (>45 days, was active) ───────────────────
    const quietHobbies = (hobbies || []).filter((h) => h.status === "active" && (h.activity_level === "active" || h.activity_level === "reactivating") && daysSince(h.last_activity_date) > 45);
    if (quietHobbies.length) {
      const title = "Hobby verliest kleur";
      if (!dedupeByTitle(existingInsights, title)) {
        const ins = await createInsight(base44, {
          domain: "life", title, type: "pattern", category: "Suggestion",
          description: `${quietHobbies[0].title} al ${daysSince(quietHobbies[0].last_activity_date)} dagen stil. Eén klein moment deze week?`,
          confidence: 0.6, source: "detectLifeAttention",
        });
        if (ins && !ins.skipped) signals++;
      }
      await notify(base44, {
        title: `${quietHobbies[0].title} wacht`,
        message: `Al ${daysSince(quietHobbies[0].last_activity_date)} dagen niets met ${quietHobbies[0].title}. Zin om het deze week even op te pakken?`,
        kind: "question", requires_response: true, related_route: "/life/hobbies", agent_source: "detectLifeAttention",
      });
    }

    return Response.json({
      ok: true, signals,
      overdue_household: overdueHouse.length,
      urgent_admin: urgentAdmin.length,
      neglected_contacts: severe.length,
      quiet_hobbies: quietHobbies.length,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}