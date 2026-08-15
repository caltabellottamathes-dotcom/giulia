/**
 * hobbyProtocol.ts — het LIFE → HOBBIES protocol voor GIULIA.
 *
 * Giulia herkent hobby's en interesses uit gesprekken, projecten, agenda,
 * bestanden en herhaalde vermeldingen, en houdt de activity_level van elke
 * hobby up-to-date (active → quiet → reactivating → active; nieuw → emerging).
 * Alle AI-calls gaan via shared/gemini.ts (BYOK Gemini-sleutels).
 */
import { geminiDecide } from "./gemini.ts";

const INTEREST_SCHEMA = {
  type: "object",
  properties: {
    interests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["music", "creative", "cultural", "sport", "learning", "collecting", "other"] },
          confidence: { type: "number" },
          context: { type: "string" },
          state: { type: "string", enum: ["active", "curious", "new", "saved", "experimenting"] },
        },
      },
    },
  },
};

/** classifyInterests — haal hobby's/interesses uit willekeurige tekst. */
export async function classifyInterests(text, _sr) {
  if (!text || !String(text).trim()) return [];
  const prompt =
    "Lees de tekst en haal er hobby's, creatieve bezigheden, culturele interesses en dingen die Salvo noemt of waarnaar hij nieuwsgierig is. " +
    "Geef per interesse: title (kort, EN), type, confidence (0..1), state (active/curious/new/saved/experimenting) en context (waaruit het bleek).\n\nTekst:\n" +
    String(text).slice(0, 4000);
  const res = await geminiDecide({
    prompt,
    schema: INTEREST_SCHEMA,
    keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY",
    temperature: 0.25,
  }).catch(() => null);
  return (res && Array.isArray(res.interests)) ? res.interests : [];
}

/** evaluateHobbyStates — herbereken activity_level voor alle hobby's. */
export async function evaluateHobbyStates(sr) {
  const hobbies = await sr.entities.Hobby.list("-last_activity_date").catch(() => []);
  const now = Date.now();
  const DAY = 86400000;
  const updates = [];
  for (const h of hobbies) {
    if (h.status === "inactive") continue;
    const ds = h.last_activity_date ? Math.floor((now - new Date(h.last_activity_date).getTime()) / DAY) : null;
    const disc = h.discovered_date ? Math.floor((now - new Date(h.discovered_date).getTime()) / DAY) : null;
    let level = h.activity_level || "active";
    if (disc != null && disc <= 7 && (ds == null || ds > 14)) level = "new";
    else if (ds == null) level = "quiet";
    else if (ds <= 14) level = "active";
    else if (ds <= 35) level = "quiet";
    else level = "quiet";
    if (level !== h.activity_level) updates.push({ id: h.id, activity_level: level });
  }
  if (updates.length) await sr.entities.Hobby.bulkUpdate(updates).catch(() => {});
  return { evaluated: hobbies.length, updated: updates.length, updates };
}

/** linkCalendarToHobby — koppel een agenda-afspraak aan een hobby (titel-match). */
export async function linkCalendarToHobby(event, sr) {
  if (!event || !event.title) return null;
  const hobbies = await sr.entities.Hobby.list().catch(() => []);
  const match = hobbies.find((h) => event.title.toLowerCase().includes(h.title.toLowerCase()));
  if (match) {
    await sr.entities.Hobby.update(match.id, { last_activity_date: event.start, activity_level: "active" }).catch(() => null);
    return match.id;
  }
  return null;
}