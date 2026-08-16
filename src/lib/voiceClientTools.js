/**
 * buildVoiceClientTools — alle client-tool handlers die de ElevenLabs
 * voice-agent in de browser uitvoert. Namen MOETEN exact overeenkomen met
 * base44/shared/elevenTools.ts (ELEVEN_TOOLS). Houd gesynchroniseerd.
 *
 * - Navigatie: fire-and-forget (returnt wel een resultaat voor log).
 * - Acties: direct op de database via base44 SDK (app-user RLS), dus
 *   "meteen doorgestuurde acties" — geen tussenlaag, geen goedkeuring voor
 *   interne mutaties. Externe verzending (email/whatsapp) verloopt via
 *   create_approval (trust-model: Salvo keurt goed).
 */
import { base44 } from "@/api/base44Client";
import { NAV_PAGES, NAV_PANELS } from "@/lib/voiceNavigation";

const nowIso = () => new Date().toISOString();

export function buildVoiceClientTools({ navigate, openModule }) {
  return {
    // ── Navigatie ──
    navigate_to_page: async ({ page } = {}) => {
      if (!page || !NAV_PAGES[page]) return { success: false, reason: "unknown_page", available: Object.keys(NAV_PAGES) };
      navigate(page);
      return { success: true, page };
    },
    scroll_to_section: async ({ sectionId } = {}) => {
      if (!sectionId) return { success: false, reason: "missing_sectionId" };
      const el = document.getElementById(sectionId);
      if (!el) return { success: false, reason: "unknown_section" };
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return { success: true, sectionId };
    },
    open_panel: async ({ panelId } = {}) => {
      if (!panelId || !NAV_PANELS[panelId]) return { success: false, reason: "unknown_panel", available: Object.keys(NAV_PANELS) };
      openModule(panelId);
      return { success: true, panelId };
    },
    highlight_element: async ({ elementId, durationMs = 2500 } = {}) => {
      if (!elementId) return { success: false, reason: "missing_elementId" };
      const el = document.getElementById(elementId);
      if (!el) return { success: false, reason: "unknown_element" };
      el.classList.add("voice-highlight");
      setTimeout(() => el.classList.remove("voice-highlight"), durationMs);
      return { success: true, elementId };
    },

    // ── Acties (direct) ──
    create_task: async ({ title, priority, deadline, domain, project_id } = {}) => {
      if (!title) return { success: false, reason: "missing_title" };
      const t = await base44.entities.Task.create({
        title,
        priority: priority || "medium",
        deadline,
        domain: domain || "focus",
        project_id,
        status: "today",
        agent_source: "voice",
      });
      return { success: true, task_id: t.id, title };
    },
    update_task: async ({ task_id, status, priority } = {}) => {
      if (!task_id) return { success: false, reason: "missing_task_id" };
      const patch = { agent_source: "voice" };
      if (status) patch.status = status;
      if (priority) patch.priority = priority;
      await base44.entities.Task.update(task_id, patch);
      return { success: true, task_id, ...patch };
    },
    list_tasks: async ({ status } = {}) => {
      const tasks = await base44.entities.Task.filter(status ? { status } : {}, "-created_date", 12);
      return {
        success: true,
        count: tasks.length,
        tasks: tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, deadline: t.deadline })),
      };
    },
    create_event: async ({ title, start, end, domain, location } = {}) => {
      if (!title || !start) return { success: false, reason: "missing_title_or_start" };
      const ev = await base44.entities.CalendarEvent.create({
        title,
        start,
        end: end || start,
        domain: domain || "focus",
        location,
        status: "confirmed",
        agent_source: "voice",
      });
      return { success: true, event_id: ev.id, title };
    },
    save_note: async ({ title, content } = {}) => {
      if (!title) return { success: false, reason: "missing_title" };
      const n = await base44.entities.Note.create({ title, content: content || "", kind: "note", agent_source: "voice" });
      return { success: true, note_id: n.id, title };
    },
    save_memory: async ({ content, category } = {}) => {
      if (!content) return { success: false, reason: "missing_content" };
      const m = await base44.entities.Memory.create({ content, category: category || "Important information", source: "voice" });
      return { success: true, memory_id: m.id };
    },
    add_journal: async ({ title, content, mood } = {}) => {
      if (!content) return { success: false, reason: "missing_content" };
      const j = await base44.entities.JournalEntry.create({
        title: title || "Stemlog",
        content,
        mood,
        date: nowIso(),
        agent_source: "voice",
      });
      return { success: true, journal_id: j.id };
    },
    log_self_check_in: async ({ state, energy, capacity, mood, reflection } = {}) => {
      if (!state) return { success: false, reason: "missing_state" };
      const c = await base44.entities.SelfCheckIn.create({
        state,
        energy,
        capacity,
        mood,
        reflection,
        source: "voice",
        check_in_type: "manual",
        timestamp: nowIso(),
      });
      return { success: true, check_in_id: c.id, state };
    },
    add_self_need: async ({ title, priority, category } = {}) => {
      if (!title) return { success: false, reason: "missing_title" };
      const n = await base44.entities.SelfNeed.create({ title, priority: priority || "medium", category, agent_source: "voice" });
      return { success: true, need_id: n.id, title };
    },
    notify_salvo: async ({ title, message } = {}) => {
      if (!message) return { success: false, reason: "missing_message" };
      const n = await base44.entities.Notification.create({ title: title || "Giulia", message, kind: "info", agent_source: "voice" });
      return { success: true, notification_id: n.id };
    },
    create_approval: async ({ title, action_type, description, category, type, proposed_action } = {}) => {
      if (!action_type || !description) return { success: false, reason: "missing_action_type_or_description" };
      const a = await base44.entities.Approval.create({
        title: title || description,
        action_type,
        description,
        category: category || "communication",
        type,
        proposed_action,
        status: "pending",
        agent_source: "voice",
      });
      return { success: true, approval_id: a.id, note: "Concept klaargezet — Salvo moet goedkeuren voor verzending." };
    },
    delegate_to_giulia: async ({ instruction } = {}) => {
      if (!instruction) return { success: false, reason: "missing_instruction" };
      const res = await base44.functions.invoke("chatWithGiulia", { message: instruction });
      const d = res?.data ?? res ?? {};
      return { success: true, response: d.response || "Uitgevoerd.", actions: d.actions || [] };
    },
  };
}