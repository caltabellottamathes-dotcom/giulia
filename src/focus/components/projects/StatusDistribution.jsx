import React from "react";

/** StatusDistribution — bespoke segmented infographic showing how the
 *  project's tasks divide across statuses. The bar is the hero; counts sit
 *  in a compact legend. No paragraphs. */
const SEGMENTS = [
  { key: "klaar", label: "Klaar", color: "bg-olive", match: ["klaar", "done", "completed"] },
  { key: "actief", label: "Actief", color: "bg-powder", match: ["actief", "in_progress", "today"] },
  { key: "gepland", label: "Gepland", color: "bg-powder/55", match: ["gepland", "upcoming"] },
  { key: "wacht", label: "Wacht", color: "bg-steel", match: ["wacht", "waiting"] },
  { key: "te_specifieren", label: "Te spec.", color: "bg-steel/40", match: ["te_specifieren", "todo"] },
];

export default function StatusDistribution({ tasks }) {
  const counts = {};
  SEGMENTS.forEach((s) => {
    counts[s.key] = tasks.filter((t) => s.match.includes(t.status)).length;
  });
  const total = tasks.length || 1;

  return (
    <div>
      <div className="flex h-3.5 rounded-full overflow-hidden bg-muted">
        {SEGMENTS.map((s) => {
          const n = counts[s.key];
          if (!n) return null;
          return (
            <div
              key={s.key}
              className={`${s.color} transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(n / total) * 100}%` }}
              title={`${s.label}: ${n}`}
            />
          );
        })}
        {!tasks.length && <div className="w-full" />}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
        {SEGMENTS.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
            <span className="text-[12px] font-display font-bold tabular-nums">{counts[s.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}