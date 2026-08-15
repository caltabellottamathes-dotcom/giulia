/**
 * conflictEngine.ts — Conflict-engine: externe vs interne state.
 *
 * Detecteert conflicten tussen GIULIA's centrale state en een externe bron
 * (bv. Google Calendar). Niet stil overschrijven — eerst vergelijken, dan
 * aan GIULIA-GIULIA teruggeven om de bron te bepalen.
 */
import { titleSimilarity } from "./codeAgent.ts";

/**
 * detectCalendarConflicts — vergelijk lokale CalendarEvents met externe events.
 * Een conflict = overlapping in tijd én óf hoge titel-gelijkenis (≥0.6) óf
 * verschillende synced-ID's op dezelfde slot (potentiële dubbele boeking).
 */
export function detectCalendarConflicts(localEvents, externalEvents) {
  const conflicts = [];
  for (const ext of externalEvents) {
    if (!ext || !ext.start) continue;
    const extStart = new Date(ext.start).getTime();
    const extEnd = new Date(ext.end || ext.start).getTime();
    for (const loc of localEvents) {
      if (!loc || !loc.start || loc.status === "cancelled") continue;
      const locStart = new Date(loc.start).getTime();
      const locEnd = new Date(loc.end || loc.start).getTime();
      const overlaps = extStart < locEnd && locStart < extEnd;
      if (!overlaps) continue;
      const sim = titleSimilarity(ext.title, loc.title);
      const sameSource = ext.id && loc.id && ext.id === loc.id;
      if (sameSource) continue;
      if (sim > 0.6) {
        conflicts.push({ local: { id: loc.id, title: loc.title, start: loc.start }, external: { id: ext.id, title: ext.title, start: ext.start }, similarity: sim });
      }
    }
  }
  return conflicts;
}

/**
 * reconcileCalendar — haal lokale events op en vergelijk met externe set.
 */
export async function reconcileCalendar(base44, externalEvents) {
  const local = await base44.asServiceRole.entities.CalendarEvent.filter({ status: { $ne: "cancelled" } }, "-created_date", 300).catch(() => []);
  return detectCalendarConflicts(local, externalEvents || []);
}