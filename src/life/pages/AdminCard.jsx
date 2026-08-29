import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { fmtEuro, calcPortfolio, upcomingExpenses, monthlyDistribution, totalMoney, totalReserved } from "@/lib/financeUtils";
import WalletBarChartWidget from "@/life/components/finance/WalletBarChartWidget";
import WalletTreemapBar from "@/life/components/finance/WalletTreemapBar";
import FinanceHealthCard from "@/life/components/finance/FinanceHealthCard";
import NewDocumentsCard from "@/life/components/finance/NewDocumentsCard";
import RenewOverviewCard from "@/life/components/finance/RenewOverviewCard";
import FinanceStacks from "@/life/components/finance/FinanceStacks";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#b1bfc7";
const GREY = "#CCCCCC";
const BLACK = "#000000";
const INK = "#595c64";
const CARD = "#f5f5f4";
const SHADOW = "0_16px_34px_-18px_rgba(0,0,0,0.20)";
const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];

const BounceBalls = ({ color = "#000", colors, count, size = "clamp(7px, 0.55vw, 10px)", ml = "7px" }) => {
  const n = count || (colors ? colors.length : 1);
  return (
    <span className="inline-flex items-end gap-[3px] align-baseline" style={{ marginLeft: ml }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color: colors ? colors[i] : color, width: size, height: size, animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
};

const TAB_COPY = {
  OVERVIEW: { eyebrow: "Personal Admin | current_state_", title1: "Here's where", title2: "things stand", heading1: "What needs", heading2: "your attention" },
  PORTEFEUILLES: { eyebrow: "Personal Admin | Wallets", title1: "Six wallets,", title2: "each with a job.", heading1: "Which wallets", heading2: "need catching up" },
  LASTEN: { eyebrow: "Personal Admin | Lasten", title1: "What's due,", title2: "and when.", heading1: "Payments", heading2: "coming up" },
  INKOMEN: { eyebrow: "Personal Admin | Inkomen", title1: "What comes", title2: "in, and when.", heading1: "Income", heading2: "to confirm" },
  FORECAST: { eyebrow: "Personal Admin | Forecast", title1: "Where", title2: "you're heading.", heading1: "Pressure", heading2: "points ahead" },
  HEALTHY_MONEY: { eyebrow: "Personal Admin | Healthy Money", title1: "Having money", title2: "is not spending it.", heading1: "Before", heading2: "you spend" },
  DOCUMENTEN: { eyebrow: "Personal Admin | Documenten", title1: "What's filed,", title2: "what's missing.", heading1: "Documents", heading2: "to chase" },
};

const pad2 = (n) => String(n).padStart(2, "0");

function buildDynamic(tab, data) {
  const { portfolios, expenses, incomes, dist, totalMoney: tm, totalReserved: tr } = data;
  const upcoming = upcomingExpenses(expenses, 30);
  const calc = (p) => calcPortfolio(p, expenses.filter((e) => e.portfolio_id === p.id));
  const potsBehind = portfolios.filter((p) => { const c = calc(p); return c.recommended_monthly > 0 && (Number(p.monthly_reservation_actual) || 0) < c.recommended_monthly * 0.8; });
  const pendingIncome = incomes.filter((i) => i.status === "expected" || i.status === "partial");
  let items = [], itemsLabel = "00_", body = "", rest = "";
  const restLabel = "The rest can wait.";

  if (tab === "OVERVIEW" || tab === "LASTEN") {
    items = upcoming.slice(0, 3).map((e, i) => ({ n: pad2(i + 1), title: `${e.title} • ${e.daysUntil < 0 ? "Overdue" : e.daysUntil === 0 ? "Due today" : `Due in ${e.daysUntil}d`}`, desc: `${fmtEuro(e.amount)}${e.next_payment_date ? ` · ${e.next_payment_date}` : ""}` }));
    itemsLabel = `${pad2(items.length)}_payments_due_`;
    const overdue = upcoming.filter((e) => e.daysUntil < 0).length;
    body = `TOTAL MONEY ${fmtEuro(tm)} · BESTEMD ${fmtEuro(tr)} · VRIJ ${fmtEuro(Math.max(0, dist.available))}. ${upcoming.length} betalingen binnen 30 dagen${overdue ? `, waarvan ${overdue} te laat` : ""}.`;
    rest = `${Math.max(0, expenses.length - upcoming.length)} andere lasten staan gepland en vragen geen directe actie.`;
  } else if (tab === "PORTEFEUILLES") {
    items = potsBehind.slice(0, 3).map((p, i) => { const c = calc(p); return { n: pad2(i + 1), title: `${p.name} • Under-reserved`, desc: `Reservering ${fmtEuro(p.monthly_reservation_actual || 0)}/mnd, aanbevolen ${fmtEuro(c.recommended_monthly)}/mnd.` }; });
    itemsLabel = `${pad2(items.length)}_wallets_behind_`;
    body = `${portfolios.length} wallets · TOTAL MONEY ${fmtEuro(tm)} · BESTEMD ${fmtEuro(tr)}. ${potsBehind.length} wallet(s) lopen achter op hun aanbevolen reservering.`;
    rest = `De andere ${Math.max(0, portfolios.length - potsBehind.length)} wallets zijn gezond en hoeven geen actie.`;
  } else if (tab === "INKOMEN") {
    items = pendingIncome.slice(0, 3).map((i, idx) => ({ n: pad2(idx + 1), title: `${i.description || i.category || "Inkomen"} • Expected`, desc: `${fmtEuro(i.amount)}${i.expected_date ? ` · ${i.expected_date}` : ""}` }));
    itemsLabel = `${pad2(items.length)}_streams_pending_`;
    body = `INKOMEN/mnd ${fmtEuro(dist.income)} · RESERVERINGEN/mnd ${fmtEuro(dist.reserved)} · VRIJ ${fmtEuro(Math.max(0, dist.available))}. ${pendingIncome.length} stroom nog niet ontvangen.`;
    rest = `Alle andere inkomstenstromen zijn deze maand op tijd binnen.`;
  } else if (tab === "FORECAST") {
    const pressured = portfolios.filter((p) => ["watch", "short", "critical"].includes(p.status));
    items = pressured.slice(0, 3).map((p, i) => ({ n: pad2(i + 1), title: `${p.name} • ${String(p.status || "").toUpperCase()}`, desc: `Saldo ${fmtEuro(p.current_balance || 0)} · volgende ${fmtEuro(p.next_expected_payment || 0)}` }));
    itemsLabel = `${pad2(items.length)}_pressure_points_`;
    body = `Vooruitblik op ${portfolios.length} potjes. ${pressured.length} potje(s) staan onder druk voor de komende maand.`;
    rest = `De overige potjes blijven binnen hun gezonde bereik.`;
  } else if (tab === "HEALTHY_MONEY") {
    items = [{ n: "01", title: "Impulse • Can I afford this", desc: `Vrije ruimte nu: ${fmtEuro(Math.max(0, dist.available))}.` }];
    itemsLabel = "01_impulse_check_";
    body = `BESTEMD ${fmtEuro(tr)} van TOTAL MONEY ${fmtEuro(tm)} heeft al een bestemming. Vrij besteedbaar: ${fmtEuro(Math.max(0, dist.available))}.`;
    rest = `Je gereserveerde geld is beschermd en niet beschikbaar voor impulsieve uitgaven.`;
  } else if (tab === "DOCUMENTEN") {
    items = [];
    itemsLabel = "00_documents_";
    body = `Financiële documenten bij de hand.`;
    rest = `Alle documenten zijn gekoppeld en vragen geen actie.`;
  }
  return { items, itemsLabel, body, rest, restLabel };
}

export default function AdminCard({ tab, onNavigate, enterDelay = 0 }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editorial, setEditorial] = useState({});
  const [genBusy, setGenBusy] = useState(false);
  const { toast } = useToast();
  const [executing, setExecuting] = useState(null);

  const load = async () => {
    try {
      const [p, e, i, d] = await Promise.all([
        base44.entities.Portfolio.list().catch(() => []),
        base44.entities.AdminObligation.list().catch(() => []),
        base44.entities.Income.list().catch(() => []),
        base44.entities.Document.list().catch(() => []),
      ]);
      const portfolios = (p || []).filter((x) => !x.archived);
      const expenses = e || [];
      const incomes = i || [];
      const docs = d || [];
      const dist = monthlyDistribution(incomes, portfolios, expenses);
      const tm = totalMoney(portfolios, incomes, expenses);
      const tr = totalReserved(portfolios);
      setData({ portfolios, expenses, incomes, docs, dist, totalMoney: tm, totalReserved: tr });
    } catch { setData(null); }
  };
  useEffect(() => { load(); }, []);

  // Stage-edits (wallet/expense) vragen om een herladen van de bento-data.
  useEffect(() => {
    const h = () => load();
    window.addEventListener("giulia:admin-reload", h);
    return () => window.removeEventListener("giulia:admin-reload", h);
  }, []);

  // Editorial (door Giulia geschreven) laden + Renew-knop luistert.
  useEffect(() => {
    const loadEd = async () => {
      try {
        const list = await base44.entities.AdminEditorial.list("-generated_at", 50).catch(() => []);
        const map = {};
        (list || []).forEach((e) => { map[e.tab] = e; });
        setEditorial(map);
      } catch {}
    };
    loadEd();
    const h = () => {
      setGenBusy(true);
      Promise.all([
        base44.functions.invoke("generateAdminEditorial", {}).catch(() => {}),
        base44.functions.invoke("recalcWallets", {}).catch(() => {}),
      ]).then(() => { loadEd(); load(); }).catch(() => {}).finally(() => setGenBusy(false));
    };
    window.addEventListener("giulia:renew-editorial", h);
    return () => window.removeEventListener("giulia:renew-editorial", h);
  }, []);

  // Handlers — done/delete direct + reload; edit/open sturen naar de juiste tab.
  const reload = () => load();
  const goTab = (t) => (onNavigate ? onNavigate(t) : navigate(`/life/personal-admin?tab=${t}`));
  const resolveTab = (it, currentTab) => {
    const t = `${it.title || ""} ${it.desc || ""}`.toLowerCase();
    if (/inkom|expected|received|stroom|ontvang/.test(t)) return "INKOMEN";
    if (/wallet|portefeuille|pot|saldo|reservering|behind|onder-reser/.test(t)) return "PORTEFEUILLES";
    if (/document|factuur|bon|ontbreekt|chase/.test(t)) return "DOCUMENTEN";
    if (/forecast|druk|spanning|voorblijf/.test(t)) return "FORECAST";
    if (/impuls|vrij|besteed|healthy/.test(t)) return "HEALTHY_MONEY";
    return currentTab === "OVERVIEW" ? "LASTEN" : currentTab;
  };
  const handlers = {
    onOpenPortfolio: (p) => goTab("PORTEFEUILLES"),
    onDoneExpense: async (e) => { try { await base44.entities.AdminObligation.update(e.id, { status: "done", last_payment_date: new Date().toISOString().slice(0, 10) }); await reload(); } catch {} },
    onEditExpense: (e) => goTab("LASTEN"),
    onDeleteExpense: async (e) => { try { await base44.entities.AdminObligation.delete(e.id); await reload(); } catch {} },
    onEditIncome: (i) => goTab("INKOMEN"),
    onDeleteIncome: async (i) => { try { await base44.entities.Income.delete(i.id); await reload(); } catch {} },
    onNavigate: goTab,
    onReload: reload,
  };

  const executeItem = async (it) => {
    if (!it || !it.action_type || it.action_type === "none") { goTab(resolveTab(it, tab)); return; }
    setExecuting(it.n);
    try {
      const res = await base44.functions.invoke("executeActiepunt", { item: it });
      toast({ title: res?.ok ? `Actie uitgevoerd · ${it.title}` : "Actie niet gelukt", variant: res?.ok ? "default" : "destructive" });
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
      load();
    } catch (e) {
      toast({ title: "Actie niet gelukt", variant: "destructive" });
    } finally { setExecuting(null); }
  };

  const c = TAB_COPY[tab] || TAB_COPY.OVERVIEW;
  const dyn = data ? buildDynamic(tab, data) : null;
  const ed = editorial[tab] || null;
  const cleanTail = (s) => String(s).replace(/[.,;:!?]+$/, "").trim();
  const items = ed?.items?.length ? ed.items : (dyn?.items || []);
  const bodyText = ed?.body || dyn?.body || (data ? "" : "Laden…");
  const proposal = ed?.proposal || "";
  const itemsLabel = ed?.items_label || dyn?.itemsLabel || "";
  const restLabel = ed?.rest_label || dyn?.restLabel || "The rest can wait.";
  const rest = ed?.rest || dyn?.rest || "";
  const t1 = cleanTail(ed?.title1 || c.title1);
  const t2 = cleanTail(ed?.title2 || c.title2);
  const h1 = cleanTail(ed?.heading1 || c.heading1);
  const h2 = cleanTail(ed?.heading2 || c.heading2);
  const [eyeA, ...eyeRest] = (ed?.eyebrow || c.eyebrow).split("|");
  const eyeB = eyeRest.length ? " | " + eyeRest.join("|").trim() : "";

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: enterDelay }}
      className="absolute inset-0 rounded-bl-[20px] rounded-r-none graph-paper flex overflow-hidden shadow-[-40px_8px_64px_-18px_rgba(0,0,0,0.55)]"
    >
      {/* Editorial — left ~42% */}
      <div className="relative z-0 w-[38%] h-full flex flex-col overflow-y-auto no-scrollbar border-r" style={{ borderColor: GREY }}>
        <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">{eyeA.trim()}</span>{eyeB}</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
          </div>

          <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(34px, 3vw, 54px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
            {t1}<br />{t2}<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
          </h2>

          <div className="ml-[80px] mt-8 space-y-2">
            <p className="font-display font-medium tracking-[-0.05em] text-[12px]" style={{ color: BLACK }}>{data ? `${fmtEuro(data.totalMoney)} beschikbaar · ${data.portfolios.length} potjes` : "Laden…"}</p>
            <p className="font-body text-[12px] leading-[1.55] whitespace-pre-line" style={{ color: INK }}>{bodyText}</p>
            {proposal && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: GREY }}>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: BLUE }}><span className="font-bold">Voorstel</span> | Giulia adviseert_</p>
                <p className="font-body text-[12px] leading-[1.55] whitespace-pre-line" style={{ color: INK }}>{proposal}</p>
              </div>
            )}
            {genBusy && <p className="font-mono text-[9px] tracking-[0.18em] uppercase mt-2 animate-pulse" style={{ color: BLUE }}>Giulia schrijft…</p>}
          </div>

          <div className="flex-1 min-h-8" />

          <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5" style={{ color: NUM_COLORS[0], fontSize: "clamp(24px, 1.9vw, 38px)" }}>
            {h1}<br />{h2}<BounceBalls colors={NUM_COLORS} />
          </h3>

          <div className="h-px w-full" style={{ background: "#d8dab3" }} />
          <div className="flex items-center justify-between mt-5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">On what matters</span> | now_</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
          </div>

          <div className="mt-4 ml-[80px] space-y-3">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>{itemsLabel}</p>
            {items.length === 0 && <p className="font-body text-[12px]" style={{ color: INK }}>{data ? "Niets dringends." : "Laden…"}</p>}
            {items.map((it, idx) => (
              <button key={it.n} onClick={() => executeItem(it)} disabled={executing === it.n} className="flex gap-3 items-end text-left w-full hover:opacity-70 transition disabled:opacity-40">
                <span className="w-[84px] shrink-0 flex justify-end items-end gap-[5px]">
                  <BounceBalls color={NUM_COLORS[idx % 3]} count={idx + 1} ml="0" />
                  <span className="font-display font-bold leading-none" style={{ color: NUM_COLORS[idx % 3], fontSize: "30px" }}>{it.n}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-display ${it.desc ? "font-bold text-[13px]" : "font-medium text-[12.5px] leading-[1.4]"} leading-tight`} style={{ color: NUM_COLORS[idx % 3] }}>{it.title}</p>
                  {it.desc && <p className="font-body text-[12px] leading-[1.4] mt-1" style={{ color: "#333" }}>{it.desc}</p>}
                  {it.action_type && it.action_type !== "none" && (
                    <span className="inline-flex items-center gap-1 mt-1.5 font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: BLUE }}>
                      {executing === it.n ? "uitvoeren…" : `→ ${it.action_type === "pay" ? "betalen" : it.action_type === "transfer" ? "verplaatsen" : "reserveren"}`}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>{restLabel}</p>
            <p className="font-body text-[12.5px] leading-[1.5] mt-3 whitespace-pre-line" style={{ color: "#333" }}>{rest}</p>
          </div>
        </div>
      </div>

      {/* RECHTS — Overview: 2 widgets + bento. Andere tabs: echte FinanceStacks-elementen. */}
      <div className="relative z-20 flex-1 min-w-0 h-full flex flex-col overflow-visible">
        {tab === "OVERVIEW" ? (
          <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] flex flex-col gap-4">
            <div className="flex-[1.2] min-h-0 flex gap-4">
              <div className="flex-1 min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
                <RenewOverviewCard />
              </div>
              <div className="h-full aspect-[3/2] shrink-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.35)" }}>
                <WalletBarChartWidget />
              </div>
            </div>
            <div className="flex-[1.5] flex gap-4 min-h-0">
              <div className="h-full aspect-square shrink-0 overflow-hidden rounded-[20px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.35)" }}>
                <FinanceHealthCard />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.3)" }}>
                <NewDocumentsCard />
              </div>
            </div>
            <div className="flex-[0.5] min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-14px 14px 36px -16px rgba(0,0,0,0.32)" }}>
              <WalletTreemapBar />
            </div>
          </div>
        ) : (tab === "PORTEFEUILLES" || tab === "LASTEN") ? (
          <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto">
            {data ? (
              <FinanceStacks tab={tab} data={data} {...handlers} />
            ) : (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
              </div>
            )}
          </div>
        ) : tab === "INKOMEN" ? (
          <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px]">
            {data ? (
              <FinanceStacks tab={tab} data={data} {...handlers} />
            ) : (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pl-8">
            {data ? (
              <FinanceStacks tab={tab} data={data} {...handlers} />
            ) : (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}