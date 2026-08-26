import React, { useState } from "react";
import { CheckCircle2, Pencil, Trash2, Plus, FileText } from "lucide-react";
import AdminObligationCard from "@/life/components/AdminObligationCard";
import PortfolioCard from "@/life/components/finance/PortfolioCard";
import HealthBadge from "@/life/components/finance/HealthBadge";
import DistributionBar from "@/life/components/finance/DistributionBar";
import ThingsHandleHorizontal from "@/life/components/finance/ThingsHandleHorizontal";
import ForecastChart from "@/life/components/finance/ForecastChart";
import { fmtEuro, FREQ_LABELS, calcPortfolio, upcomingExpenses } from "@/lib/financeUtils";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.35)] p-4 ${className}`}>{children}</div>
);

const Stat = ({ label, value, color, note }) => (
  <div>
    <p className="text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: color || "hsl(var(--muted-foreground))" }}>{label}</p>
    <p className="text-3xl font-display font-semibold tabular-nums leading-none mt-1" style={{ color: color || "hsl(var(--foreground))" }}>{value}</p>
    <p className="text-[11px] text-muted-foreground mt-1">{note}</p>
  </div>
);

/** FinanceStacks — per-tab widget-stapel voor de Finance Space. */
export default function FinanceStacks({ tab, data, onOpenPortfolio, onDoneExpense, onEditExpense, onDeleteExpense, onEditIncome, onDeleteIncome }) {
  const { portfolios, expenses, incomes, dist, totalMoney, totalReserved, docs } = data;
  const [potFilter, setPotFilter] = useState("");
  const [showDone, setShowDone] = useState(false);

  if (tab === "OVERVIEW") {
    const badges = (portfolios || []).filter((p) => !p.archived).map((p) => ({ p, calc: calcPortfolio(p, expenses) }));
    const upcoming = upcomingExpenses(expenses, 30);
    return (
      <>
        <ThingsHandleHorizontal />
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Geld hebben vs. besteden</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="TOTAL MONEY" value={fmtEuro(totalMoney)} color="hsl(var(--d-focus-deep))" note="Totaal aanwezig" />
            <Stat label="RESERVED" value={fmtEuro(totalReserved)} color="hsl(var(--olive))" note="Heeft een bestemming" />
            <Stat label="AVAILABLE" value={fmtEuro(Math.max(0, dist.available))} color="hsl(var(--d-focus-light))" note="Vrij besteedbaar" />
            <Stat label="INKOMEN / mnd" value={fmtEuro(dist.income)} note={`Reserveringen ${fmtEuro(dist.reserved)}`} />
          </div>
          <div className="mt-4">
            <DistributionBar income={dist.income} reserved={dist.reserved} available={dist.available} />
          </div>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Portefeuille health</p>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen portefeuilles.</p>}
            {badges.map(({ p, calc }) => (
              <button key={p.id} onClick={() => onOpenPortfolio(p)} className="flex items-center gap-2 rounded-full bg-foreground/[0.04] pl-2 pr-3 py-1.5 hover:bg-foreground/[0.08] transition">
                <HealthBadge status={calc.status} />
                <span className="text-xs font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Komende betalingen · {upcoming.length}</p>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground italic">Rustig — niets binnen 30 dagen.</p> : (
            <div className="flex gap-1 h-28 rounded-xl overflow-hidden shadow-[0_14px_30px_-16px_rgba(0,0,0,0.3)]">
              {upcoming.slice(0, 10).map((e, i) => {
                const bg = ["hsl(var(--d-focus-deep))", "hsl(var(--d-focus-light))", "hsl(var(--d-focus-urgent))"][i % 3];
                const dark = i % 3 === 0;
                return (
                  <div key={e.id} style={{ flexGrow: Math.max(Number(e.amount) || 1, 1), flexBasis: 0, background: bg }} className={`flex flex-col justify-end p-2.5 min-w-0 ${dark ? "text-ivory" : "text-foreground"}`}>
                    <p className="text-lg font-display font-semibold tabular-nums leading-none">{fmtEuro(e.amount)}</p>
                    <p className="text-[9px] uppercase tracking-wide font-semibold truncate mt-1 opacity-80">{e.title}</p>
                    <p className="text-[9px] opacity-60">{e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </>
    );
  }

  if (tab === "PORTEFEUILLES") {
    const active = (portfolios || []).filter((p) => !p.archived);
    return (
      <>
        {active.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Nog geen portefeuilles. Voeg er een toe om je inkomen een bestemming te geven.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {active.map((p) => <PortfolioCard key={p.id} portfolio={p} expenses={expenses} onClick={() => onOpenPortfolio(p)} />)}
        </div>
      </>
    );
  }

  if (tab === "LASTEN") {
    let list = (expenses || []).filter((e) => potFilter ? e.portfolio_id === potFilter : true);
    list = list.filter((e) => showDone ? true : e.status !== "done");
    const potName = (id) => (portfolios || []).find((p) => p.id === id)?.name;
    return (
      <>
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <select value={potFilter} onChange={(e) => setPotFilter(e.target.value)} className="rounded-xl glass-1 px-3 py-2 text-sm outline-none">
              <option value="">Alle portefeuilles</option>
              {(portfolios || []).filter((p) => !p.archived).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
              <span>Toon afgerond</span>
            </label>
            <p className="text-xs text-muted-foreground ml-auto">{list.length} lasten</p>
          </div>
        </Card>
        {list.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Geen lasten.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((e) => (
            <AdminObligationCard
              key={e.id}
              item={{ ...e, amount: e.expected_amount ?? e.amount, due_date: e.next_payment_date ?? e.due_date }}
              action="Open" focus
              onAction={onDoneExpense} onEdit={onEditExpense} onDelete={onDeleteExpense}
              extra={potName(e.portfolio_id) ? <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mt-1 inline-block">{potName(e.portfolio_id)}</span> : null}
            />
          ))}
        </div>
      </>
    );
  }

  if (tab === "INKOMEN") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Maandelijkse verdeling</p>
          <DistributionBar income={dist.income} reserved={dist.reserved} available={dist.available} />
          <div className="mt-4 space-y-1.5">
            {dist.perPortfolio.map((pp) => (
              <div key={pp.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{pp.name}</span>
                <span className="font-display font-semibold tabular-nums">{fmtEuro(pp.reservation)}{pp.recommended !== pp.reservation && <span className="text-[10px] text-muted-foreground ml-1">/{fmtEuro(pp.recommended)}</span>}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-1.5 border-t border-foreground/10">
              <span className="font-semibold">Available</span>
              <span className="font-display font-semibold tabular-nums" style={{ color: "hsl(var(--d-focus-light))" }}>{fmtEuro(Math.max(0, dist.available))}</span>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Inkomstenbronnen · {(incomes || []).length}</p>
          {(incomes || []).length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen inkomensbronnen.</p>}
          <div className="space-y-2">
            {(incomes || []).map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/55 backdrop-blur-md border border-white/60 p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-display font-semibold truncate">{i.description || i.category || "Inkomen"}</p>
                  <p className="text-[10px] text-muted-foreground">{FREQ_LABELS[i.frequency] || "Maandelijks"} · {i.status}{i.expected_date ? ` · ${new Date(i.expected_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display font-semibold tabular-nums">{fmtEuro(i.amount)}</span>
                  <button onClick={() => onEditIncome(i)} className="p-1.5 rounded-lg hover:bg-foreground/10 transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDeleteIncome(i)} className="p-1.5 rounded-lg hover:bg-foreground/10 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </>
    );
  }

  if (tab === "FORECAST") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Saldi-ontwikkeling (12 mnd)</p>
          <ForecastChart portfolios={(portfolios || []).filter((p) => !p.archived)} expenses={expenses} months={12} />
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Maandelijkse verdeling</p>
          <DistributionBar income={dist.income} reserved={dist.reserved} available={dist.available} />
        </Card>
      </>
    );
  }

  if (tab === "DOCUMENTEN") {
    const active = (docs || []).filter((d) => d.status !== "archived");
    return (
      <>
        <Card>
          <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /><p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Financiële documenten</p></div>
          <p className="text-3xl font-display font-semibold tabular-nums mt-1">{active.length}<span className="text-sm text-muted-foreground font-normal ml-2">actief · {active.filter((d) => d.status === "recent").length} in beweging</span></p>
        </Card>
        {active.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Nog geen documenten gekoppeld.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {active.slice(0, 6).map((d) => (
            <div key={d.id} className="rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.35)] p-4">
              <p className="text-sm font-display font-semibold truncate">{d.name || d.title}</p>
              <p className="text-[10px] text-muted-foreground">{d.document_type || d.type}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  return null;
}