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

    // ── Chat branch: free-text message from the in-app chat ────────────
    // Classificeer, capture entiteiten, en antwoord als Giulia.
    if (body.message && !body.source && !body.message_id && !body.id && !body.entity) {
      return await classifyChat(base44, String(body.message).trim(), Array.isArray(body.history) ? body.history : []);
    }

    // ── Step 2.1: Data Retrieval ──────────────────────────────────────
    let source = body.source;            // "whatsapp" | "email"
    let sourceId = body.message_id || body.id;

    // Auto-detect als het expliciet wordt meegegeven
    if (!source) {
      if (body.whatsapp_message_id || body.entity === "WhatsAppMessage") source = "whatsapp";
      else if (body.email_id || body.entity === "Email") source = "email";
    }

    // ── Quick command (Tauri command-palette): free-text direct ──────────
    let record = null;
    let rawText = "";
    let isCommand = source === "command" && body.text && String(body.text).trim() !== "";
    if (isCommand) {
      rawText = String(body.text).trim().slice(0, 4000);
    } else {
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

      rawText = source === "email"
        ? `${record.subject || ""}\n\n${record.body || ""}`.trim()
        : (record.message || "").trim();
    }

    if (!rawText) {
      if (!isCommand) await markProcessed(sr, source, record.id);
      return Response.json({ ok: true, reason: "empty message" });
    }

    // ── Step 2.2: LLM Processing (structured JSON extraction) ─────────
    const schema = {
      type: "object",
      properties: {
        intent: { type: "string", enum: ["task", "calendar", "information", "action_required", "missing_info", "calendar_change"] },
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
        is_complex: { type: "boolean" },
        sub_tasks: { type: "array", items: { type: "string" } },
        clarification_question: { type: "string" },
      },
    };

    const systemText =
      "You are the ingestion engine for GIULIA OS. Extract structured entities from the incoming message. " +
      "Always return valid JSON adhering to the given schema. Use empty strings for absent values, never null. " +
      "date_time_reference must be an ISO8601 string when a date/time is mentioned, otherwise empty.\n\n" +
      "TASK-SPLITTING: If the user's input implies a multi-step project or a task requiring more than 2 hours of work " +
      '(e.g. "Prepare the Vivant presentation"), set is_complex=true and put 3-5 logical sub-task titles in sub_tasks. ' +
      "Do NOT set a single extracted_action in that case — only sub_tasks.\n" +
      "MISSING-INFO: If the requested action is unactionable because critical information is missing " +
      '(e.g. recipient unknown, or document unnamed like "Send the document this afternoon"), set intent="missing_info" ' +
      "and provide a concise Dutch clarification_question.\n" +
      'CONFLICT: If the message asks to change/reschedule an existing appointment, set intent="calendar_change" ' +
      "and put the requested new time in entities.date_time_reference.";

    const out = await geminiDecide({
      model: "gemini-3.5-flash",
      prompt: `Extract structured entities from this incoming ${source === "email" ? "email" : source === "command" ? "quick command" : "WhatsApp message"}.\n\nMessage:\n"""${rawText.slice(0, 4000)}"""`,
      schema,
      systemText: `${GIULIA_PERSONA}\n\n${systemText}`,
      temperature: 0.2,
    });
    if (!out) return Response.json({ ok: false, error: "LLM extraction failed", source, id: record?.id || null }, { status: 500 });

    const intent = (out.intent || "").trim();
    const ents = out.entities || {};
    const personName = (ents.person_name || "").trim();
    const projectName = (ents.project_name || "").trim();
    const dtRef = (ents.date_time_reference || "").trim();
    const urgency = ["high", "medium", "low"].includes(ents.urgency) ? ents.urgency : "medium";
    const action = (out.extracted_action || "").trim();
    const reply = (out.suggested_reply || "").trim();
    const isComplex = out.is_complex === true;
    const subTasks = Array.isArray(out.sub_tasks) ? out.sub_tasks.map((s) => String(s).trim()).filter(Boolean) : [];
    const clarification = (out.clarification_question || "").trim();

    // ── Step 2.3: Entity Resolution (context matching) ────────────────
    const contactId = personName ? await resolveContact(sr, personName) : null;
    const projectId = projectName ? await resolveProject(sr, projectName) : null;

    const created = [];

    // ── Step 2.4a: Missing-info → vraag terug, halt ──────────────────
    if (intent === "missing_info") {
      const question = clarification ||
        "Ik heb nog wat informatie nodig om dit uit te voeren. Kun je de ontbrekende details aanvullen?";
      // Achtergrond blijft stil in de chat — opent een Thread (needs_info) i.p.v.
      // een bericht in de in-app chat te posten.
      await sr.entities.Thread.create({
        title: `Info nodig: ${(personName || record?.subject || rawText || "").slice(0, 60)}`,
        type: source === "email" ? "email" : "whatsapp",
        status: "open",
        needs_info: true,
        person_id: contactId || undefined,
        project_id: projectId || undefined,
        channel: source,
        summary: question.slice(0, 280),
        last_message_date: new Date().toISOString(),
      }).catch(() => null);
      await markProcessed(sr, source, record?.id, { contact_id: contactId, project_id: projectId });
      return Response.json({ ok: true, source, id: record?.id || null, intent, clarification: question });
    }

    // ── Step 2.4b: Conflict resolution (calendar change) ─────────────
    if (intent === "calendar_change") {
      const conflict = await resolveCalendarConflict(sr, { contactId, projectId, dtRef, action, personName });
      if (conflict.created) created.push({ type: "approval", id: conflict.created });
    }

    // ── Step 2.4c: Action execution ──────────────────────────────────
    if (intent === "task" || intent === "action_required") {
      if (isComplex && subTasks.length >= 2) {
        // Task-Splitter: keten sub-tasks met dependencies (parent_task_id)
        let prevId = null;
        for (const sub of subTasks) {
          const t = await sr.entities.Task.create({
            title: sub,
            status: prevId ? "waiting" : "todo",
            parent_task_id: prevId || undefined,
            priority: urgency,
            deadline: dtRef || undefined,
            project_id: projectId || undefined,
            contact_id: contactId || undefined,
            delegated_to_giulia: false,
            agent_source: "interpretInput",
          }).catch(() => null);
          if (t) { created.push({ type: "subtask", id: t.id }); prevId = t.id; }
        }
      } else if (action) {
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

    // Gatekeeper / Approval: als een reply voorgesteld wordt (niet bij quick
    // command). Dedup: maak GEEN nieuwe approval aan als er al een pending of
    // uitgevoerde approval bestaat voor dezelfde actie + thread — voorkomt dat
    // dezelfde vraag elke cyclus opnieuw terugkeert.
    if (reply && !isCommand) {
      const actionType = source === "email" ? "email_reply" : "whatsapp_reply";
      const cat = source === "email" ? "email" : "whatsapp";
      const tId = record.thread_id || record.conversation_id || undefined;
      let ap = null;
      if (tId) {
        const existing = await sr.entities.Approval.filter({ action_type: actionType, thread_id: tId }).catch(() => []);
        const dup = existing.find((a) => ["pending", "executed", "approved", "already_done"].includes(a.status));
        if (!dup) {
          ap = await sr.entities.Approval.create({
            action_type: actionType,
            description: `Antwoorden aan ${personName || "contact"}${projectName ? ` · ${projectName}` : ""}.`,
            content: reply, status: "pending", category: cat,
            type: source === "email" ? "email" : "whatsapp",
            project_id: projectId || undefined, thread_id: tId,
            agent_source: "interpretInput", assignee: "salvo",
          }).catch(() => null);
        }
      } else {
        ap = await sr.entities.Approval.create({
          action_type: actionType,
          description: `Antwoorden aan ${personName || "contact"}${projectName ? ` · ${projectName}` : ""}.`,
          content: reply, status: "pending", category: cat,
          type: source === "email" ? "email" : "whatsapp",
          project_id: projectId || undefined,
          agent_source: "interpretInput", assignee: "salvo",
        }).catch(() => null);
      }
      if (ap) created.push({ type: "approval", id: ap.id });
    }

    // ── Step 2.5: Mark as Processed ──────────────────────────────────
    if (!isCommand) await markProcessed(sr, source, record.id, { contact_id: contactId, project_id: projectId });

    return Response.json({ ok: true, source, id: isCommand ? null : record?.id, intent, created });
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

// ── Phase 7: Conflict resolution — calendar change ─────────────────────
// Verwijdert stale pending calendar_invite approvals voor dezelfde context
// en stelt de nieuwe gewenste tijd voor als een pending Approval (Gatekeeper).
async function resolveCalendarConflict(sr, { contactId, projectId, dtRef, action, personName }) {
  const pending = await sr.entities.Approval.filter({
    action_type: "calendar_invite",
    status: "pending",
  }).catch(() => []);
  const stale = pending.filter((a) =>
    (contactId && a.target === contactId) || (projectId && a.project_id === projectId)
  );
  for (const a of stale) {
    await sr.entities.Approval.delete(a.id).catch(() => null);
  }
  const ap = await sr.entities.Approval.create({
    title: `Verzetten afspraak${personName ? ` · ${personName}` : ""}`,
    action_type: "calendar_invite",
    target: contactId || undefined,
    description: `Contact vraagt om een afspraak te verzetten${dtRef ? ` naar ${dtRef}` : ""}.${action ? ` ${action}` : ""}`.trim(),
    status: "pending",
    category: "calendar",
    type: "calendar",
    project_id: projectId || undefined,
    agent_source: "interpretInput",
    assignee: "salvo",
  }).catch(() => null);
  return { removed: stale.length, created: ap ? ap.id : null };
}

// ── Chat classifier — free-text message from the in-app chat ──────────
// GEEN eigen Gemini-brein meer hier — delegeert volledig naar GIULIA-CONNECT
// (chatWithGiulia), zodat er nog maar ÉÉN brein is (GIULIA-GIULIA) voor elk
// chat-entry-point in de app (ChatWindow én de losse Chat-pagina).
async function classifyChat(base44, message) {
  const res = await base44.functions.invoke("chatWithGiulia", { message, persist: true })
    .catch((e) => ({ error: String((e && e.message) || e) }));

  if (res && res.error) return Response.json({ ok: false, error: res.error }, { status: 500 });

  return Response.json({ ok: true, giulia_response: res.response, created: res.actions_executed || [] });
}