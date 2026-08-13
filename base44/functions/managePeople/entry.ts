import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * managePeople — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Detecteert contacten waar lang geen contact mee is geweest en laat
 * GIULIA-GIULIA (via chatWithGiulia) beslissen of een follow-up nodig is.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const contacts = await sr.entities.Contact.list("-created_date", 300).catch(() => []);
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const stale = contacts.filter((c) => {
      if (!c.last_contact_date) return false;
      return now - new Date(c.last_contact_date).getTime() >= 30 * dayMs;
    });

    if (!stale.length) return Response.json({ ok: true, stale: 0, skipped: "geen contacten met achterstallig contact" });

    const context = `Contacten met >30 dagen geen contact (${stale.length}):\n` +
      stale.slice(0, 20).map((c) => `- id:${c.id} | ${c.name} | ${c.company || ""} | laatste: ${c.last_contact_date}`).join("\n");
    const message = `Personen-scan: bepaal of een van deze contacten een follow-up verdient. Externe reikwijdte (mail/whatsapp/bellen) altijd via create_approval.\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_people", persist: false }).catch(() => null);

    return Response.json({ ok: true, stale: stale.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}