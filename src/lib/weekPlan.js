/**
 * weekPlan.js — helpers om Giulia's weekplanning (WeeklyPlan.plan_data) visueel
 * in de agenda te leggen. Planned blocks zijn strings zoals
 * "09:00–11:00 Deep Work — Bogèst proposal"; we parsen het tijd-prefix.
 */
const BLOCK_RE = /^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})\s*(.*)$/;

export const parsePlanBlock = (item) => {
  if (typeof item !== "string" || !item.trim()) return null;
  const m = item.match(BLOCK_RE);
  if (!m) return { title: item.trim(), allDay: true };
  return {
    startHour: +m[1],
    startMin: +m[2],
    endHour: +m[3],
    endMin: +m[4],
    title: (m[5] || item).trim(),
  };
};

/**
 * plannedBlocksForDate — geplande blokken voor één datum uit de WeeklyPlan.
 * plan is een array van 7 dagen Ma-Zo; index via weekday (Ma=0).
 */
export const plannedBlocksForDate = (weekly, date) => {
  const plan = weekly?.plan_data?.plan;
  if (!Array.isArray(plan)) return [];
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const idx = (d.getDay() + 6) % 7;
  const day = plan[idx];
  if (!day) return [];
  const items = Array.isArray(day.items) ? day.items : [];
  return items.map(parsePlanBlock).filter(Boolean);
};