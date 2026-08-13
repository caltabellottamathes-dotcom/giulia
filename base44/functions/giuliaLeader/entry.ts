import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { createApproval, navigateApp } from "../../shared/codeAgent.ts";

/**
 * giuliaLeader — GIULIA-CORE. De pure executie-engine van GIULIA OS.
 *
 * Naamgevingsconventie GIULIA OS:
 *   GIULIA-GIULIA   = het brein (Gemini-call in chatWithGiulia) — begrijpt,
 *                      beslist, redeneert nooit hier.
 *   GIULIA-CONNECT  = chatWithGiulia — laadt context, roept GIULIA-GIULIA aan,
 *                      stuurt de beslissing (ExecutionPayload) hierheen.
 *   GIULIA-CORE     = dit bestand — voert acties blind uit via tools
 *                      (entity CRUD, approvals, navigate, push). GEEN eigen
 *                      Gemini-call, GEEN interpretatie van intentie.
 *
 * Accepteert: { actions: [{type, ...params}], memory_updates: [{content,
 * category}], should_notify, notify_title, agent_source }.
 */

const VALID_TYPES = new Set([
  "create_task", "update_task", "complete_task", "create_project", "update_project",
  "create_note", "create_idea", "create_contact", "create_memory", "create_approval",
  "navigate", "push_notify", "delete_tasks",
]);

async function runAction(base44, sr, action) {
  const type = action && action.type;
  if (!type || !VALID_TYPES.has(type)) return { type, ok: false, error: "onbekend action type" };
  try {
    switch (type) {
      case "create_task": {
        const t = await sr.entities.Task.create({
          title: action.title || "Taak",
          description: action.description || undefined,
          priority: action.priority || "medium",
          deadline: action.deadline || undefined,
          project_id: action.project_id || undefined,
          delegated_to_giulia: action.assignee === "giulia",
          agent_source: "giuliaLeader",
        });
        return { type, id: t?.id, ok: !!t };
      }
      case "update_task": {
        if (!action.id) return { type, ok: false, error: "id vereist" };
        const patch = {};
        if (action.status) patch.status = action.status;
        if (action.title) patch.title = action.title;
        if (action.deadline) patch.deadline = action.deadline;
        const t = await sr.entities.Task.update(action.id, patch);
        return { type, id: action.id, ok: !!t };
      }
      case "complete_task": {
        if (!action.id) return { type, ok: false, error: "id vereist" };
        const t = await sr.entities.Task.update(action.id, { status: "completed" });
        return { type, id: action.id, ok: !!t };
      }
      case "create_project": {
        const p = await sr.entities.Project.create({
          title: action.title || "Project",
          description: action.description || undefined,
          category: action.category || undefined,
          deadline: action.deadline || undefined,
          status: "planning",
          agent_source: "giuliaLeader",
        });
        return { type, id: p?.id, ok: !!p };
      }
      case "update_project": {
        if (!action.id) return { type, ok: false, error: "id vereist" };
        const patch = {};
        if (action.status) patch.status = action.status;
        if (action.title) patch.title = action.title;
        const p = await sr.entities.Project.update(action.id, patch);
        return { type, id: action.id, ok: !!p };
      }
      case "create_note": {
        const n = await sr.entities.Note.create({
          title: action.title || "Notitie",
          content: action.content || "",
          agent_source: "giuliaLeader",
        });
        return { type, id: n?.id, ok: !!n };
      }
      case "create_idea": {
        const i = await sr.entities.Idea.create({
          title: action.title || "Idee",
          content: action.content || "",
          category: action.category || undefined,
          status: "new",
          agent_source: "giuliaLeader",
        });
        return { type, id: i?.id, ok: !!i };
      }
      case "create_contact": {
        const c = await sr.entities.Contact.create({
          name: action.name || action.title || "Contact",
          company: action.company || undefined,
          email: action.email || undefined,
          phone: action.phone || undefined,
          agent_source: "giuliaLeader",
        });
        return { type, id: c?.id, ok: !!c };
      }
      case "create_memory": {
        const m = await sr.entities.Memory.create({
          content: action.content || action.title || "",
          category: action.category || "Conversation-derived",
          source: "giuliaLeader",
        });
        return { type, id: m?.id, ok: !!m };
      }
      case "create_approval": {
        const a = await createApproval(base44, action.category || "other", action.title || "Actie", action.content || "", undefined, "salvo");
        return { type, id: a?.id, ok: !!a };
      }
      case "navigate": {
        if (!action.route) return { type, ok: false, error: "route vereist" };
        const n = await navigateApp(base44, action.route, {}, action.label || "", "giuliaLeader");
        return { type, id: n?.id, ok: !!n };
      }
      case "push_notify": {
        const res = await base44.functions.invoke("sendPushNotifications", {
          title: action.title || "Giulia",
          message: action.content || action.title || "",
        }).catch(() => null);
        return { type, ok: !!res };
      }
      case "delete_tasks": {
        if (!action.status) return { type, ok: false, error: "status vereist" };
        const list = await sr.entities.Task.filter({ status: action.status }, "-created_date", 500).catch(() => []);
        const ids = list.map((t) => t.id).filter(Boolean);
        for (let i = 0; i < ids.length; i += 100) {
          await sr.entities.Task.deleteMany({ id: { $in: ids.slice(i, i + 100) } }).catch(() => {});
        }
        return { type, ok: true, deleted: ids.length };
      }
      default:
        return { type, ok: false, error: "niet geïmplementeerd" };
    }
  } catch (e) {
    return { type, ok: false, error: String((e && e.message) || e) };
  }
}

// Memory pruning — houdt het geheugen beheersbaar: boven de 200 records
// worden de oudste 'Conversation-derived' items (laagste prioriteit) verwijderd.
async function pruneMemory(sr) {
  const all = await sr.entities.Memory.list("-created_date", 300).catch(() => []);
  if (all.length <= 200) return 0;
  const excess = all.slice(200).filter((m) => m.category === "Conversation-derived");
  const ids = excess.map((m) => m.id).filter(Boolean);
  if (!ids.length) return 0;
  await sr.entities.Memory.deleteMany({ id: { $in: ids } }).catch(() => {});
  return ids.length;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json();

    const actions = Array.isArray(body.actions) ? body.actions : [];
    const memoryUpdates = Array.isArray(body.memory_updates) ? body.memory_updates : [];
    const shouldNotify = !!body.should_notify;
    const notifyTitle = body.notify_title || "Giulia";
    const agentSource = body.agent_source || "unknown";

    // Voer elke actie deterministisch uit — geen redenering, alleen validatie.
    const results = [];
    for (const action of actions) {
      results.push(await runAction(base44, sr, action));
    }

    // Persisteer wat GIULIA-GIULIA wilde onthouden.
    for (const mu of memoryUpdates) {
      if (!mu || !mu.content) continue;
      await sr.entities.Memory.create({
        content: String(mu.content).slice(0, 500),
        category: mu.category || "Conversation-derived",
        source: agentSource,
      }).catch(() => null);
    }
    const pruned = await pruneMemory(sr);

    if (shouldNotify) {
      await base44.functions.invoke("sendPushNotifications", {
        title: notifyTitle,
        message: `${actions.length} acties uitgevoerd`,
      }).catch(() => null);
    }

    const okCount = results.filter((r) => r.ok).length;
    try {
      await sr.entities.Activity.create({
        action: "giulia_core_execute",
        description: `GIULIA-CORE: ${okCount}/${actions.length} acties uitgevoerd (bron: ${agentSource})`,
        source: "giuliaLeader",
        timestamp: new Date().toISOString(),
      });
    } catch { /* ignore */ }

    return Response.json({ ok: true, results, memory_saved: memoryUpdates.length, memory_pruned: pruned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}