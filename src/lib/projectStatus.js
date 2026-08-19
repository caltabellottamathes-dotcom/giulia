// Shared project-management status metadata for the project workspace.

export const taskStatusMeta = {
  unscheduled: { label: "Te plannen", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
  klaar: { label: "Klaar", color: "text-olive", dot: "bg-olive" },
  done: { label: "Klaar", color: "text-olive", dot: "bg-olive" },
  completed: { label: "Klaar", color: "text-olive", dot: "bg-olive" },
  actief: { label: "Actief", color: "text-powder", dot: "bg-powder" },
  in_progress: { label: "Actief", color: "text-powder", dot: "bg-powder" },
  today: { label: "Vandaag", color: "text-powder", dot: "bg-powder" },
  gepland: { label: "Gepland", color: "text-steel", dot: "bg-steel/60" },
  upcoming: { label: "Gepland", color: "text-steel", dot: "bg-steel/60" },
  wacht: { label: "Wacht op", color: "text-steel", dot: "bg-steel" },
  waiting: { label: "Wacht op", color: "text-steel", dot: "bg-steel" },
  te_specifieren: { label: "Te specificeren", color: "text-steel/70", dot: "bg-steel/35" },
  todo: { label: "Te specificeren", color: "text-steel/70", dot: "bg-steel/35" },
  gepauzeerd: { label: "Gepauzeerd", color: "text-muted-foreground", dot: "bg-steel/30" },
  paused: { label: "Gepauzeerd", color: "text-muted-foreground", dot: "bg-steel/30" },
  overdue: { label: "Te laat", color: "text-charcoal", dot: "bg-charcoal" },
  delegated: { label: "Gedelegeerd", color: "text-powder", dot: "bg-powder/70" },
};

export const taskStatusOptions = [
  { value: "unscheduled", label: "Te plannen" },
  { value: "klaar", label: "Klaar" },
  { value: "actief", label: "Actief" },
  { value: "gepland", label: "Gepland" },
  { value: "wacht", label: "Wacht op" },
  { value: "te_specifieren", label: "Te specificeren" },
  { value: "gepauzeerd", label: "Gepauzeerd" },
];

export const isTaskDone = (t) =>
  t.status === "klaar" || t.status === "done" || t.status === "completed";

export const projectStatusMeta = {
  idea: { label: "Idee", variant: "muted" },
  planning: { label: "Planning", variant: "waiting" },
  in_progress: { label: "Actief", variant: "active" },
  review: { label: "Review", variant: "waiting" },
  waiting: { label: "Wacht op klant", variant: "waiting" },
  afwerking: { label: "Afwering", variant: "active" },
  completed: { label: "Klaar", variant: "completed" },
  paused: { label: "Gepauzeerd", variant: "muted" },
  archived: { label: "Gearchiveerd", variant: "muted" },
};

export const projectStatusOptions = [
  { value: "idea", label: "Idee" },
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "Actief" },
  { value: "review", label: "Review" },
  { value: "waiting", label: "Wacht op klant" },
  { value: "afwerking", label: "Afwering" },
  { value: "completed", label: "Klaar" },
  { value: "paused", label: "Gepauzeerd" },
  { value: "archived", label: "Gearchiveerd" },
];

// Parse a task context "ONDERDEEL · SUBONDERDEEL" into its parts.
export const parseContext = (context) => {
  const parts = context ? context.split(" · ") : [];
  return { ond: parts[0] || "Overig", sub: parts[1] || parts[0] || "Overig" };
};