// Personal Admin domain helpers — shared across widget / panel / page.
const DAY = 86400000;

export const daysUntil = (d) => (d ? Math.round((new Date(d).getTime() - Date.now()) / DAY) : null);
export const isActive = (o) => !!o && o.status !== "done";
export const isOverdue = (o) => isActive(o) && o.due_date && daysUntil(o.due_date) < 0;

export const comingUp = (obs = []) => obs.filter(isActive).filter((o) => o.due_date).sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date));
export const overdueList = (obs = []) => obs.filter(isOverdue);
export const needsYouList = (obs = []) => obs.filter((o) => isActive(o) && (o.status === "open" || /required|needs|ontbrekt|response/i.test(o.notes || "")));
export const moneyUp = (obs = []) => comingUp(obs).filter((o) => Number(o.amount) > 0 && daysUntil(o.due_date) <= 30).reduce((s, o) => s + Number(o.amount || 0), 0);

export const adminWeather = (obs = []) => {
  const coming = comingUp(obs);
  const od = overdueList(obs).length;
  const ny = needsYouList(obs).length;
  const money = moneyUp(obs);
  let headline = "QUIET FOR NOW", sub = "Niets op komst.";
  if (od > 0) { headline = "ADMIN WEATHER: CLOUDY"; sub = `${od} te laat — pak het op.`; }
  else if (coming.length === 0) { headline = "QUIET FOR NOW"; sub = "Alles is bij."; }
  else if (coming.length <= 2) { headline = "LOOKING GOOD"; sub = `${coming.length} op komst.`; }
  else { headline = `${coming.length} THINGS ARE CIRCLING`; sub = "Het wordt drukker."; }
  return { headline, sub, counts: { coming: coming.length, overdue: od, needsYou: ny, money } };
};

export const radarEvents = (obs = []) => {
  const coming = comingUp(obs);
  return coming.map((o, i) => {
    const d = daysUntil(o.due_date);
    const norm = Math.min(1, Math.max(0.05, d / 30));
    const angle = (i / Math.max(1, coming.length)) * Math.PI * 2 - Math.PI / 2;
    const status = d < 0 ? "urgent" : d <= 7 ? "soon" : "later";
    return { ...o, days: d, norm, angle, status };
  });
};

export const weatherZones = (obs = []) => {
  const coming = comingUp(obs);
  const od = overdueList(obs).length;
  const ny = needsYouList(obs).length;
  return [
    { key: "clear", label: "CLEAR", count: od === 0 ? "—" : `${od}`, status: od === 0 ? "good" : "urgent", note: od === 0 ? "Geen actie nodig" : `${od} te laat` },
    { key: "moving", label: "MOVING", count: coming.length, status: coming.length > 0 ? "soon" : "good", note: `${coming.length} zaken komen eraan` },
    { key: "needs", label: "NEEDS YOU", count: ny, status: ny > 0 ? "urgent" : "good", note: ny > 0 ? `${ny} vereist actie` : "Niemand wacht" },
    { key: "waiting", label: "WAITING", count: obs.filter((o) => /waiting|wacht/i.test(o.notes || "")).length, status: "good", note: "Giulia wacht op anderen" },
  ];
};

export const repeaters = (obs = []) => ({
  monthly: obs.filter((o) => o.recurrence === "monthly"),
  yearly: obs.filter((o) => o.recurrence === "annual" || o.recurrence === "quarterly"),
});

export const friction = (obs = []) => {
  const open = obs.filter((o) => o.status === "open").sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));
  return open[0] || null;
};

export const nextThing = (obs = []) => comingUp(obs)[0] || null;
export const openLoops = (obs = []) => obs.filter((o) => o.status === "open");

export const accentFor = (status) => (status === "urgent" ? "hsl(var(--urgent))" : status === "soon" ? "hsl(var(--life-sand))" : "hsl(var(--life-blue))");

// Weather map — komende 6 weken, dichtheid per datum met een zaak.
export const weatherMap = (obs = []) => {
  const map = {};
  comingUp(obs).forEach((o) => { const k = o.due_date; map[k] = (map[k] || 0) + 1; });
  const dates = Object.keys(map).sort();
  return dates.slice(0, 10).map((d) => ({ date: d, density: map[d] }));
};

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—");
export const fmtMonth = (d) => (d ? new Date(d).toLocaleDateString("nl-NL", { month: "short" }).toUpperCase() : "—");