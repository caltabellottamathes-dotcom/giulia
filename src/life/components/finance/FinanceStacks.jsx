import React from "react";
import { Pencil, Trash2, FileText, Film, Music, Image as ImageIcon } from "lucide-react";
import HealthBadge from "@/life/components/finance/HealthBadge";
import DistributionBar from "@/life/components/finance/DistributionBar";
import WalletBarChartWidget from "@/life/components/finance/WalletBarChartWidget";
import FinanceHealthCard from "@/life/components/finance/FinanceHealthCard";
import ExpenseAllocationBar from "@/life/components/finance/ExpenseAllocationBar";
import IncomeSourcesWidget from "@/life/components/finance/IncomeSourcesWidget";
import MonthlyIncomeCounter from "@/life/components/finance/MonthlyIncomeCounter";
import WalletsBuildingWidget from "@/life/components/finance/WalletsBuildingWidget";
import MoveMeTransfer from "@/life/components/finance/MoveMeTransfer";
import WalletPhotoCard from "@/life/components/finance/WalletPhotoCard";
import LastenBarsWidget from "@/life/components/finance/LastenBarsWidget";
import PortfolioBarsWidget from "@/life/components/finance/PortfolioBarsWidget";
import ForecastChart from "@/life/components/finance/ForecastChart";
import HebbenBestedenBar from "@/life/components/finance/HebbenBestedenBar";
import HealthyMoneyTab from "@/life/components/finance/HealthyMoneyTab";
import ThingsHandleStrip from "@/life/components/finance/ThingsHandleStrip";
import LastenAllocationCard from "@/life/components/finance/LastenAllocationCard";
import NewDocumentsCard from "@/life/components/finance/NewDocumentsCard";
import MonthlyReceiptForecast from "@/life/components/finance/MonthlyReceiptForecast";
import { fmtEuro, FREQ_LABELS, calcPortfolio, upcomingExpenses } from "@/lib/financeUtils";

const TILE_SHADOW = "-16px 16px 40px -16px rgba(0,0,0,0.30)";
const Tile = ({ children, className = "" }) =>
  <div className={`overflow-hidden rounded-[18px] graph-paper ${className}`} style={{ boxShadow: TILE_SHADOW }}>{children}</div>;

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
export default function FinanceStacks({ tab, data, onOpenPortfolio, onDoneExpense, onEditExpense, onDeleteExpense, onEditIncome, onDeleteIncome, onNavigate, onReload }) {
  const { portfolios, expenses, incomes, dist, totalMoney, totalReserved, docs } = data;

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

  // ---- WALLETS ---- bento: Wallets widget + transfer + 6 wallet PhotoCards (vullen resthoogte)
  if (tab === "PORTEFEUILLES") {
    const wallets = (portfolios || []).filter((p) => !p.archived && p.active !== false).slice(0, 6);
    const PHOTOS = [
      "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/08a2e3d43_Make_blurred_motion_photo_withou_202608281636.jpeg",
      "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/502c59dfe_Textile_in_motion_detail_shot_202608282236.jpeg",
      "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b37f0e218_Photographing_textile_in_motion_2K_202608282236.jpeg",
      "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3e01cb4e4_Textile_in_motion_close-up_2K_202608282234.jpeg",
      "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/12dcc9b96_Textile_in_motion_close-up_2K_202608282233.jpeg",
      "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a651a1b5c_Man_in_motion_close-up_2K_202608282233.jpeg",
    ];
    return (
      <div className="h-full flex flex-col gap-4">
        <WalletsBuildingWidget />
        <MoveMeTransfer />
        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4">
          {wallets.map((p, i) => <WalletPhotoCard key={p.id} wallet={p} expenses={expenses} photoUrl={PHOTOS[i % PHOTOS.length]} />)}
        </div>
      </div>
    );
  }

  // ---- LASTEN ---- Things to handle (volledige breedte strook) + lasten-actie + wallets
  if (tab === "LASTEN") {
    return (
      <div className="h-full flex flex-col gap-4">
        <ThingsHandleStrip />
        <LastenBarsWidget expenses={expenses} portfolios={portfolios} onReload={onReload} />
        <LastenAllocationCard expenses={expenses} portfolios={portfolios} />
      </div>
    );
  }

  // ---- INKOMEN ---- teller (met subtiele verwacht-pijplijn) + verdeling + inkomstenbronnen
  if (tab === "INKOMEN") {
    return (
      <div className="flex flex-col gap-4">
        <MonthlyIncomeCounter />
        <Tile className="p-4">
          <ExpenseAllocationBar />
        </Tile>
        <IncomeSourcesWidget />
      </div>
    );
  }

  // ---- FORECAST ---- bento: forecast-chart + hebben/besteden + verdeling
  if (tab === "FORECAST") {
    return (
      <div className="space-y-4">
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
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Vaste lasten · kassabon geschiedenis</p>
          <MonthlyReceiptForecast portfolios={portfolios} months={6} />
        </div>
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