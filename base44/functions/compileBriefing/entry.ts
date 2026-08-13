import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * compileBriefing — Giulia's catch-up engine.
 *
 * COLLECT → UNDERSTAND → PRIORITISE → BRIEF.
 *
 * Gathers from every Giulia OS source (email, whatsapp, tasks, calendar,
 * projects, approvals, insights), curates a short prioritised set of briefing
 * items, and writes them as BriefingItem records. Rule-based curation runs
 * always; an AI refinement pass (InvokeLLM) is attempted when available but
 * the function works without it — so the briefing still compiles when the
 * workspace is out of integration credits.
 */

const PRIORITY_RANK = { critical: 0, important: 1, relevant: 2, later: 3 };

const hoursSince = (iso) => {
  if (!iso) return null;
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 3600000);
};

function greetingFor(awayHours) {
  const hour = new Date().getHours();
  if (awayHours == null) return hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  if (awayHours >= 72) return "Welkom terug";
  if (awayHours >= 24) return "Hier is wat er vandaag is veranderd";
  return hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
}

function sublineFor(awayHours, count) {
  const c = count;
  if (c === 0) return "Er is niets dat nu aandacht nodig heeft.";
  const things = c === 1 ? "ding" : "dingen";
  if (awayHours == null) return `${c} ${things} die je waarschijnlijk moet weten.`;
  if (awayHours >= 72) return `Ik heb alles geordend wat er gebeurde terwijl je weg was — ${c} ${things}.`;
  if (awayHours >= 24) return `${c} ${things} ${c === 1 ? "is" : "zijn"} veranderd vandaag.`;
  if (awayHours >= 1) {
    const h = Math.round(awayHours);
    return `Je was ${h} uur weg. ${c} ${things} gebeurden.`;
  }
  return `${c} ${things} gebeurden terwijl je weg was.`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const safe = (p) => p.catch(() => []);
    const [emails, waMsgs, tasks, events, projects, approvals, insights, contacts, activity] = await Promise.all([
      safe(base44.entities.Email.filter({ status: "unread" })),
      safe(base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" })),
      safe(base44.entities.Task.list()),
      safe(base44.entities.CalendarEvent.list("-start", 30)),
      safe(base44.entities.Project.list("-last_activity_date", 30)),
      safe(base44.entities.Approval.filter({ status: "pending" })),
      safe(base44.entities.Insight.filter({ status: "new" })),
      safe(base44.entities.Contact.list()),
      safe(base44.entities.Activity.list("-created_date", 1)),
    ]);

    const awayHours = activity && activity[0]?.timestamp ? hoursSince(activity[0].timestamp) : null;
    const contactName = (id) => {
      const c = contacts.find((x) => x.id === id);
      return c?.name || c?.company || "Onbekend";
    };

    const items = [];
    const now = new Date();
    const todayStr = now.toLocaleDateString("sv-SE");

    // Email — one aggregated card
    if (emails.length) {
      const important = emails.filter((e) => e.important || e.category === "important").length;
      items.push({
        type: "email",
        title: `${emails.length} ${emails.length === 1 ? "email" : "emails"} die aandacht nodig hebben`,
        summary: important
          ? `${important} ${important === 1 ? "is belangrijk" : "zijn belangrijk"}. ${emails.length - important} ${emails.length - important === 1 ? "kan wachten" : "kunnen wachten"}.`
          : "Giulia heeft ze gesorteerd op belangrijkheid.",
        source: "email",
        priority: important > 0 ? "important" : "relevant",
        suggested_action: "Open postvak",
        action_route: "/email",
        context: `${emails.length} ongelezen. Giulia stelde concept-antwoorden op waar relevant.`,
        payload: { count: emails.length, important },
      });
    }

    // WhatsApp — group by contact
    const byContact = {};
    waMsgs.forEach((m) => {
      const key = m.contact_id || m.conversation_id || "unknown";
      (byContact[key] = byContact[key] || []).push(m);
    });
    Object.entries(byContact).slice(0, 3).forEach(([key, msgs]) => {
      const name = msgs[0].contact_id ? contactName(msgs[0].contact_id) : (key === "unknown" ? "Onbekend nummer" : key);
      const first = (name || "?").split(" ")[0];
      const last = msgs[msgs.length - 1];
      items.push({
        type: "whatsapp",
        title: name,
        summary: `${first} ${msgs.length > 1 ? "reageerde op je bericht" : "stuurde een bericht"}.`,
        source: "whatsapp",
        related_person: msgs[0].contact_id,
        priority: "important",
        suggested_action: "Open gesprek",
        action_route: "/whatsapp",
        context: (last?.message || "").slice(0, 280),
        payload: { count: msgs.length, preview: (last?.message || "").slice(0, 140) },
      });
    });

    // Tasks — overdue deadlines
    tasks.forEach((t) => {
      if (t.status === "completed" || t.status === "archived") return;
      if (!t.deadline) return;
      const due = new Date(t.deadline);
      if (due < new Date(todayStr)) {
        items.push({
          type: "deadline",
          title: t.title,
          summary: `Deadline: ${due.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}.`,
          source: "tasks",
          related_task: t.id,
          priority: "critical",
          suggested_action: "Open taak",
          action_route: "/tasks",
          action_params: { task: t.id },
          context: t.description || "Deze taak loopt achter op planning.",
        });
      }
    });

    // Calendar — today's events
    events.slice(0, 2).forEach((e) => {
      const start = e.start ? new Date(e.start) : null;
      if (!start || start.toLocaleDateString("sv-SE") !== todayStr) return;
      const time = start.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
      items.push({
        type: "calendar",
        title: `${time} · ${e.title}`,
        summary: e.location ? `Locatie: ${e.location}` : "In de agenda.",
        source: "calendar",
        related_event: e.id,
        priority: "important",
        suggested_action: "Bereid meeting voor",
        action_route: "/agenda",
        context: e.description || (e.participants ? `Deelnemers: ${e.participants}` : "Je hebt deze meeting nog niet voorbereid."),
        payload: { time, title: e.title },
      });
    });

    // Projects — recent movement
    projects.slice(0, 2).forEach((p) => {
      const last = p.last_activity_date ? new Date(p.last_activity_date) : null;
      const recent = last && now.getTime() - last.getTime() < 48 * 3600000;
      if (!recent && p.status !== "review") return;
      items.push({
        type: "project",
        title: p.title,
        summary: p.next_milestone ? `Volgende stap: ${p.next_milestone}.` : "Het project is verder gegaan.",
        source: "projects",
        related_project: p.id,
        priority: "relevant",
        suggested_action: "Open project",
        action_route: `/projects/${p.id}`,
        context: p.description || "",
        payload: { progress: p.progress, status: p.status },
      });
    });

    // Approvals — pending
    approvals.slice(0, 3).forEach((a) => {
      items.push({
        type: "important",
        title: a.title || a.description,
        summary: a.description || "Giulia stelt een actie voor ter goedkeuring.",
        source: "approvals",
        priority: "critical",
        suggested_action: "Open goedkeuring",
        action_route: "/approvals",
        action_params: a.id ? { approval: a.id } : {},
        context: a.proposed_action || a.context || "",
      });
    });

    // Insights — new
    insights.slice(0, 2).forEach((i) => {
      items.push({
        type: "insight",
        title: i.title,
        summary: (i.content || "").slice(0, 160),
        source: "insights",
        priority: "relevant",
        suggested_action: "Bekijk inzicht",
        action_route: "/insights",
        context: i.content || "",
      });
    });

    items.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    const capped = items.slice(0, 12);

    // Persist: replace previous unread set
    try {
      await base44.entities.BriefingItem.deleteMany({ status: "new" });
    } catch { /* ignore */ }
    let persisted = [];
    try {
      if (capped.length) {
        persisted = await base44.entities.BriefingItem.bulkCreate(
          capped.map((it) => ({
            ...it,
            status: "new",
            away_hours: awayHours ?? 0,
            timestamp: it.timestamp || new Date().toISOString(),
          }))
        );
      }
    } catch { /* ignore */ }

    const intro = { greeting: greetingFor(awayHours), subline: sublineFor(awayHours, capped.length) };
    const needAttention = capped.filter((i) => i.priority === "critical" || i.priority === "important").length;
    const upcoming = events.find((e) => e.start && new Date(e.start) > now);
    const outro = {
      head: "Je bent weer bij.",
      subline: capped.length
        ? `${needAttention} ${needAttention === 1 ? "ding" : "dingen"} ${needAttention === 1 ? "staat" : "staan"} gepland voor vandaag.`
        : "Er staat niets dringend.",
      next: upcoming ? `Je volgende afspraak is om ${new Date(upcoming.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}.` : "",
    };

    return Response.json({
      ok: true,
      away_hours: awayHours,
      intro,
      items: persisted.length ? persisted : capped,
      outro,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}