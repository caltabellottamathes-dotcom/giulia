/**
 * generateGreeting — levert elke keer een verse, contextbewuste 2-regel groet
 * voor het dashboard, in Giulia's stem. BYOK Gemini (geen integration credits).
 * Verzamelt lichte live-context (agenda hierna, taken vandaag, wachtende
 * approvals, lopende tijd-timer) en vraagt een nieuw, gevarieerd resultaat.
 * Returnt { line1, line2 } — regel 2 eindigt altijd op "...".
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { geminiDecide } from "../../shared/gemini.ts";

function partOfDay(h) {
  if (h < 6) return "nacht";
  if (h < 12) return "ochtend";
  if (h < 18) return "middag";
  return "avond";
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const rawName = user?.full_name || "";
    const first = rawName.split(" ")[0];
    const displayName = first === "Salvatore" ? "Salvo" : first || "Salvo";

    const now = new Date();
    const amstHour = parseInt(now.toLocaleTimeString("nl-NL", { hour: "2-digit", hour12: false, timeZone: "Europe/Amsterdam" }), 10) || 0;
    const part = partOfDay(amstHour);
    const dayName = now.toLocaleDateString("nl-NL", { weekday: "long", timeZone: "Europe/Amsterdam" });
    const dateLabel = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", timeZone: "Europe/Amsterdam" });
    const timeLabel = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
    const nowIso = now.toISOString();

    // Lichtgewicht live-context, parallel en fouttolerant.
    const [events, tasks, approvals, running] = await Promise.all([
      base44.entities.CalendarEvent.filter({ start: { $gte: nowIso } }, "start", 4).catch(() => []),
      base44.entities.Task.filter({ status: "today" }, "-created_date", 6).catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }, "-created_date", 6).catch(() => []),
      base44.entities.TimeEntry.filter({ status: "running" }, "-start_time", 1).catch(() => []),
    ]);

    const dayLabel = (eStart) => {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const ev = new Date(eStart);
      ev.setHours(0, 0, 0, 0);
      const diff = Math.round((ev.getTime() - today.getTime()) / 86400000);
      if (diff <= 0) return "vandaag";
      if (diff === 1) return "morgen";
      if (diff === 2) return "overmorgen";
      return new Date(eStart).toLocaleDateString("nl-NL", { weekday: "short", timeZone: "Europe/Amsterdam" });
    };

    const upcoming = (events || [])
      .filter((e) => e.start && new Date(e.start).getTime() >= now.getTime())
      .slice(0, 3)
      .map((e) => `${dayLabel(e.start)} ${new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })} ${e.title}`);

    const todayTasks = (tasks || []).map((t) => t.title).filter(Boolean).slice(0, 4);
    const pendingApprovals = (approvals || []).length;
    const runningProject = running?.[0]?.project_title || "";

    const ctx = [
      `Het is ${dayName} ${dateLabel}, ${timeLabel} (Europa/Amsterdam), ${part}.`,
      `Noem hem in de groet "${displayName}".`,
      upcoming.length ? `Agenda hierna: ${upcoming.join(" · ")}.` : "Geen agenda-afspraken hierna.",
      todayTasks.length ? `Taken voor vandaag: ${todayTasks.join(" · ")}.` : "Geen taken voor vandaag.",
      pendingApprovals ? `${pendingApprovals} approval(s) wachten op jouw goedkeuring.` : "",
      runningProject ? `Tijd-timer loopt op project: ${runningProject}.` : "",
    ].filter(Boolean).join("\n");

    const prompt = `Schrijf een verse, persoonlijke dashboard-groet voor Salvo. Regels:
- Precies TWEE regels. Regel 1: een korte begroeting passend bij het moment (ochtend/middag/avond/nacht) en de dag. Regel 2: één scherpe, contextbewuste opmerking over wat er NU speelt op basis van de context hieronder.
- Stijl: droog, scherp, menselijk, Nederlands. Geen SaaS-enthousiasme, geen uitroeptekens, geen herhaling. Variatie: maak het elke keer anders, geen vast riedeltje — kies een andere invalshoek dan de obvious keuze.
- Regel 2 eindigt altijd op "..." (drie puntjes, nooit een punt of vraagteken).
- Blijf strikt bij de CONTEXT: gebruik alleen de tijden, dagen en afspraken die erin staan, reken niets zelf om. Als een afspraak niet vandaag is, noem de dag (bv. "morgen", "woensdag").
- Maximaal ~12 woorden per regel.

CONTEXT:
${ctx}

Geef JSON met "line1" en "line2".`;

    const schema = {
      type: "object",
      properties: {
        line1: { type: "string" },
        line2: { type: "string" },
      },
      required: ["line1", "line2"],
    };

    const result = await geminiDecide({
      prompt,
      schema,
      temperature: 0.9,
      keyName: "UPDATE_GEMINI_API_KEY",
      systemText: "Je bent Giulia, het persoonlijke OS van Salvo. Je spreekt Nederlands, droog en scherp, als een kortlage collega met overzicht.",
    });

    const line1 = (result?.line1 || "").trim() || `Goed${part === "ochtend" ? "emorgen" : part === "middag" ? "emiddag" : "enavond"}, ${displayName}`;
    const line2 = (result?.line2 || "").trim() || "Ik houd alles in de gaten...";

    return Response.json({ line1, line2 });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}