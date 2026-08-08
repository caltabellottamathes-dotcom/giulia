import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";

/**
 * autoDraftWhatsApp — when a new incoming WhatsApp message arrives, Giulia
 * reads the conversation, prepares a short reply via the Giulia superagent,
 * and stores it as a GiuliaDraft (type: whatsapp, awaiting_approval) linked
 * to the contact + incoming message. Salvo approves before anything sends.
 * No WhatsApp Business API needed — drafting only. (Real send/receive needs
 * the Cloud API; this layer is ready for when it's connected.)
 */
const AGENT_ID = "6a6cc0011ab9e3b32cfc1057";
const DEFAULT_CONVERSATION = "6a6cc0034bc0607c481f1602";
const BASE_URL = "https://app.base44.com/api/agents";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const messageId = body.message_id || body.id;
    if (!messageId) return Response.json({ error: "message_id required" }, { status: 400 });

    const incoming = await base44.asServiceRole.entities.WhatsAppMessage.get(messageId);
    if (!incoming) return Response.json({ error: "message not found" }, { status: 404 });
    if (incoming.direction !== "received") return Response.json({ skipped: "not incoming" });

    const contactId = incoming.contact_id || "";
    const allMsgs = await base44.asServiceRole.entities.WhatsAppMessage.filter({ contact_id: contactId });
    const convo = allMsgs
      .sort((a, b) => new Date(a.timestamp || a.created_date || 0) - new Date(b.timestamp || b.created_date || 0))
      .slice(-8);

    let contactName = "";
    if (contactId) {
      try {
        const c = await base44.asServiceRole.entities.Contact.get(contactId);
        contactName = c?.name || "";
      } catch {}
    }

    const history = convo
      .map((m) => `${m.direction === "received" ? "Binnen" : "Uit"}: ${m.message}`)
      .join("\n");
    const prompt =
      `Je bent Giulia, een persoonlijke AI-assistent. Bereid een kort, naturel, vriendelijk WhatsApp-antwoord voor` +
      `${contactName ? " aan " + contactName : ""}. Gesprek tot nu toe:\n${history}\n\n` +
      `Geef alleen het te versturen bericht, in het Nederlands, zonder aanhalingstekens of uitleg.`;

    const apiKey = secrets.get("BASE44_SERVICE_TOKEN");
    let draftText = "";
    if (apiKey) {
      const r = await fetch(`${BASE_URL}/${AGENT_ID}/conversations/${DEFAULT_CONVERSATION}/messages`, {
        method: "POST",
        headers: { api_key: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ content: prompt }),
      });
      if (r.ok) {
        const data = await r.json();
        draftText = (data.content || "").trim();
      }
    }
    if (!draftText) return Response.json({ error: "Giulia kon geen concept maken" }, { status: 500 });

    // Don't stack duplicate drafts for the same incoming message
    const existing = await base44.asServiceRole.entities.GiuliaDraft.filter({
      type: "whatsapp",
      contact_id: contactId,
      context: messageId,
      status: "awaiting_approval",
    });
    if (existing && existing.length) return Response.json({ skipped: "draft exists", draft_id: existing[0].id });

    const draft = await base44.asServiceRole.entities.GiuliaDraft.create({
      type: "whatsapp",
      source: "Giulia · auto",
      content: draftText,
      context: messageId,
      status: "awaiting_approval",
      contact_id: contactId,
    });

    try {
      await base44.asServiceRole.entities.WhatsAppMessage.update(messageId, { giulia_suggested: true });
    } catch {}

    return Response.json({ ok: true, draft_id: draft.id, content: draftText });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}