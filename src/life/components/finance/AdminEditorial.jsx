import React, { useMemo } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { calcPortfolio, upcomingExpenses, fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";

const PISTACHIO = "hsl(var(--life-pistachio))";
const pad = (n) => String(n).padStart(2, "0");

/** AdminEditorial — volledig statisch, lokaal berekend uit de finance-data.
 *  Geen LLM, geen credits, geen loading. Per tab een eigen, deterministische
 *  editorial (zwart op wit, Ridge Deep labels, Whipped Pistachio cijfers). */
function build(tab, data) {
  const portfolios = (data.portfolios || []).filter((p) => !p.archived);
  const expenses = data.expenses || [];
  const incomes = data.incomes || [];
  const docs = data.docs || [];
  const dist = data.dist || { income: 0, reserved: 0, available: 0 };
  const totalMoney = data.totalMoney || 0;
  const totalReserved = data.totalReserved || 0;
  const avail = Math.max(0, dist.available);
  const upcoming = upcomingExpenses(expenses, 30);
  const up14 = upcomingExpenses(expenses, 14);
  const risky = portfolios.map((p) => ({ p, c: calcPortfolio(p, expenses) })).filter((x) => ["short", "critical"].includes(x.c.status));
  const openExpenses = expenses.filter((e) => e.status !== "done");
  const sumUp = (arr) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const due = (e) => (e.daysUntil < 0 ? "Overdue" : e.daysUntil === 0 ? "Due today" : `Due in ${e.daysUntil}d`);

  if (tab === "PORTEFEUILLES") {
    return {
      eyebrow: "PERSONAL ADMIN / PORTEFEUILLES",
      title: risky.length ? `${pad(risky.length)} POTJES LOPEN ACHTER.` : "ALLE POTJES LOPEN MEE.",
      subtitle: risky.length ? "EEN PAAR POTTEN VRAGEN AANDACHT." : "RESERVERINGEN OP KOERS.",
      body: `${portfolios.length} actieve potjes met samen ${fmtEuro(portfolios.reduce((s, p) => s + (p.current_balance || 0), 0))} saldo, tegen een gezamenlijk doel van ${fmtEuro(portfolios.reduce((s, p) => s + (p.target_balance || 0), 0))}.`,
      items: risky.slice(0, 3).map((x) => ({ title: `${x.p.name} • ${x.c.status}`, sub: `Saldo ${fmtEuro(x.p.current_balance || 0)}, aanbevolen ${fmtEuro(x.c.recommended_monthly)}/mnd — volgende ${fmtEuro(x.c.next_expected_payment)}.`, link: "PORTEFEUILLES" })),
      rest: risky.length ? "De overige potjes voldoen aan de reservering." : "Geen potje vraagt op dit moment actie.",
    };
  }
  if (tab === "LASTEN") {
    return {
      eyebrow: "PERSONAL ADMIN / LASTEN",
      title: upcoming.length ? `${pad(upcoming.length)} BETALINGEN NADEREN.` : "RUSTIG — GEEN LASTEN BINNEN 30 DAGEN.",
      subtitle: upcoming.length ? "EEN PAAR LASTEN NADEREN DE VERVALDATUM." : "NIETS OP HET HORIZON.",
      body: `${openExpenses.length} open lasten, waarvan ${upcoming.length} binnen 30 dagen vallen, samen ${fmtEuro(sumUp(upcoming))} waard.`,
      items: up14.slice(0, 3).map((e) => ({ title: `${e.title} • ${due(e)}`, sub: `${fmtEuro(e.amount)} — ${e.daysUntil < 0 ? "loopt al, afrekenen vereist." : "nadert, bevestig of reserveer."}`, link: "LASTEN" })),
      rest: "De overige lasten staan gepland en lopen mee.",
    };
  }
  if (tab === "INKOMEN") {
    const expected = incomes.filter((i) => i.status === "expected");
    return {
      eyebrow: "PERSONAL ADMIN / INKOMEN",
      title: incomes.length ? `${pad(incomes.length)} INKOMSTENSTROMEN.` : "NOG GEEN INKOMEN Geregistreerd.",
      subtitle: incomes.length ? "WAT KOMT WANNEER BINNEN." : "REGISTREER JE INKOMEN.",
      body: `Per maand verwacht ${fmtEuro(dist.income)} tegen ${fmtEuro(dist.reserved)} aan reserveringen — ${fmtEuro(avail)} blijft beschikbaar.`,
      items: expected.slice(0, 3).map((i) => ({ title: `${i.description || i.category || "Inkomen"} • Expected`, sub: `${fmtEuro(i.amount)} (${FREQ_LABELS[i.frequency] || "Maandelijks"})${i.expected_date ? ` — verwacht ${new Date(i.expected_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}.` : "."}`, link: "INKOMEN" })),
      rest: "De rest van je inkomsten staat gepland.",
    };
  }
  if (tab === "FORECAST") {
    return {
      eyebrow: "PERSONAL ADMIN / FORECAST",
      title: "SALDI-ONTWIKKELING IN BEELD.",
      subtitle: "EEN BLIK OP DE KOMENDE MAANDEN.",
      body: `Bij gelijkblijvend tempo houd je ${fmtEuro(avail)} per maand vrij. Houd de potjes met de kortste dekking in de gaten.`,
      items: risky.slice(0, 3).map((x) => ({ title: `${x.p.name} • ${x.c.status}`, sub: `Korte dekking — aanbevolen ${fmtEuro(x.c.recommended_monthly)}/mnd reservering.`, link: "FORECAST" })),
      rest: "Op koers — geen knelpunten op korte termijn.",
    };
  }
  if (tab === "HEALTHY_MONEY") {
    const tight = dist.income > 0 && avail < dist.income * 0.1;
    return {
      eyebrow: "PERSONAL ADMIN / HEALTHY MONEY",
      title: tight ? "BIJNA ALLES IS BESTEMD." : "ER IS RUIMTE OM TE ADEMEM.",
      subtitle: "GELD HEBBEN VS. GELD KUNNEN BESTEDEN.",
      body: `Je hebt ${fmtEuro(totalMoney)} aanwezig waarvan ${fmtEuro(totalReserved)} bestemd is — ${fmtEuro(avail)} blijft echt vrij.${up14.length ? ` Komende ${fmtEuro(sumUp(up14))} aan lasten binnen 14 dagen.` : ""}`,
      items: [
        ...up14.slice(0, 2).map((e) => ({ title: `${e.title} • ${fmtEuro(e.amount)}`, sub: `${e.daysUntil < 0 ? "Loopt al." : `${e.daysUntil}d.`} Bevestig voor je iets besteedt.`, link: "HEALTHY_MONEY" })),
        ...(tight ? [{ title: "Weinig vrije ruimte", sub: "Bijna al je geld heeft een bestemming — wacht met impulsaankopen.", link: "HEALTHY_MONEY" }] : []),
      ].slice(0, 3),
      rest: "De rest kan wachten — geen haast.",
    };
  }
  if (tab === "DOCUMENTEN") {
    const recent = docs.filter((d) => d.status === "recent");
    return {
      eyebrow: "PERSONAL ADMIN / DOCUMENTEN",
      title: docs.length ? `${pad(docs.length)} FINANCIËLE DOCUMENTEN.` : "NOG GEEN DOCUMENTEN.",
      subtitle: docs.length ? "WAT LOOPT, WAT ONTBREEKT." : "KOPPEL JE DOCUMENTEN.",
      body: `${docs.length} documenten, waarvan ${recent.length} in beweging.`,
      items: recent.slice(0, 3).map((d) => ({ title: d.name || d.title || "Document", sub: `${d.document_type || d.type || "doc"} — recent.`, link: "DOCUMENTEN" })),
      rest: "De rest van je dossier is compleet.",
    };
  }
  // OVERVIEW (default)
  const items = [
    ...up14.slice(0, 3).map((e) => ({ title: `${e.title} • ${due(e)}`, sub: `${fmtEuro(e.amount)} ${e.daysUntil < 0 ? "loopt al — afrekenen vereist." : "nadert — bevestig of reserveer op tijd."}`, link: "LASTEN" })),
    ...risky.slice(0, 2).map((x) => ({ title: `${x.p.name} • ${x.c.status}`, sub: `De pot ${x.p.name} loopt achter op de reservering.`, link: "PORTEFEUILLES" })),
  ].slice(0, 3);
  const headline = dist.reserved > dist.income && dist.income > 0 ? "RESERVATIONS EXCEED INCOME." : avail < dist.income * 0.1 && dist.income > 0 ? "ALMOST EVERYTHING IS SPOKEN FOR." : "HERE'S WHERE THINGS STAND.";
  return {
    eyebrow: "PERSONAL ADMIN / CURRENT STATE",
    title: headline,
    subtitle: "A CLEAR VIEW OF WHAT'S IN MOTION.",
    body: `Je hebt ${fmtEuro(totalMoney)} aanwezig waarvan ${fmtEuro(totalReserved)} een bestemming heeft; ${fmtEuro(avail)} blijft vrij. Per maand komt ${fmtEuro(dist.income)} binnen tegen ${fmtEuro(dist.reserved)} aan reserveringen.`,
    items,
    rest: "De overige lasten en potjes lopen op koers en hoeven nu geen actie.",
  };
}

export default function AdminEditorial({ tab, data, onNavigate, accent = "hsl(var(--ridge-deep))" }) {
  const e = useMemo(() => build(tab, data), [tab, data]);
  const items = e.items || [];
  const title = (e.title || "").toUpperCase();
  return (
    <div className="flex flex-col min-h-full">
      <section className="mt-5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: PISTACHIO }} />
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: accent }}>{e.eyebrow}</p>
        </div>
        <div className="flex items-start justify-between gap-4 mt-3">
          <h2 className="font-display text-[30px] sm:text-[38px] leading-[0.98] tracking-[-0.03em] text-foreground font-semibold uppercase">{title}</h2>
          <ArrowDown className="w-5 h-5 shrink-0 mt-2" strokeWidth={1.25} style={{ color: PISTACHIO }} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mt-3" style={{ color: accent }}>{e.subtitle}</p>
        <p className="font-body text-[14px] leading-[1.7] text-smoke text-balance mt-5">{e.body}</p>
      </section>

      <div className="mt-6 pt-3 border-t border-foreground/15 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: accent }}>GIULIA · FINANCE EDITORIAL</p>
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: accent }}>AUTO · COMPUTED</p>
      </div>

      <div className="flex-1 min-h-5" />

      {items.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] uppercase tracking-[0.14em] font-bold text-foreground">WHAT NEEDS YOUR ATTENTION</h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold shrink-0" style={{ color: accent }}>{pad(items.length)} ITEMS NEED ACTION</span>
          </div>
          <div className="mt-3 border-t border-foreground/15">
            {items.map((it, i) => {
              const nav = it.link && onNavigate;
              const Tag = nav ? "button" : "div";
              return (
                <Tag key={i} {...(nav ? { onClick: () => onNavigate(it.link) } : {})} className={`flex items-start gap-4 py-4 w-full text-left ${i > 0 ? "border-t border-foreground/12" : ""} ${nav ? "hover:bg-foreground/[0.03] transition group cursor-pointer" : ""}`}>
                  <span className="font-display text-[26px] leading-none font-bold tabular-nums shrink-0 w-9" style={{ color: PISTACHIO }}>{pad(i + 1)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-foreground leading-tight">{it.title}</p>
                    <p className="text-[12px] text-muted-foreground leading-[1.55] mt-1.5">{it.sub}</p>
                  </div>
                  {nav && <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition" style={{ color: accent }} />}
                </Tag>
              );
            })}
          </div>
        </section>
      )}

      <section className={items.length > 0 ? "pt-6" : "pt-3"}>
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: accent }}>THE REST CAN WAIT.</p>
        <p className="font-body text-[13px] leading-[1.6] text-smoke/80 mt-2">{e.rest}</p>
      </section>
    </div>
  );
}