/**
 * generateGreeting — levert een persoonlijke, contextbewuste 2-regel groet
 * voor het dashboard, in Giulia's stem. BYOK Gemini (geen integration credits).
 * Focus op wat Giulia over Salvo weet en wat nu relevant is — NIET de agenda.
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

    // Persoonlijke context — wat Giulia over Salvo weet, fouttolerant parallel.
    // Agenda wordt meegenomen ALS TIJDREFERENTIE (wat nog komt), niet als onderwerp.
    const nowIso = now.toISOString();
    const [memories, activities, insights, checkins, hobbies, goals, events] = await Promise.all([
      base44.entities.Memory.filter({}, "-created_date", 4).catch(() => []),
      base44.entities.Activity.filter({}, "-timestamp", 4).catch(() => []),
      base44.entities.Insight.filter({ status: { $ne: "archived" } }, "-created_date", 3).catch(() => []),
      base44.entities.SelfCheckIn.filter({}, "-created_date", 2).catch(() => []),
      base44.entities.Hobby.filter({ status: "active" }, "-last_activity_date", 5).catch(() => []),
      base44.entities.SelfGoal.filter({ status: "active" }, "-created_date", 3).catch(() => []),
      base44.entities.CalendarEvent.filter({ start: { $gte: nowIso }, status: { $ne: "cancelled" } }, "start", 5).catch(() => []),
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
      return new Date(eStart).toLocaleDateString("nl-NL", { weekday: "long", timeZone: "Europe/Amsterdam" });
    };
    const upcoming = (events || [])
      .filter((e) => e.start && new Date(e.start).getTime() >= now.getTime())
      .slice(0, 4)
      .map((e) => `${dayLabel(e.start)} ${new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })} ${e.title} (KOMT NOG — is nog niet geweest)`);

    const memLines = (memories || []).map((m) => m.content).filter(Boolean).slice(0, 4);
    const actLines = (activities || []).map((a) => a.description || a.action).filter(Boolean).slice(0, 3);
    const insightLines = (insights || []).map((i) => i.title).filter(Boolean).slice(0, 2);
    const checkinLines = (checkins || []).map((c) => {
      const bits = [c.state, c.mood, c.reflection].filter(Boolean);
      return bits.join(" · ");
    }).filter(Boolean).slice(0, 1);
    const hobbyLines = (hobbies || []).map((h) => h.title).filter(Boolean).slice(0, 5);
    const goalLines = (goals || []).map((g) => g.title || g.description).filter(Boolean).slice(0, 3);

    const ctx = [
      `Het is ${dayName} ${dateLabel}, ${timeLabel} (Europa/Amsterdam), ${part}.`,
      `Noem hem in de groet "${displayName}".`,
      upcoming.length ? `Wat er nog KOMT in de agenda (alleen als tijdreferentie — ga de groet hier NIET over): ${upcoming.join(" · ")}.` : "Niets gepland in de agenda.",
      memLines.length ? `Wat Giulia recent onthield over hem: ${memLines.join(" · ")}.` : "",
      actLines.length ? `Wat Giulia recent deed: ${actLines.join(" · ")}.` : "",
      insightLines.length ? `Signalen die Giulia opvielen: ${insightLines.join(" · ")}.` : "",
      checkinLines.length ? `Laatste check-in (hoe hij ervoor staat): ${checkinLines.join(" · ")}.` : "",
      hobbyLines.length ? `Hobby's die hem energie geven: ${hobbyLines.join(" · ")}.` : "",
      goalLines.length ? `Waar hij persoonlijk aan werkt: ${goalLines.join(" · ")}.` : "",
    ].filter(Boolean).join("\n");

    const prompt = `Schrijf een persoonlijke dashboard-groet voor Salvo. Regels:
- Precies TWEE regels. Regel 1: een korte begroeting passend bij het moment (ochtend/middag/avond/nacht) en de dag. Regel 2: één warme, persoonlijke opmerking over wat Giulia over hem weet of wat nu relevant is — gebaseerd op de context hieronder.
- GA NIET over zijn agenda of taken als onderwerp. Ga over hem als mens: iets dat Giulia onthield, een signaal dat opviel, hoe hij ervoor staat, een hobby die energie geeft, of iets persoonlijks dat nu past bij het moment.
- CRUCIAAL: agenda-items in de context komen NOG — ze zijn nog niet geweest. Verwar ze NOOIT met iets dat al is gebeurd. Noem geen afspraak als iets dat "nagalmt" of "net was" als hij in de toekomst staat.
- Stijl: droog, scherp, menselijk, Nederlands. Geen SaaS-enthousiasme, geen uitroeptekens, geen herhaling. Variatie: kies een andere invalshoek dan de obvious keuze.
- Regel 2 eindigt altijd op "..." (drie puntjes, nooit een punt of vraagteken).
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
      systemText: "Je bent Giulia, het persoonlijke OS van Salvo. Je spreekt Nederlands, droog en scherp, als een collega met overzicht die hem goed kent.",
    });

    const line1 = (result?.line1 || "").trim() || `Goed${part === "ochtend" ? "emorgen" : part === "middag" ? "emiddag" : "enavond"}, ${displayName}`;
    const line2 = (result?.line2 || "").trim() || "Ik houd alles in de gaten...";

    return Response.json({ line1, line2 });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}