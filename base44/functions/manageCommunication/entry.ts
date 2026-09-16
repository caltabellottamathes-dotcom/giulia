import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * manageCommunication — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Spiegelt NIEUWE emails/whatsapp naar Message-records (puur mechanisch, geen
 * AI nodig), en stuurt daarna het overzicht als signaal naar GIULIA-CONNECT
 * (chatWithGiulia). GIULIA-GIULIA beslist welke acties nodig zijn — replies
 * gaan ALTIJD via create_approval (nooit automatisch verstuurd).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [emails, wamsgs, existing] = await Promise.all([
      sr.entities.Email.filter({ status: "unread" }, "-created_date", 30).catch(() => []),
      sr.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }, "-created_date", 30).catch(() => []),
      sr.entities.Message.list("-created_date", 300).catch(() => []),
    ]);
    const seenG = new Set(existing.map((m) => m.gmail_message_id).filter(Boolean));
    const seenW = new Set(existing.map((m) => m.whatsapp_message_id).filter(Boolean));

    // Deterministisch spiegelen — geen AI nodig voor dit mechanische werk.
    // Domein 11: last_contact_date bijwerken na elke binnenkomende interactie.
    let mirrored = 0;
    for (const e of emails) {
      if (seenG.has(e.gmail_message_id || e.id)) continue;
      await sr.entities.Message.create({
        role: "incoming", direction: "incoming", channel: "email",
        content: `${e.subject || ""} — ${e.body || ""}`.slice(0, 1000),
        gmail_message_id: e.gmail_message_id || e.id,
        gmail_thread_id: e.gmail_thread_id || "",
        agent_source: "manageCommunication",
      }).catch(() => null);
      if (e.contact_id) await sr.entities.Contact.update(e.contact_id, { last_contact_date: new Date().toISOString() }).catch(() => {});
      mirrored++;
    }
    for (const w of wamsgs) {
      if (seenW.has(w.id)) continue;
      await sr.entities.Message.create({
        role: "incoming", direction: "incoming", channel: "whatsapp",
        content: String(w.message || "").slice(0, 500),
        whatsapp_message_id: w.id,
        agent_source: "manageCommunication",
      }).catch(() => null);
      if (w.contact_id) await sr.entities.Contact.update(w.contact_id, { last_contact_date: new Date().toISOString() }).catch(() => {});
      mirrored++;
    }

    if (!emails.length && !wamsgs.length) return Response.json({ ok: true, mirrored: 0, skipped: "geen nieuwe communicatie" });

    const context =
      `Ongelezen emails (${emails.length}):\n` + emails.slice(0, 15).map((e) => `- id:${e.id} | ${e.subject || "(geen)"} | van ${e.sender || "?"}`).join("\n") +
      `\n\nOngelezen WhatsApp (${wamsgs.length}):\n` + wamsgs.slice(0, 15).map((w) => `- id:${w.id} | ${String(w.message || "").slice(0, 100)}`).join("\n");
    const message =
      `Communicatie-scan: GIULIA mag NOOIT autonoom taken aanmaken (geen create_task). Een Taak is iets dat Salvo zelf aanmaakt of wat eerst met hem is afgestemd. ` +
      `Stel GEEN enkel bericht-concept voor — géén e-mail- en géén WhatsApp-antwoorden. Bericht-concepten maak je alléén op expliciet verzoek van Salvo zelf (chat/voice of de 'genereer antwoord'-knop). ` +
      `Signaleer alleen wat er speelt via report_to_salvo (belangrijke mails, dringende vragen), en gebruik create_notification uitsluitend bij een echte vraag die Salvo zelf moet beantwoorden. ` +
      `Behandel al-afgehandelde zaken (zoals betaalde/afgesloten CJIB-zaken) NIET opnieuw; als iets al gedaan is, doe dan niets.\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_communication", persist: false }).catch(() => null);

    return Response.json({ ok: true, mirrored });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}