import React, { useMemo } from "react";

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const OLIVE = "hsl(var(--life-olive))";

/** Achtergrond van een agendakaart = de wallet-kleur zelf; tekstkleur
 *  automatisch donker/licht afhankelijk van de luminantie van die kleur. */
const lumOf = (hex) => {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const textOn = (hex) => (lumOf(hex) > 0.62 ? INK : "rgba(255,255,255,0.95)");

/** MonthCalendarCard — verticaal chronologisch overzicht van alle lasten.
 *  Alleen wallet-kleuren (geen rood); elke kaart heeft als achtergrond de
 *  kleur van zijn wallet. Klik → stuurt de last naar ThingsToHandle,
 *  wiose glaskaart omhoog schuift en de klok voor deze last laat zien. */
export default function MonthCalendarCard({ expenses, portfolios }) {
  const { items, monthLabel } = useMemo(() => {
    const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
    const now = new Date();
    const list = (expenses || [])
      .filter((e) => e.status !== "done")
      .map((e) => {
        const d = e.next_payment_date || e.due_date;
        return { e, date: d ? new Date(d + "T00:00:00") : null, color: colorOf(e.portfolio_id), amount: Number(e.expected_amount ?? e.amount) || 0 };
      })
      .filter((x) => x.date)
      .sort((a, b) => a.date - b.date);
    const label = now.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    return { items: list, monthLabel: label.charAt(0).toUpperCase() + label.slice(1) };
  }, [expenses, portfolios]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const select = (e) => window.dispatchEvent(new CustomEvent("giulia:things-handle-select", { detail: e }));

  return (
    <div className="relative h-full w-full rounded-[24px] flex flex-col overflow-hidden" style={{ background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      {/* header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: MUTED }}>Chronologisch</p>
          <p className="text-[13px] font-display font-bold uppercase tracking-[-0.01em] leading-none mt-0.5" style={{ color: INK }}>{monthLabel}</p>
        </div>
        <span className="text-[9px] font-mono tabular-nums" style={{ color: MUTED }}>{items.length} lasten</span>
      </div>

      {/* tijdlijn */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3">
        {items.length === 0 && <p className="text-[12px] italic" style={{ color: MUTED }}>Geen geplande lasten.</p>}
        <div className="relative">
          <div className="absolute left-[14px] top-1 bottom-1 w-px" style={{ background: "linear-gradient(to bottom, hsl(var(--life-olive)) 0%, rgba(0,0,0,0.10) 100%)" }} />
          <div className="space-y-2.5">
            {items.map(({ e, date, color, amount }) => {
              const isToday = date.toDateString() === today.toDateString();
              const isPast = date < today && !isToday;
              const day = date.getDate();
              const mon = date.toLocaleDateString("nl-NL", { month: "short" });
              const weekday = date.toLocaleDateString("nl-NL", { weekday: "short" });
              const ink = textOn(color);
              return (
                <div key={e.id} className="relative pl-[34px]">
                  {/* dot op de lijn — wallet-kleur, geen rood */}
                  <div className="absolute left-[8px] top-2 h-3 w-3 rounded-full" style={{ background: color, boxShadow: "0 0 0 3px #f5f5f4" }} />
                  {/* kaart — achtergrond = wallet-kleur */}
                  <button onClick={() => select(e)} className="w-full text-left rounded-xl px-2.5 py-2 hover:-translate-y-0.5 transition-transform" style={{ background: color, boxShadow: "-10px 10px 24px -14px rgba(0,0,0,0.32)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase tracking-wide font-bold truncate" style={{ color: ink, opacity: 0.78 }}>
                        {day} {mon} · {weekday}{isToday ? " · vandaag" : isPast ? " · te laat" : ""}
                      </span>
                      <span className="text-[13px] font-display font-bold tabular-nums leading-none" style={{ color: ink }}>€{Math.round(amount).toLocaleString("en-US")}</span>
                    </div>
                    <p className="text-[11px] font-medium truncate mt-1" style={{ color: ink }}>{e.title}</p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}