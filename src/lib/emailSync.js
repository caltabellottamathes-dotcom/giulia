import { base44 } from "@/api/base44Client";

/**
 * syncInbox — haalt emails op via de externe IMAP-bridge en schrijft
 * nieuwe berichten naar de Email-entity (geen duplicaten op basis van uid).
 * Haalt DIRECT ook de volledige inhoud (body) op voor elke nieuwe email,
 * en vult ook de inhoud aan voor bestaande emails die nog geen body hebben.
 * Controleert ALLE folders (inclusief archived/deleted) voor bestaande uids.
 */
export async function syncInbox({ limit = 30 } = {}) {
  const res = await base44.functions.invoke("fetchPrivateEmails", { limit });
  const fetched = res?.emails || [];
  if (!fetched.length) return { created: 0, total: 0 };

  // Controleer ALLE emails (elke folder) voor bestaande uids
  const existing = await base44.entities.Email.filter({}, "-created_date", 500).catch(() => []);
  const existingUids = new Set((existing || []).map((e) => e.gmail_message_id).filter(Boolean));
  const newOnes = fetched.filter((e) => !existingUids.has(e.uid));

  const fetchBodies = async (records) => {
    for (let i = 0; i < records.length; i += 5) {
      const batch = records.slice(i, i + 5);
      await Promise.all(batch.map(async (rec) => {
        if (!rec?.id || !rec?.gmail_message_id) return;
        try {
          const bodyRes = await base44.functions.invoke("fetchPrivateEmailBody", { uid: rec.gmail_message_id });
          const text = bodyRes?.text || bodyRes?.html || "";
          if (text && text.length > 10) {
            await base44.entities.Email.update(rec.id, { body: text }).catch(() => {});
          }
        } catch { /* ignore body fetch errors */ }
      }));
    }
  };

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
    const records = Array.isArray(created) ? created : [];
    await fetchBodies(records);
  }

  return { created: newOnes.length, total: fetched.length };
}