/**
 * socialEngine.ts — de centrale Social Data Layer / calculator-engine van
 * GIULIA OS, zoals vastgelegd in docs/giulia-social-system.md. Alle
 * Social-achtergrondfuncties importeren hun berekeningen hier vandaan —
 * één eigenaar per datum (§12), geen dubbele herberekening in losse
 * functies. Beschrijvend, niet diagnostisch (§16.10): ontbrekende data
 * geeft altijd UNKNOWN, nooit een aanname.
 */
import { daysSince } from "./domainEngine.ts";

export const RELATIONSHIP_STATES = ["ACTIVE", "CLOSE", "QUIET", "QUIETER_THAN_USUAL", "EMERGING", "RECONNECTING", "CHANGING", "UNKNOWN"];
export const PULSE_STATES = ["CONNECTED", "ACTIVE", "QUIETER_THAN_USUAL", "A_LOT_HAPPENING", "OPEN", "BALANCED", "OVERLOADED", "UNKNOWN"];

/** §5.1 — Relationship State: beschrijvend t.o.v. persoonlijke baseline, nooit een universele norm. */
export function computeRelationshipState(contact, { meaningfulCount30d = 0 } = {}) {
  const lastMeaningful = contact.last_meaningful_contact_date || contact.last_contact_date;
  const baseline = contact.contact_rhythm_days || contact.desired_frequency_days;
  const since = daysSince(lastMeaningful);

  if (since == null) return contact.created_date && daysSince(contact.created_date) <= 21 ? "EMERGING" : "UNKNOWN";
  if (!baseline) return since <= 14 ? "ACTIVE" : "QUIET";

  const ratio = since / baseline;
  const wasQuiet = contact.relationship_state === "QUIET" || contact.relationship_state === "QUIETER_THAN_USUAL";

  if (ratio <= 0.5 && meaningfulCount30d >= 3) return "CLOSE";
  if (ratio <= 1.1) return wasQuiet ? "RECONNECTING" : "ACTIVE";
  if (ratio <= 2) return "QUIETER_THAN_USUAL";
  return "QUIET";
}

/** §5.4 / §3.2 — Relationship Health: samengestelde signalen, géén score. Ontbrekende input → "unknown" per signaal. */
export function computeRelationshipHealth(contact, { meaningfulCount30d = 0, sentCount = 0, receivedCount = 0, upcomingPlan = false, recentChange = null } = {}) {
  const since = daysSince(contact.last_meaningful_contact_date || contact.last_contact_date);
  const baseline = contact.contact_rhythm_days || contact.desired_frequency_days;
  const recency = since == null ? "unknown" : since <= 7 ? "recent" : since <= 21 ? "moderate" : "distant";
  const rhythm = !baseline || since == null ? "unknown" : since / baseline <= 1.2 ? "on_rhythm" : since / baseline <= 2 ? "slower_than_usual" : "off_rhythm";
  const reciprocity = sentCount === 0 && receivedCount === 0 ? "unknown" : sentCount >= receivedCount * 0.6 ? "balanced" : "one_sided";
  const connection = meaningfulCount30d >= 3 ? "strong" : meaningfulCount30d >= 1 ? "present" : "quiet";
  return {
    connection, recency, rhythm, reciprocity,
    quality: meaningfulCount30d > 0 ? "meaningful_present" : "unknown",
    context: contact.relationship_domain || "unknown",
    intention: upcomingPlan ? "plan_in_motion" : "none_active",
    change: recentChange || "none_detected",
    computed_at: new Date().toISOString(),
  };
}

/** §19.2 — Relationship Rhythm Check: vergelijk huidig interval met historische baseline. */
export function computeRhythmBaseline(meaningfulTimestamps = []) {
  const sorted = [...meaningfulTimestamps].filter(Boolean).map((t) => new Date(t).getTime()).sort((a, b) => a - b);
  if (sorted.length < 3) return null;
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) gaps.push((sorted[i] - sorted[i - 1]) / 86400000);
  return Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
}

/** §6.3 — Social Pulse State: actuele toestand t.o.v. persoonlijke baseline, geen kwaliteitsmaatstaf. */
export function computeSocialPulseState({ meaningfulCount = 0, activePlans = 0, openInvitations = 0, availableMin = 9999, baselineWeekly = null }) {
  if (baselineWeekly == null && meaningfulCount === 0 && activePlans === 0) return "UNKNOWN";
  const overloaded = activePlans >= 5 && availableMin < 240;
  if (overloaded) return "OVERLOADED";
  if (activePlans >= 4) return "A_LOT_HAPPENING";
  if (openInvitations >= 1 && meaningfulCount <= 2) return "OPEN";
  if (baselineWeekly != null) {
    if (meaningfulCount >= baselineWeekly * 1.4) return "A_LOT_HAPPENING";
    if (meaningfulCount <= baselineWeekly * 0.5) return "QUIETER_THAN_USUAL";
  }
  if (meaningfulCount >= 5) return "CONNECTED";
  if (meaningfulCount >= 2 && activePlans >= 1) return "BALANCED";
  if (meaningfulCount >= 1) return "ACTIVE";
  return "QUIETER_THAN_USUAL";
}

/** §6.2 — Social Intensity als tijdreeks (weken terug), voor baseline-vergelijking. */
export function computeIntensitySeries(timestamps = [], weeks = 8) {
  const arr = Array.from({ length: weeks }, () => 0);
  const now = Date.now();
  for (const t of timestamps) {
    if (!t) continue;
    const w = Math.floor((now - new Date(t).getTime()) / (7 * 86400000));
    if (w >= 0 && w < weeks) arr[weeks - 1 - w]++;
  }
  return arr;
}

/** §7.1/§19.5 — Social Opportunity Detection: relatie + tijd + capaciteit + geen conflict → mogelijkheid, geen taak. */
export function detectOpportunity({ contact, daysSinceMeaningful, availableSlot, capacityOk, hasConflict }) {
  if (!contact || daysSinceMeaningful == null || !availableSlot || hasConflict || !capacityOk) return null;
  const baseline = contact.contact_rhythm_days || contact.desired_frequency_days;
  if (!baseline || daysSinceMeaningful < baseline * 1.3) return null;
  const isImportant = contact.relationship_type === "close" || contact.relationship_domain === "life";
  if (!isImportant) return null;
  return {
    title: `Reconnect with ${contact.name}`,
    reasoning: `${daysSinceMeaningful} days since meaningful contact (baseline ~${baseline}d). ${availableSlot.label || "A slot"} is open and capacity looks sufficient.`,
    kind: "reconnect",
    confidence: Math.min(0.9, 0.4 + daysSinceMeaningful / (baseline * 4)),
  };
}

/** §8.1/§4.10 — Personal Time availability uit Calendar + PersonalTimeBlocks. */
export function computePersonalTimeAvailability(blocks = [], events = [], { dayStartHour = 6, dayEndHour = 24 } = {}) {
  const totalMin = (dayEndHour - dayStartHour) * 60;
  const today = new Date().toDateString();
  const todayBlocks = (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled");
  const usedMin = todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0);
  const protectedMin = todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0);
  const availableMin = Math.max(0, totalMin - usedMin);
  return { totalMin, usedMin, protectedMin, availableMin, blocks: todayBlocks };
}

/** §8.3 — Social Capacity: combinatie, geen simpele "agenda is leeg" check. */
export function computeSocialCapacity({ availableMin = 0, capacityScore = null, commitmentCount = 0, recoveryNeeded = false }) {
  if (capacityScore == null) return { level: "UNKNOWN", reason: "no_capacity_data" };
  if (recoveryNeeded && capacityScore < 40) return { level: "LOW", reason: "protect_recovery" };
  if (availableMin < 60) return { level: "LOW", reason: "no_available_time" };
  if (commitmentCount >= 4) return { level: "LOW", reason: "overloaded_commitments" };
  if (capacityScore >= 60 && availableMin >= 120) return { level: "GOOD", reason: "capacity_and_space" };
  return { level: "MODERATE", reason: "some_space" };
}

/** §8.2 — Protected-time conflict detectie (signaleert, lost niet automatisch op). */
export function findProtectedConflict(block, proposedStart, proposedEnd) {
  if (!block || !block.is_protected) return false;
  const bs = new Date(block.start).getTime(), be = new Date(block.end).getTime();
  const ps = new Date(proposedStart).getTime(), pe = new Date(proposedEnd).getTime();
  return ps < be && bs < pe;
}