// foodUtils — gedeelde helpers voor de FOOD-laag (LIFE).
export const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];
export const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };
export const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
export const DAY_FULL = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

export function fmtEuro(n) {
  return "€" + (Number(n || 0)).toFixed(2).replace(".", ",");
}

export function timeToMin(t) {
  if (!t) return 9999;
  const parts = String(t).split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/** Actieve week: de week die vandaag overlapt, anders de eerstvolgende planned,
 *  anders de meest recente. */
export function currentWeek(weeks) {
  if (!weeks || !weeks.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overlap = weeks.find((w) => w.date_start && w.date_end && new Date(w.date_start) <= today && new Date(w.date_end) >= today);
  if (overlap) return overlap;
  const upcoming = weeks
    .filter((w) => (w.status === "planned" || w.status === "active") && new Date(w.date_start) > today)
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  if (upcoming.length) return upcoming[0];
  return weeks.slice().sort((a, b) => new Date(b.date_start) - new Date(a.date_start))[0];
}

export function mealsForWeek(meals, weekId) {
  if (!weekId) return [];
  return (meals || [])
    .filter((m) => m.week_id === weekId)
    .sort((a, b) => {
      const da = new Date(a.date + "T00:00:00").getTime();
      const db = new Date(b.date + "T00:00:00").getTime();
      if (da !== db) return da - db;
      return MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type);
    });
}

export function mealsToday(meals, weekId) {
  const todayStr = new Date().toISOString().slice(0, 10);
  return mealsForWeek(meals, weekId).filter((m) => m.date === todayStr);
}

/** Bepaal widget-state: MEAL_NOW / NEXT_MEAL (+ meal) op basis van vandaag. */
export function mealState(meals, weekId) {
  const today = mealsToday(meals, weekId);
  if (!today.length) return { state: "NEXT_MEAL", meal: null, today };
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const current = today.find((m) => Math.abs(timeToMin(m.time) - nowMin) <= 60);
  if (current) return { state: "MEAL_NOW", meal: current, today };
  const next = today.find((m) => timeToMin(m.time) > nowMin);
  if (next) return { state: "NEXT_MEAL", meal: next, today };
  const all = mealsForWeek(meals, weekId);
  const todayStr = new Date().toISOString().slice(0, 10);
  const future = all.find((m) => m.date > todayStr);
  return { state: "NEXT_MEAL", meal: future || null, today };
}

export function remainingInWeek(meals, weekId) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return mealsForWeek(meals, weekId).filter((m) => new Date(m.date + "T00:00:00") >= now).length;
}