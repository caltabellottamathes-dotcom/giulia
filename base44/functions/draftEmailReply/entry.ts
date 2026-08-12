import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide } from "../../shared/gemini.ts";
import { createApproval } from "../../shared/codeAgent.ts";

/**
 * draftEmailReply — laat Giulia een concept-antwoord schrijven op een email.
 * Leest de geselecteerde email, gebruikt BYOK Gemini voor het concept, en slaat
 * het op als een Email met giulia_draft=true in folder "giulia_drafts" zodat het
 * bestaande "Goedkeuren & Versturen"-traject het oppikt. Stuurt NOOIT zelf.
 */
const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "Concept-antwoord in naam van Salvo. Nederlands, kort, warm, concreet. Alleen de body, geen aanhef-regels zoals 'Beste'." },
    note: { type: "string", description: "Korte interne notitie (1 zin) waarom dit antwoord." },
  },
  required: ["reply"],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email_id = body.email_id || body.id;
    if (!email_id) return Response.json({ error: "email_id required" }, { status: 400 });

    const email = await base44.entities.Email.get(email_id).catch(() => null);
    if (!email) return Response.json({ error: "email not found" }, { status: 404 });

    const prompt =
      `Je schrijft een concept-antwoord in naam van Salvo Caltabellotta.\n\n` +
      `Oorspronkelijke email:\nVan: ${email.sender || "?"} <${email.sender_email || ""}>\n` +
      `Onderwerp: ${email.subject || "(geen)"}\n` +
      `Inhoud:\n${String(email.body || "").slice(0, 2500)}\n\n` +
      `Schrijf een passend antwoord: kort, warm, concreet, geen onnodige formaliteit. Eén heldere reactie.`;

    const result = await geminiDecide({
      prompt,
      schema: DRAFT_SCHEMA,
      systemText: "Je schrijft emails in naam van Salvatore Caltabellotta, interior architect & designer in Maastricht. Stijl: kort, warm, concreet, geen opsmuk, geen SaaS-taal.",
    });
    const reply = result?.reply || "Bedankt voor je bericht — ik kom zo snel mogelijk bij je terug.";

    const draft = await base44.entities.Email.create({
      subject: email.subject || "(geen onderwerp)",
      body: reply,
      sender: email.sender || "",
      sender_email: email.sender_email || "",
      recipients: email.sender_email ? [email.sender_email] : [],
      status: "draft",
      folder: "giulia_drafts",
      giulia_draft: true,
      context: result?.note || "Concept door Giulia",
      thread_id: email.thread_id || "",
      project_id: email.project_id || undefined,
      contact_id: email.contact_id || undefined,
    }).catch(() => null);

    await createApproval(base44, "email", `Concept antwoord aan ${email.sender || "?"}`, reply, result?.note || "Concept door Giulia — wacht op goedkeuring.", "salvo", {
      target: email.sender_email || email.sender || "",
      proposed_action: { to: email.sender_email || "", subject: email.subject || "(geen onderwerp)", body: reply, original_email_id: email.id || "" },
      thread_id: email.thread_id || "",
      project_id: email.project_id || "",
    });

    return Response.json({ ok: !!draft, draft_id: draft?.id || null, reply, note: result?.note || "" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}