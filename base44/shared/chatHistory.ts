/**
 * chatHistory.ts — gedeelde tijd-bewustzijn + gesprekengeheugen voor de agents.
 *
 * Alle chagents (Mattia, Giulia) en de journal delen deze helpers:
 *   - amsterdamOffsetMs / amsterdamDayWindow — de backend-runtime draait in UTC;
 *     deze functies rekenen de Amsterdamse muurklok (incl. zomer-/wintertijd)
 *     terug naar echte UTC-instanten. Zonder deze correctie vallen chats en
 *     events tussen 00:00-02:00 Amsterdam in de verkeerde dag.
 *   - timeAwarenessBlock — systeem-promptblok met de actuele datum/tijd en de
 *     dagnamen voor gisteren/eergisteren, plus de regel dat de agent de
 *     tijdstempels in de draad moet checken (niet verder kletsen alsof het
 *     gesprek van 3 minuten geleden was).
 *   - formatStamp — kort NL tijdstempel "wo 16 sep, 01:21" per bericht.
 *   - loadTimestampedHistory — recente draad mét tijdstempel per bericht.
 *   - makeChatHistorySearchTool — search_chat_history tool: zoek terug in de
 *     eigen draad op keyword en/of dagen terug (voor 'eergisteren zei ik…').
 */

export function amsterdamOffsetMs(now = new Date()) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = {};
  for (const p of dtf.formatToParts(now)) parts[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second)
  );
  return asUTC - now.getTime();
}

/** Amsterdamse dag waarin 'now' valt: { start, end } als UTC-instanten + label. */
export function amsterdamDayWindow(now = new Date()) {
  const off = amsterdamOffsetMs(now);
  const loc = new Date(now.getTime() + off); // UTC-velden = Amsterdam muurklok
  const dayStartLocal = Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate());
  return {
    start: new Date(dayStartLocal - off),
    end: new Date(dayStartLocal - off + 86400000 - 1),
    offsetMs: off,
    dateLabel: loc.toLocaleDateString("nl-NL", { timeZone: "UTC", day: "numeric", month: "long" }),
  };
}

/**
 * Journal-venster: gisteren 22:00 Amsterdam → nu. De journal draait om 22:00;
 * met een kale dagvenster vallen avond-chats (22:00–24:00) túszen twee
 * dagbeelden in en verdwijnen ze uit álle dagbeelden — dit venster sluit
 * dat gat (en dekt meteen de late nacht-chats van de vorige avond).
 */
export function amsterdamJournalWindow(now = new Date()) {
  const win = amsterdamDayWindow(now);
  return { ...win, start: new Date(win.start.getTime() - 2 * 3600000) };
}

/** Systeem-promptblok: actuele tijd + dagnamen + gap-awareness regel. */
export function timeAwarenessBlock(now = new Date()) {
  const off = amsterdamOffsetMs(now);
  const loc = new Date(now.getTime() + off);
  const dayName = (delta) =>
    new Date(loc.getTime() + delta * 86400000)
      .toLocaleDateString("nl-NL", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
  return [
    "== TIJDBEWUSTZIJN ==",
    `Het is nu: ${loc.toLocaleDateString("nl-NL", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${loc.toLocaleTimeString("nl-NL", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })} (Europe/Amsterdam).`,
    `Vandaag = ${dayName(0)} · gisteren = ${dayName(-1)} · eergisteren = ${dayName(-2)}.`,
    "Elke oudere beurt in de draad heeft een tijdstempel in de DRAAD-TIJDLIJN onderaan deze systeem-instructie. Die tijdlijn is METADATA: neem de tijdstempels NOOIT letterlijk over in je antwoord, citeer ze niet, begin er nooit een zin mee. Gebruik ze alléén om te CHECKEN hoe oud het gesprek is: is het laatste bericht van lang geleden (uren of dagen), ga dan NIET verder alsof jullie net aan het praten waren — merk het kort op, vat samen waar jullie stonden en behandel het als een nieuw begin.",
    "Verwijst Salvo naar een eerder gesprek (gisteren, eergisteren, vorige week, 'wat zei ik over X') en het staat niet in de draad? Gebruik dan search_chat_history om het terug te vinden — raad nooit.",
  ].join("\n");
}

/** Kort NL tijdstempel per bericht, bv. "[wo 16 sep, 01:21]". */
export function formatStamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = amsterdamOffsetMs(d);
  const loc = new Date(d.getTime() + off);
  return loc.toLocaleString("nl-NL", {
    timeZone: "UTC", weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Recente draad mét tijdstempel per bericht, oud → nieuw.
 * roles (optioneel) filtert op Message.role, bv. ["user", "mattia"].
 */
export async function loadTimestampedHistory(sr, { threadId, limit = 20, maxChars = 600, roles } = {}) {
  const history = await sr.entities.Message
    .filter({ channel: "in-app", thread_id: threadId }, "-created_date", limit)
    .catch(() => []);
  const ordered = (history || [])
    .filter((m) => m.content && String(m.content).trim())
    .filter((m) => !roles || roles.includes(m.role))
    .reverse();
  // text = kale berichttekst ZONDER tijdstempel (het model kopieerde de
  // stamp letterlijk mee in zijn antwoord); de tijd zit in stamp/index.
  return ordered.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    who: m.role === "user" ? "Salvo" : m.role,
    text: String(m.content).slice(0, maxChars),
    stamp: formatStamp(m.created_date),
  }));
}

/**
 * Compacte tijdlijn van de draad voor de systeem-prompt — metadata-only:
 * tijdstip + korte excerpt per beurt, oud → nieuw. De berichtteksten zelf
 * blijven zonder stamps in `contents` zodat het model ze niet napraat.
 */
export function buildThreadIndex(items, { maxItems = 12, maxChars = 70 } = {}) {
  const rows = (items || []).slice(-maxItems).map((m, i) => {
    const excerpt = String(m.text || "").replace(/\s+/g, " ").trim();
    const short = excerpt.slice(0, maxChars);
    return `${i + 1}. ${m.stamp || "onbekend"} · ${m.who || (m.role === "user" ? "Salvo" : "agent")}: ${short}${excerpt.length > maxChars ? "…" : ""}`;
  });
  if (!rows.length) return "";
  return ["== DRAAD-TIJDLIJN (metadata — NOOIT overnemen of citeren in je antwoord) ==", ...rows].join("\n");
}

/**
 * search_chat_history tool — per agent geïnstantieerd met zijn eigen draad.
 * Zoekt terug op keyword en/of aantal dagen (default 3, max 30) in de laatste
 * 400 berichten van de draad. Geeft berichten terug met NL-tijdstempel.
 */
export function makeChatHistorySearchTool(base44, { threadId, agentName = "Giulia" } = {}) {
  return {
    name: "search_chat_history",
    description:
      `Zoek terug in eerdere chatberichten tussen Salvo en ${agentName} (de in-app draad, met datum en tijd per bericht). ` +
      "Gebruik dit wanneer Salvo verwijst naar iets uit een eerder gesprek ('gisteren zei ik…', 'eergisteren', 'vorige week', 'wat zeiden we over X') of wanneer de recente draad niet ver genoeg terugreikt. " +
      "Zonder query krijg je de berichten van de afgelopen days_back dagen (oud → nieuw).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "zoekwoord of onderwerp (optioneel)" },
        days_back: { type: "number", description: "hoe ver terug in dagen (standaard 3, max 30)" },
      },
    },
    execute: async (args) => {
      const sr = base44.asServiceRole;
      const days = Math.min(Math.max(Number(args?.days_back) || 3, 1), 30);
      const since = Date.now() - days * 86400000;
      const q = String(args?.query || "").toLowerCase().trim();
      const list = await sr.entities.Message
        .filter({ channel: "in-app", thread_id: threadId }, "-created_date", 400)
        .catch(() => []);
      const hits = (list || [])
        .filter((m) => {
          if (!m.created_date || new Date(m.created_date).getTime() < since) return false;
          if (!m.content || !String(m.content).trim()) return false;
          if (!["user", "mattia", "giulia"].includes(m.role)) return false;
          return !q || String(m.content).toLowerCase().includes(q);
        })
        .slice(0, 30);
      return {
        count: hits.length,
        days_back: days,
        messages: hits.reverse().map((m) => ({
          when: formatStamp(m.created_date),
          who: m.role === "user" ? "Salvo" : m.role,
          text: String(m.content).slice(0, 250),
        })),
      };
    },
  };
}