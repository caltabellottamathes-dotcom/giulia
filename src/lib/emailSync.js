import { base44 } from "@/api/base44Client";

/**
 * syncInbox — haalt emails op via de externe IMAP-bridge en schrijft
 * nieuwe berichten naar de Email-entity (geen duplicaten op basis van uid).
 */
export async function syncInbox({ limit = 30 } = {}) {
  const res = await base44.functions.invoke("fetchPrivateEmails", { limit });
  const fetched = res?.emails || [];
  if (!fetched.length) return { created: 0, total: 0 };

  const existing = await base44.entities.Email.filter({ folder: "inbox" });
  const existingUids = new Set((existing || []).map((e) => e.gmail_message_id).filter(Boolean));
  const newOnes = fetched.filter((e) => !existingUids.has(e.uid));

  if (newOnes.length) {
    await base44.entities.Email.bulkCreate(
      newOnes.map((e) => ({
        sender: e.sender || "(onbekend)",
        sender_email: e.sender_email || "",
        subject: e.subject || "(geen onderwerp)",
        timestamp: e.timestamp,
        status: e.unread ? "unread" : "read",
        folder: "inbox",
        gmail_message_id: e.uid,
      }))
    );
  }
  return { created: newOnes.length, total: fetched.length };
}