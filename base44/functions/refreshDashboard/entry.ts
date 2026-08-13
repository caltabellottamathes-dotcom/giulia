import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';

/**
 * refreshDashboard — aangeroepen bij elke dashboard-reload. Gebruikt de
 * UPDATE_GEMINI_API_KEY om uit de nieuwste activiteit, kennis, geheugen en
 * openstaande items één actueel dashboard-inzicht te synthetiseren, zodat
 * alle widgets/panelen/pagina's met de laatste kennis syncen. Vervangt de
 * vorige refresh-insight (source "refreshDashboard") zodat er altijd één
 * actuele staat zichtbaar is — niet stapelt zich op.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [activity, memories, insights, tasks, approvals, events, notes] = await Promise.all([
      sr.entities.Activity.list("-created_date", 12).catch(() => []),
      sr.entities.Memory.list("-created_date", 8).catch(() => []),
      sr.entities.Insight.list("-created_date", 6).catch(() => []),
      sr.entities.Task.filter({ status: "in_progress" }, "-created_date", 10).catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.CalendarEvent.list("-created_date", 6).catch(() => []),
      sr.entities.Note.list("-created_date", 6).catch(() => []),
    ]);

    const ctx = [
      `Activiteit: ${(activity.map((a) => a.description || a.action).slice(0, 8).join(" | ")) || "geen"}`,
      `Geheugen: ${(memories.map((m) => m.content).join(" | ")) || "geen"}`,
      `Inzichten: ${(insights.map((i) => i.title).join(" | ")) || "geen"}`,
      `Lopende taken: ${(tasks.map((t) => t.title).join(" | ")) || "geen"}`,
      `Open goedkeuringen: ${(approvals.map((a) => a.title).join(" | ")) || "geen"}`,
      `Agenda: ${(events.map((e) => e.title + " " + (e.start || "").slice(0, 10)).join(" | ")) || "geen"}`,
      `Notities: ${(notes.map((n) => n.title).join(" | ")) || "geen"}`,
    ].join("\n");

    const out = await geminiDecide({
      prompt:
        `Syntheseer uit deze huidige staat van GIULIA OS één actueel dashboard-inzicht voor Salvo: ` +
        `wat is NU het belangrijkste om te weten of te doen? Max 2 zinnen, concreet, Nederlands.\n\n${ctx}`,
      schema: {
        type: "object",
        properties: { title: { type: "string" }, content: { type: "string" } },
        required: ["title", "content"],
      },
      systemText: `${GIULIA_PERSONA}\n\nJe bent de dashboard-synchronisatielaag. Houd het kort, concreet en actiegericht.`,
      temperature: 0.4,
      keyName: "UPDATE_GEMINI_API_KEY",
    });

    let refreshed = false;
    if (out && out.title && out.content) {
      const prev = await sr.entities.Insight.filter({ source: "refreshDashboard" }).catch(() => []);
      for (const p of prev) await sr.entities.Insight.delete(p.id).catch(() => null);
      await sr.entities.Insight.create({
        title: String(out.title).slice(0, 160),
        content: String(out.content).slice(0, 600),
        category: "Review",
        status: "new",
        confidence: 0.8,
        source: "refreshDashboard",
      }).catch(() => null);
      refreshed = true;
    }

    return Response.json({ ok: true, refreshed });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}