// Shared project-management status metadata for the project workspace.

export const taskStatusMeta = {
  klaar: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500" },
  done: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500" },
  completed: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500" },
  actief: { label: "Actief", color: "text-olive", dot: "bg-olive" },
  in_progress: { label: "Actief", color: "text-olive", dot: "bg-olive" },
  today: { label: "Vandaag", color: "text-olive", dot: "bg-olive" },
  gepland: { label: "Gepland", color: "text-blue-500", dot: "bg-blue-500" },
  upcoming: { label: "Gepland", color: "text-blue-500", dot: "bg-blue-500" },
  wacht: { label: "Wacht op", color: "text-amber-500", dot: "bg-amber-500" },
  waiting: { label: "Wacht op", color: "text-amber-500", dot: "bg-amber-500" },
  te_specifieren: { label: "Te specificeren", color: "text-foreground/55", dot: "bg-foreground/30" },
  todo: { label: "Te specificeren", color: "text-foreground/55", dot: "bg-foreground/30" },
  gepauzeerd: { label: "Gepauzeerd", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
  paused: { label: "Gepauzeerd", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
  overdue: { label: "Te laat", color: "text-red-500", dot: "bg-red-500" },
  delegated: { label: "Gedelegeerd", color: "text-purple-500", dot: "bg-purple-500" },
};

export const taskStatusOptions = [
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
  planning: { label: "Planning", variant: "waiting" },
  in_progress: { label: "Actief", variant: "active" },
  waiting: { label: "Wacht op klant", variant: "waiting" },
  afwerking: { label: "Afwerking", variant: "active" },
  completed: { label: "Klaar", variant: "completed" },
  archived: { label: "Gearchiveerd", variant: "muted" },
};

export const projectStatusOptions = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "Actief" },
  { value: "waiting", label: "Wacht op klant" },
  { value: "afwerking", label: "Afwerving" },
  { value: "completed", label: "Klaar" },
  { value: "archived", label: "Gearchiveerd" },
];

// Parse a task context "ONDERDEEL · SUBONDERDEEL" into its parts.
export const parseContext = (context) => {
  const parts = context ? context.split(" · ") : [];
  return { ond: parts[0] || "Overig", sub: parts[1] || parts[0] || "Overig" };
};