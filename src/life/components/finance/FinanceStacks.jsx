import React, { useState } from "react";
import { Pencil, Trash2, FileText, Film, Music, Image as ImageIcon } from "lucide-react";
import AdminObligationCard from "@/life/components/AdminObligationCard";
import PortfolioCard from "@/life/components/finance/PortfolioCard";
import HealthBadge from "@/life/components/finance/HealthBadge";
import DistributionBar from "@/life/components/finance/DistributionBar";
import WalletsBuildingWidget from "@/life/components/finance/WalletsBuildingWidget";
import PortfolioBarsWidget from "@/life/components/finance/PortfolioBarsWidget";
import ForecastChart from "@/life/components/finance/ForecastChart";
import HebbenBestedenBar from "@/life/components/finance/HebbenBestedenBar";
import HealthyMoneyTab from "@/life/components/finance/HealthyMoneyTab";
import ThingsHandleWidget from "@/life/widgets/new/ThingsHandleWidget";
import NewDocumentsCard from "@/life/components/finance/NewDocumentsCard";
import { fmtEuro, FREQ_LABELS, calcPortfolio, upcomingExpenses } from "@/lib/financeUtils";

const TILE_SHADOW = "-16px 16px 40px -16px rgba(0,0,0,0.30)";
const Tile = ({ children, className = "" }) =>
  <div className={`overflow-hidden rounded-[18px] bg-[#f5f5f4] ${className}`} style={{ boxShadow: TILE_SHADOW }}>{children}</div>;

const Stat = ({ label, value, color, note }) =>
  <div>
    <p className="text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: color || "hsl(var(--muted-foreground))" }}>{label}</p>
    <p className="font-display font-semibold tabular-nums leading-none mt-1 text-2xl" style={{ color: color || "hsl(var(--foreground))" }}>{value}</p>
    <p className="text-[11px] text-muted-foreground mt-1">{note}</p>
  </div>;

function KindIcon({ type, className }) {
  const t = String(type || "").toLowerCase();
  if (t === "image") return <ImageIcon className={className} />;
  if (t === "video") return <Film className={className} />;
  if (t === "music" || t === "audio") return <Music className={className} />;
  return <FileText className={className} />;
}

// Opent een bestand in de MediaStage (zelfde mechanisme als NewDocumentsCard).
const openInMediaStage = (doc) => {
  const detail = { name: doc.name || doc.title, url: doc.url, type: doc.type || "doc" };
  window.__giuliaPendingMedia = detail;
  window.dispatchEvent(new CustomEvent("giulia:open-media", { detail }));
  window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "media" }));
};

/** FinanceStacks — per-tab bento-grid van zwevende widget-kaartjes (zelfde
 *  floating style als de Overview). Document-items openen in de MediaStage. */
export default function FinanceStacks({ tab, data, onOpenPortfolio, onDoneExpense, onEditExpense, onDeleteExpense, onEditIncome, onDeleteIncome, onNavigate }) {
  const { portfolios, expenses, incomes, dist, totalMoney, totalReserved, docs } = data;
  const [potFilter, setPotFilter] = useState("");
  const [showDone, setShowDone] = useState(false);

  if (tab === "OVERVIEW") {
    const badges = (portfolios || []).filter((p) => !p.archived).map((p) => ({ p, calc: calcPortfolio(p, expenses) }));
    const upcoming = upcomingExpenses(expenses, 30);
    return (
      <>
        <PortfolioBarsWidget portfolios={portfolios} expenses={expenses} onOpenPortfolio={onOpenPortfolio} />
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Geld hebben vs. besteden</p>
          <HebbenBestedenBar total={totalMoney} reserved={totalReserved} available={Math.max(0, totalMoney - totalReserved)} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <Stat label="TOTAL MONEY" value={fmtEuro(totalMoney)} color="hsl(var(--smoke))" note="Totaal aanwezig" />
            <Stat label="BESTEMD" value={fmtEuro(totalReserved)} color="hsl(var(--life-olive))" note="Heeft een bestemming" />
            <Stat label="VRIJ" value={fmtEuro(Math.max(0, dist.available))} color="hsl(var(--life-ridge))" note="Vrij besteedbaar" />
            <Stat label="INKOMEN / mnd" value={fmtEuro(dist.income)} note={`Reserveringen ${fmtEuro(dist.reserved)}`} />
          </div>
        </Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Portefeuille health</p>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen portefeuilles.</p>}
            {badges.map(({ p, calc }) =>
              <button key={p.id} onClick={() => onOpenPortfolio(p)} className="flex items-center gap-2 rounded-full bg-foreground/[0.04] pl-2 pr-3 py-1.5 hover:bg-foreground/[0.08] transition">
                <HealthBadge status={calc.status} />
                <span className="text-xs font-medium">{p.name}</span>
              </button>
            )}
          </div>
        </Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Komende betalingen · {upcoming.length}</p>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground italic">Rustig — niets binnen 30 dagen.</p> :
          <div className="flex gap-1 h-28 rounded-xl overflow-hidden shadow-[0_14px_30px_-16px_rgba(0,0,0,0.3)]">
            {upcoming.slice(0, 10).map((e, i) => {
              const bg = ["hsl(var(--life-olive))", "hsl(var(--life-ridge))", "hsl(var(--life-pistachio))"][i % 3];
              const dark = i % 3 === 0;
              return (
                <div key={e.id} style={{ flexGrow: Math.max(Number(e.amount) || 1, 1), flexBasis: 0, background: bg }} className={`flex flex-col justify-end p-2.5 min-w-0 ${dark ? "text-ivory" : "text-foreground"}`}>
                  <p className="text-lg font-display font-semibold tabular-nums leading-none">{fmtEuro(e.amount)}</p>
                  <p className="text-[9px] uppercase tracking-wide font-semibold truncate mt-1 opacity-80">{e.title}</p>
                  <p className="text-[9px] opacity-60">{e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`}</p>
                </div>
              );
            })}
          </div>}
        </Tile>
      </>
    );
  }

  // ---- WALLETS ---- bento: What I'm Building (wallets) + wallet-kaarten
  if (tab === "PORTEFEUILLES") {
    const active = (portfolios || []).filter((p) => !p.archived);
    return (
      <div className="grid gap-4 content-start">
        <WalletsBuildingWidget />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {active.length === 0 && <Tile className="p-4"><p className="text-sm text-muted-foreground italic">Nog geen wallets.</p></Tile>}
          {active.map((p) => <Tile key={p.id}><PortfolioCard portfolio={p} expenses={expenses} onClick={() => onOpenPortfolio(p)} /></Tile>)}
        </div>
      </div>
    );
  }

  // ---- LASTEN ---- bento: komende betalingen + lasten-grid
  if (tab === "LASTEN") {
    let list = (expenses || []).filter((e) => potFilter ? e.portfolio_id === potFilter : true);
    list = list.filter((e) => showDone ? true : e.status !== "done");
    const potName = (id) => (portfolios || []).find((p) => p.id === id)?.name;
    const upcoming = upcomingExpenses(expenses, 30);
    return (
      <div className="grid gap-4 lg:grid-cols-[300px_1.4fr] items-start">
        <ThingsHandleWidget />
        <div className="grid gap-4 content-start">
        <Tile className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={potFilter} onChange={(e) => setPotFilter(e.target.value)} className="rounded-xl glass-1 px-3 py-2 text-sm outline-none">
              <option value="">Alle wallets</option>
              {(portfolios || []).filter((p) => !p.archived).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
              <span>Toon afgerond</span>
            </label>
            <p className="text-xs text-muted-foreground ml-auto">{list.length} lasten</p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3 mt-4">Komende betalingen · {upcoming.length}</p>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground italic">Rustig — niets binnen 30 dagen.</p> :
          <div className="flex gap-1 h-28 rounded-xl overflow-hidden shadow-[0_14px_30px_-16px_rgba(0,0,0,0.3)]">
            {upcoming.slice(0, 10).map((e, i) => {
              const bg = ["hsl(var(--life-olive))", "hsl(var(--life-ridge))", "hsl(var(--life-pistachio))"][i % 3];
              const dark = i % 3 === 0;
              return (
                <div key={e.id} style={{ flexGrow: Math.max(Number(e.amount) || 1, 1), flexBasis: 0, background: bg }} className={`flex flex-col justify-end p-2.5 min-w-0 ${dark ? "text-ivory" : "text-foreground"}`}>
                  <p className="text-lg font-display font-semibold tabular-nums leading-none">{fmtEuro(e.amount)}</p>
                  <p className="text-[9px] uppercase tracking-wide font-semibold truncate mt-1 opacity-80">{e.title}</p>
                  <p className="text-[9px] opacity-60">{e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`}</p>
                </div>
              );
            })}
          </div>}
        </Tile>
        <div className="grid gap-4 sm:grid-cols-2 content-start">
          {list.length === 0 && <Tile className="p-4"><p className="text-sm text-muted-foreground italic">Geen lasten.</p></Tile>}
          {list.map((e) =>
            <Tile key={e.id}>
              <AdminObligationCard
                item={{ ...e, amount: e.expected_amount ?? e.amount, due_date: e.next_payment_date ?? e.due_date }}
                action="Open" focus
                onAction={onDoneExpense} onEdit={onEditExpense} onDelete={onDeleteExpense}
                extra={potName(e.portfolio_id) ? <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mt-1 inline-block">{potName(e.portfolio_id)}</span> : null}
              />
            </Tile>
          )}
        </div>
        </div>
      </div>
    );
  }

  // ---- INKOMEN ---- bento: verdeling + bronnen
  if (tab === "INKOMEN") {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] items-start">
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Maandelijkse verdeling</p>
          <DistributionBar income={dist.income} reserved={dist.reserved} available={dist.available} />
          <div className="mt-4 space-y-1.5">
            {dist.perPortfolio.map((pp) =>
              <div key={pp.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{pp.name}</span>
                <span className="font-display font-semibold tabular-nums">{fmtEuro(pp.reservation)}{pp.recommended !== pp.reservation && <span className="text-[10px] text-muted-foreground ml-1">/{fmtEuro(pp.recommended)}</span>}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm pt-1.5 border-t border-foreground/10">
              <span className="font-semibold">Available</span>
              <span className="font-display font-semibold tabular-nums" style={{ color: "hsl(var(--life-ridge))" }}>{fmtEuro(Math.max(0, dist.available))}</span>
            </div>
          </div>
        </Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Inkomstenbronnen · {(incomes || []).length}</p>
          {(incomes || []).length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen inkomensbronnen.</p>}
          <div className="space-y-2">
            {(incomes || []).map((i) =>
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
            )}
          </div>
        </Tile>
      </div>
    );
  }

  // ---- FORECAST ---- bento: forecast-chart + hebben/besteden + verdeling
  if (tab === "FORECAST") {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] items-start">
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Saldi-ontwikkeling (12 mnd)</p>
          <ForecastChart portfolios={(portfolios || []).filter((p) => !p.archived)} expenses={expenses} months={12} />
        </Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Hebben vs. besteden</p>
          <HebbenBestedenBar total={totalMoney} reserved={totalReserved} available={Math.max(0, totalMoney - totalReserved)} />
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3 mt-5">Maandelijkse verdeling</p>
          <DistributionBar income={dist.income} reserved={dist.reserved} available={dist.available} />
        </Tile>
      </div>
    );
  }

  // ---- HEALTHY MONEY ----
  if (tab === "HEALTHY_MONEY") {
    return <Tile><HealthyMoneyTab data={data} onNavigate={onNavigate} /></Tile>;
  }

  // ---- DOCUMENTEN ---- bento: mediatheek (opent in MediaStage) + gekoppelde docs
  if (tab === "DOCUMENTEN") {
    const active = (docs || []).filter((d) => d.status !== "archived");
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] items-start">
        <Tile className="h-[460px]"><NewDocumentsCard /></Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Gekoppelde documenten · {active.length}</p>
          {active.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen documenten gekoppeld.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {active.slice(0, 8).map((d) => (
              <button key={d.id} onClick={() => openInMediaStage(d)} className="text-left rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 p-3 hover:bg-white/85 transition">
                <div className="flex items-center gap-2 mb-1">
                  <KindIcon type={d.type} className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm font-display font-semibold truncate">{d.name || d.title}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{d.document_type || d.type}</p>
              </button>
            ))}
          </div>
        </Tile>
      </div>
    );
  }

  return null;
}