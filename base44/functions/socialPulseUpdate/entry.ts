import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computeSocialPulseState, computePersonalTimeAvailability, computeIntensitySeries } from '../../shared/socialEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * socialPulseUpdate — §19.4. Herberekent de actuele Social Pulse-toestand
 * (§6.3) uit meaningful interactions + plans + invitations + beschikbare
 * tijd. De live UI leest dezelfde onderliggende entiteiten (§22) — dit
 * proces bewaakt alleen wanneer de toestand zelf een signaal waard is.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const cutoff7 = Date.now() - 7 * 86400000;
    const [whatsapps, emails, plans, blocks, intentions, existingInsights] = await Promise.all([
      sr.entities.WhatsAppMessage.filter({ direction: "sent" }, "-timestamp", 300).catch(() => []),
      sr.entities.Email.filter({}, "-timestamp", 300).catch(() => []),
      sr.entities.SocialPlan.list("-created_date", 100).catch(() => []),
      sr.entities.PersonalTimeBlock.list("-start", 50).catch(() => []),
      sr.entities.SocialIntention.filter({ status: "open", kind: "respond_invitation" }).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    const meaningfulCount = whatsapps.filter((m) => new Date(m.timestamp).getTime() >= cutoff7).length
      + emails.filter((e) => (e.folder === "sent" || e.status === "sent") && new Date(e.timestamp).getTime() >= cutoff7).length;
    const activePlans = plans.filter((p) => ["proposed", "planned", "confirmed"].includes(p.status)).length;
    const openInvitations = intentions.length;
    const { availableMin } = computePersonalTimeAvailability(blocks, []);
    const series = computeIntensitySeries(
      whatsapps.filter((m) => new Date(m.timestamp).getTime() >= Date.now() - 56 * 86400000).map((m) => m.timestamp), 8
    );
    const baselineWeekly = series.slice(0, 6).reduce((s, v) => s + v, 0) / 6 || null;
    const pulse = computeSocialPulseState({ meaningfulCount, activePlans, openInvitations, availableMin, baselineWeekly });

    if (pulse === "OVERLOADED" || pulse === "QUIETER_THAN_USUAL") {
      const title = pulse === "OVERLOADED" ? "Social calendar is overloaded" : "Social world is quieter than usual";
      await createInsight(base44, {
        domain: "life", title, type: "pattern", category: pulse === "OVERLOADED" ? "Risk" : "Suggestion",
        description: pulse === "OVERLOADED"
          ? `${activePlans} active social plans against ${availableMin}min of available time today.`
          : `${meaningfulCount} meaningful interactions this week vs a baseline of ~${Math.round(baselineWeekly || 0)}.`,
        confidence: 0.6, source: "socialPulseUpdate", existingInsights,
      });
    }
    return Response.json({ ok: true, pulse, meaningfulCount, activePlans, openInvitations, availableMin });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}