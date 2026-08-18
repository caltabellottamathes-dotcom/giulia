// SELF accent palette — de enige twee kleuren voor visualisaties & knoppen.
// Accent 1: lichtblauw · Accent 2: zand.
export const BLUE = "#e1e7ef";
export const SAND = "#d8dab3";
export const STORM = "#F2F2F0";

export const TRACK = "rgba(255,255,255,0.06)";
export const MUTED = "rgba(255,255,255,0.5)";

// Mood → 0-100 score voor ring-visualisatie
export function moodScore(mood) {
  return { good: 80, energetic: 92, neutral: 60, tired: 38, low: 28, anxious: 20 }[mood] || 55;
}

// preferred_time → approx uur voor tijdlijn
export function timeForPref(pref) {
  return { morning: "08:00", afternoon: "13:00", evening: "18:00", night: "22:00" }[pref] || "12:00";
}

// (h, m) → minuten sinds middernacht
export function toMin(t) {
  if (!t) return 0;
  const [h, m] = String(t).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function fmtDur(min) {
  if (min == null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}