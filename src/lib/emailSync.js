import { base44 } from "@/api/base44Client";

/**
 * syncInbox — haalt emails op via de externe IMAP-bridge en schrijft
 * nieuwe berichten naar de Email-entity (geen duplicaten op basis van uid).
 * Haalt DIRECT ook de volledige inhoud (body) op voor elke nieuwe email,
 * zodat de inhoud altijd beschikbaar is zonder extra klik.
 * Controleert ALLE folders (inclusief archived/deleted) voor bestaande uids
 * — verwijderde of gearchiveerde mails worden zo niet opnieuw aangemaakt.
 */
export async function syncInbox({ limit = 30 } = {}) {
  const res = await base44.functions.invoke("fetchPrivateEmails", { limit });
  const fetched = res?.emails || [];
  if (!fetched.length) return { created: 0, total: 0 };

  // Controleer ALLE emails (elke folder) voor bestaande uids — verwijderde
  // en gearchiveerde mails blijven zo hun uid behouden en worden niet
  // opnieuw opgehaald.
  const existing = await base44.entities.Email.filter({}, "-created_date", 500).catch(() => []);
  const existingUids = new Set((existing || []).map((e) => e.gmail_message_id).filter(Boolean));
  const newOnes = fetched.filter((e) => !existingUids.has(e.uid));

  if (newOnes.length) {
    const created = await base44.entities.Email.bulkCreate(
      newOnes.map((e) => ({
        sender: e.sender || "(onbekend)",
        sender_email: e.sender_email || "",
        subject: e.subject || "(geen onderwerp)",
        timestamp: e.timestamp,
        status: e.unread ? "unread" : "read",
        folder: "inbox",
        gmail_message_id: e.uid,
      }))
    ).catch(() => []);

    // Haal de inhoud op voor elke nieuwe email — in batches van 5 om de
    // bridge niet te overbelasten.
    const records = Array.isArray(created) ? created : [];
    for (let i = 0; i < records.length; i += 5) {
      const batch = records.slice(i, i + 5);
      await Promise.all(batch.map(async (rec) => {
        if (!rec?.id || !rec?.gmail_message_id) return;
        try {
          const bodyRes = await base44.functions.invoke("fetchPrivateEmailBody", { uid: rec.gmail_message_id });
          const text = bodyRes?.text || bodyRes?.html || "(geen inhoud)";
          if (text && text !== "(geen inhoud)") {
            await base44.entities.Email.update(rec.id, { body: text }).catch(() => {});
          }
        } catch { /* ignore body fetch errors */ }
      }));
    }
  }
  return { created: newOnes.length, total: fetched.length };
}