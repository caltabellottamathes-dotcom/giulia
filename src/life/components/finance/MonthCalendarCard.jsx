import React, { useMemo } from "react";

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const WEEKDAYS = ["M", "D", "W", "D", "V", "Z", "Z"];

/** MonthCalendarCard — vierkante kaart met grafische maandkalender van de
 *  huidige maand. Elke last wordt op zijn betaaldatum gemarkeerd met de kleur
 *  van de gekoppelde wallet. Vandaag is gemarkeerd. */
export default function MonthCalendarCard({ expenses, portfolios }) {
  const { cells, monthLabel } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1).getDay();
    const offset = (first + 6) % 7; // week start Ma
    const days = new Date(y, m + 1, 0).getDate();
    const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
    const byDate = {};
    for (const e of expenses || []) {
      const d = e.next_payment_date || e.due_date;
      if (!d) continue;
      const dd = new Date(d);
      if (dd.getFullYear() === y && dd.getMonth() === m) {
        const k = dd.getDate();
        (byDate[k] = byDate[k] || []).push({ title: e.title, color: colorOf(e.portfolio_id) });
      }
    }
    const arr = [];
    for (let i = 0; i < 42; i++) {
      const dayNum = i - offset + 1;
      const inMonth = dayNum >= 1 && dayNum <= days;
      arr.push({ day: inMonth ? dayNum : null, inMonth, items: byDate[dayNum] || [], today: inMonth && dayNum === now.getDate() });
    }
    const label = now.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    return { cells: arr, monthLabel: label.charAt(0).toUpperCase() + label.slice(1) };
  }, [expenses, portfolios]);

  return (
    <div className="relative h-full aspect-square shrink-0 rounded-[24px] p-3 flex flex-col" style={{ background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-[11px] font-display font-bold uppercase tracking-[-0.01em]" style={{ color: INK }}>{monthLabel}</p>
        <span className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: MUTED }}>maand</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1 shrink-0">
        {WEEKDAYS.map((w, i) => <div key={i} className="text-center text-[8px] uppercase tracking-wide font-bold" style={{ color: MUTED }}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 gap-0.5 flex-1 min-h-0">
        {cells.map((c, i) => (
          <div key={i} className="relative rounded-md flex flex-col items-center justify-start pt-1" style={{ background: c.inMonth ? "rgba(0,0,0,0.03)" : "transparent", outline: c.today ? `1.5px solid hsl(var(--life-olive))` : "none" }}>
            {c.day && (
              <span className="text-[8px] font-display font-bold leading-none" style={{ color: c.today ? "hsl(var(--life-olive))" : INK }}>{c.day}</span>
            )}
            {c.items.length > 0 && (
              <div className="flex flex-wrap gap-[2px] justify-center mt-1 max-w-full px-0.5">
                {c.items.slice(0, 4).map((it, j) => (
                  <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: it.color }} title={it.title} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}