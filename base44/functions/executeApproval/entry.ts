import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * executeApproval — voert een goedgekeurde (of verworpen) actie echt uit.
 *
 *   action: "approve" | "reject" | "edit"
 *   edit:   { body }  (alleen bij "edit" — overschrijft de concept-body)
 *
 * Gedrag per type:
 *  - email:     bij "approve" wordt de mail via sendGmail verzonden
 *               (to/subject/body uit proposed_action of target). Status → "executed".
 *  - task:      de taak is al aangemaakt. "approve" → status "approved" (taak blijft).
 *               "reject" → de automatisch aangemaakte taak (target = task_id) wordt gewist.
 *  - whatsapp / calendar / other: status → "approved" / "discarded".
 *
 * Resultaat: { ok, executed, detail }.
 */
function parseMeta(ap) {
  if (!ap?.proposed_action) return {};
  if (typeof ap.proposed_action === "object") return ap.proposed_action;
  try { return JSON.parse(ap.proposed_action); } catch { return {}; }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const sr = base44.asServiceRole;

    const body = await req.json();
    const { approval_id, action } = body;
    if (!approval_id || !action) {
      return Response.json({ error: "approval_id + action required" }, { status: 400 });
    }
    const edit = body.edit || null;

    const ap = await sr.entities.Approval.get(approval_id).catch(() => null);
    if (!ap) return Response.json({ error: "approval not found" }, { status: 404 });

    // Guard: alleen pending of edited mogen nog worden uitgevoerd.
    if (ap.status !== "pending" && ap.status !== "edited") {
      return Response.json({ ok: false, executed: "skipped", detail: "Approval already processed." });
    }

    // EDIT — pas de concept-body aan, daarna direct uitvoeren (approve-pad).
    if (action === "edit" && edit?.body != null) {
      await sr.entities.Approval.update(approval_id, { content: edit.body, status: "edited" }).catch(() => {});
      ap.content = edit.body;
    }

    const meta = parseMeta(ap);

    if (action === "reject") {
      // Wis de automatisch aangemaakte taak bij een task-approval.
      if (ap.type === "task" && ap.target) {
        await sr.entities.Task.delete(ap.target).catch(() => {});
      }
      await sr.entities.Approval.update(approval_id, { status: "discarded" }).catch(() => {});
      return Response.json({ ok: true, executed: "discarded" });
    }

    // ALREADY_DONE — Salvo heeft dit zelf al afgehandeld, buiten Giulia om.
    // Geen actie uitvoeren, alleen markeren zodat het niet blijft terugkomen.
    if (action === "already_done") {
      await sr.entities.Approval.update(approval_id, { status: "already_done" }).catch(() => {});
      if (ap.thread_id) await sr.entities.Thread.update(ap.thread_id, { status: "resolved", needs_info: false }).catch(() => {});
      return Response.json({ ok: true, executed: "already_done" });
    }

    // action === approve (of edit→approve)
    if (ap.type === "email") {
      const to = meta.to || ap.target || "";
      const subject = meta.subject || ap.title || "(geen onderwerp)";
      const messageBody = ap.content || meta.body || "";
      if (!to) {
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "email", error: "geen ontvanger", detail: "Approval gemarkeerd goedgekeurd, maar geen ontvanger bekend — verstuur handmatig." });
      }
      try {
        const sent = await base44.functions.invoke("sendGmail", { to, subject, message: messageBody });
        if (sent && sent.sent) {
          await sr.entities.Approval.update(approval_id, { status: "executed" }).catch(() => {});
          if (ap.thread_id) await sr.entities.Thread.update(ap.thread_id, { status: "resolved", needs_info: false }).catch(() => {});
          return Response.json({ ok: true, executed: "email", detail: `Verstuurd aan ${to}` });
        }
        // sendGmail faalde — bewaar goedkeuring maar markeer niet als uitgevoerd.
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "email", error: "send failed", detail: sent?.error || "Verzenden via Gmail mislukt." });
      } catch (e) {
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "email", error: String(e.message || e) });
      }
    }

    if (ap.type === "task") {
      if (ap.assignee === "giulia") {
        // Giulia voert uit → voltooide taak voor het archief, approval uitgevoerd.
        try {
          await sr.entities.Task.create({
            title: meta.title || ap.title || "Giulia-taak",
            description: meta.description || ap.content || "",
            priority: meta.priority || "medium",
            ...(meta.deadline ? { deadline: meta.deadline } : {}),
            ...(meta.project_id ? { project_id: meta.project_id } : {}),
            status: "completed",
            delegated_to_giulia: true,
            agent_source: "giulia",
          });
        } catch { /* ignore */ }
        await sr.entities.Approval.update(approval_id, { status: "executed" }).catch(() => {});
        return Response.json({ ok: true, executed: "task", detail: "Giulia heeft het voltooid" });
      }
      // Salvo-taak-goedkeuring (oud pad met target-taak): behoud.
      await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
      return Response.json({ ok: true, executed: "task", detail: "Taak goedgekeurd" });
    }

    // calendar_invite — maak een CalendarEvent aan (echte uitvoering).
    if (ap.type === "calendar") {
      const title = meta.title || ap.title || "Afspraak";
      const start = meta.start || meta.date || "";
      if (!start) {
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "calendar", error: "geen starttijd", detail: "Approval goedgekeurd, maar geen starttijd bekend — plan handmatig." });
      }
      try {
        await sr.entities.CalendarEvent.create({
          title,
          description: ap.content || meta.description || "",
          start,
          end: meta.end || start,
          location: meta.location || "",
          participants: meta.participants || "",
          project_id: ap.project_id || meta.project_id || undefined,
          status: "confirmed",
          agent_source: "executeApproval",
        });
        await sr.entities.Approval.update(approval_id, { status: "executed" }).catch(() => {});
        if (ap.thread_id) await sr.entities.Thread.update(ap.thread_id, { status: "resolved", needs_info: false }).catch(() => {});
        return Response.json({ ok: true, executed: "calendar", detail: "Agendagedeelte toegevoegd" });
      } catch (e) {
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "calendar", error: String(e.message || e) });
      }
    }

    if (ap.type === "whatsapp") {
      const to = meta.to || ap.target || "";
      const messageBody = ap.content || meta.body || "";
      const contactId = ap.thread_id || meta.contact_id || "";
      if (!messageBody) {
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "whatsapp", error: "geen bericht", detail: "Approval goedgekeurd, maar geen berichtinhoud." });
      }
      try {
        const sent = await base44.functions.invoke("sendWhatsApp", { to, contact_id: contactId, message: messageBody });
        if (sent && sent.ok) {
          await sr.entities.Approval.update(approval_id, { status: "executed" }).catch(() => {});
          if (ap.thread_id) await sr.entities.Thread.update(ap.thread_id, { status: "resolved", needs_info: false }).catch(() => {});
          return Response.json({ ok: true, executed: "whatsapp", detail: "Verzonden" });
        }
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "whatsapp", error: "send failed", detail: (sent && sent.error) || "Verzenden via WhatsApp mislukt." });
      } catch (e) {
        await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
        return Response.json({ ok: false, executed: "whatsapp", error: String(e.message || e) });
      }
    }

    // other — alleen status wijzigen.
    await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
    return Response.json({ ok: true, executed: ap.type || "other", detail: "Goedgekeurd" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}