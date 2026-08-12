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
      // Taak bestaat al (aangemaakt bij voorstel). Goedkeuren = behouden.
      await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
      return Response.json({ ok: true, executed: "task", detail: "Taak goedgekeurd en behouden" });
    }

    // whatsapp / calendar / other — alleen status wijzigen.
    await sr.entities.Approval.update(approval_id, { status: "approved" }).catch(() => {});
    return Response.json({ ok: true, executed: ap.type || "other", detail: "Goedgekeurd" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}