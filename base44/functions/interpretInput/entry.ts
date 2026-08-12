import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';

/**
 * interpretInput (Phase 2 — Ingestion & Routing).
 *
 * Cognitive entry point: neemt een ruw inkomend bericht (WhatsApp of Email),
 * haalt er via één gestructureerde Gemini-call intentie + entiteiten uit,
 * matcht naam/project aan bestaande Contact/Project records, maakt de juiste
 * Base44-entiteit aan (Task / CalendarEvent / Insight / Approval) en markeert
 * het bronbericht als verwerkt.
 *
 * Alle AI loopt via de eigen GEMINI_API_KEY (gemini-3.1-flash-lite) — geen
 * Base44 integration credits.
 *
 * Aanroep: { source: "whatsapp" | "email", message_id }  (of auto-detect).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));

    // ── Step 2.1: Data Retrieval ──────────────────────────────────────
    let source = body.source;            // "whatsapp" | "email"
    let sourceId = body.message_id || body.id;

    // Auto-detect als het expliciet wordt meegegeven
    if (!source) {
      if (body.whatsapp_message_id || body.entity === "WhatsAppMessage") source = "whatsapp";
      else if (body.email_id || body.entity === "Email") source = "email";
    }

    let record = null;
    if (source === "whatsapp" && sourceId) record = await sr.entities.WhatsAppMessage.get(sourceId).catch(() => null);
    else if (source === "email" && sourceId) record = await sr.entities.Email.get(sourceId).catch(() => null);

    // Geen id? Pak laatste ongelezen bericht (per bron) als fallback.
    if (!record) {
      if (!source || source === "whatsapp") {
        const list = await sr.entities.WhatsAppMessage.filter({ status: "unread" }, "-created_date", 1).catch(() => []);
        if (list[0]) { record = list[0]; source = "whatsapp"; }
      }
      if (!record && (!source || source === "email")) {
        const list = await sr.entities.Email.filter({ status: "unread", category: "important" }, "-created_date", 1).catch(() => []);
        if (list[0]) { record = list[0]; source = "email"; }
      }
    }
    if (!record) return Response.json({ ok: true, reason: "no unprocessed message" });

    const rawText = source === "email"
      ? `${record.subject || ""}\n\n${record.body || ""}`.trim()
      : (record.message || "").trim();
    if (!rawText) {
      await markProcessed(sr, source, record.id);
      return Response.json({ ok: true, reason: "empty message" });
    }

    // ── Step 2.2: LLM Processing (structured JSON extraction) ─────────
    const schema = {
      type: "object",
      properties: {
        intent: { type: "string", enum: ["task", "calendar", "information", "action_required"] },
        entities: {
          type: "object",
          properties: {
            person_name: { type: "string" },
            project_name: { type: "string" },
            date_time_reference: { type: "string" },
            urgency: { type: "string", enum: ["high", "medium", "low"] },
          },
        },
        extracted_action: { type: "string" },
        suggested_reply: { type: "string" },
      },
    };

    const systemText =
      "You are the ingestion engine for GIULIA OS. Your task is to extract structured entities from the incoming message. " +
      "Always return valid JSON adhering to the given schema. Use empty strings for absent values, never null. " +
      "date_time_reference must be an ISO8601 string when a date/time is mentioned, otherwise empty.";

    const out = await geminiDecide({
      prompt: `Extract structured entities from this incoming ${source === "email" ? "email" : "WhatsApp message"}.\n\nMessage:\n"""${rawText.slice(0, 4000)}"""`,
      schema,
      systemText: `${GIULIA_PERSONA}\n\n${systemText}`,
      temperature: 0.2,
    });
    if (!out) return Response.json({ ok: false, error: "LLM extraction failed", source, id: record.id }, { status: 500 });

    const intent = (out.intent || "").trim();
    const ents = out.entities || {};
    const personName = (ents.person_name || "").trim();
    const projectName = (ents.project_name || "").trim();
    const dtRef = (ents.date_time_reference || "").trim();
    const urgency = ["high", "medium", "low"].includes(ents.urgency) ? ents.urgency : "medium";
    const action = (out.extracted_action || "").trim();
    const reply = (out.suggested_reply || "").trim();

    // ── Step 2.3: Entity Resolution (context matching) ────────────────
    const contactId = personName ? await resolveContact(sr, personName) : null;
    const projectId = projectName ? await resolveProject(sr, projectName) : null;

    const created = [];

    // ── Step 2.4: Action Execution ────────────────────────────────────
    if (intent === "task" || intent === "action_required") {
      if (action) {
        const task = await sr.entities.Task.create({
          title: action,
          status: "todo",
          priority: urgency,
          deadline: dtRef || undefined,
          project_id: projectId || undefined,
          contact_id: contactId || undefined,
          delegated_to_giulia: false,
          agent_source: "interpretInput",
        }).catch(() => null);
        if (task) created.push({ type: "task", id: task.id });
      }
    }

    if (intent === "calendar" && dtRef) {
      const evt = await sr.entities.CalendarEvent.create({
        title: action || "Afspraak",
        start: dtRef,
        project_id: projectId || undefined,
        agent_source: "interpretInput",
      }).catch(() => null);
      if (evt) created.push({ type: "calendar", id: evt.id });
    }

    if (intent === "information" && action) {
      const ins = await sr.entities.Insight.create({
        title: action.slice(0, 120),
        content: rawText.slice(0, 2000),
        category: "Research",
        status: "new",
        confidence: 0.6,
        source: `interpretInput · ${source}`,
        project_id: projectId || undefined,
      }).catch(() => null);
      if (ins) created.push({ type: "insight", id: ins.id });
    }

    // Gatekeeper / Approval: als een reply voorgesteld wordt
    if (reply) {
      const actionType = source === "email" ? "email_reply" : "whatsapp_reply";
      const cat = source === "email" ? "email" : "whatsapp";
      const ap = await sr.entities.Approval.create({
        action_type: actionType,
        description: `Antwoorden aan ${personName || "contact"}${projectName ? ` · ${projectName}` : ""}.`,
        content: reply,
        status: "pending",
        category: cat,
        type: source === "email" ? "email" : "whatsapp",
        project_id: projectId || undefined,
        thread_id: record.thread_id || record.conversation_id || undefined,
        agent_source: "interpretInput",
        assignee: "salvo",
      }).catch(() => null);
      if (ap) created.push({ type: "approval", id: ap.id });
    }

    // ── Step 2.5: Mark as Processed ──────────────────────────────────
    await markProcessed(sr, source, record.id, { contact_id: contactId, project_id: projectId });

    return Response.json({ ok: true, source, id: record.id, intent, created });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ── helpers ───────────────────────────────────────────────────────────
async function resolveContact(sr, name) {
  const list = await sr.entities.Contact.list("-created_date", 200).catch(() => []);
  const n = name.toLowerCase();
  const match = list.find((c) => (c.name || "").toLowerCase().includes(n));
  return match ? match.id : null;
}

async function resolveProject(sr, name) {
  const list = await sr.entities.Project.list("-created_date", 200).catch(() => []);
  const n = name.toLowerCase();
  const match = list.find((p) => (p.title || "").toLowerCase().includes(n));
  return match ? match.id : null;
}

async function markProcessed(sr, source, id, extra = {}) {
  if (source === "whatsapp") {
    await sr.entities.WhatsAppMessage.update(id, {
      status: "read",
      ...(extra.contact_id ? { contact_id: extra.contact_id } : {}),
      ...(extra.project_id ? { project_id: extra.project_id } : {}),
    }).catch(() => null);
  } else if (source === "email") {
    await sr.entities.Email.update(id, {
      status: "read",
      triaged: true,
      ...(extra.contact_id ? { contact_id: extra.contact_id } : {}),
      ...(extra.project_id ? { project_id: extra.project_id } : {}),
    }).catch(() => null);
  }
}