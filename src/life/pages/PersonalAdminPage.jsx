import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { CircleDot, Wallet, ListChecks, Banknote, LineChart, FileText, HeartPulse } from "lucide-react";
import { logLifeActivity } from "@/lib/lifeActivity";
import {
  calcPortfolio, monthlyDistribution, totalMoney, totalReserved,
  upcomingExpenses,
} from "@/lib/financeUtils";
import SpaceShell from "@/life/components/space/SpaceShell";
import SpaceRecap, { EDITORIAL_SCHEMA, STALE_MS } from "@/life/components/space/SpaceRecap";
import FinanceStacks from "@/life/components/finance/FinanceStacks";
import PortfolioEditor from "@/life/components/finance/PortfolioEditor";
import ExpenseEditor from "@/life/components/finance/ExpenseEditor";
import IncomeEditor from "@/life/components/finance/IncomeEditor";
import PortfolioDetail from "@/life/components/finance/PortfolioDetail";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: CircleDot },
  { key: "PORTEFEUILLES", label: "Portefeuilles", icon: Wallet },
  { key: "LASTEN", label: "Lasten", icon: ListChecks },
  { key: "INKOMEN", label: "Inkomen", icon: Banknote },
  { key: "FORECAST", label: "Forecast", icon: LineChart },
  { key: "HEALTHY_MONEY", label: "Healthy Money", icon: HeartPulse },
  { key: "DOCUMENTEN", label: "Documenten", icon: FileText },
];

const recalcServer = () => base44.functions.invoke("calcReservations", {}).catch(() => null);

function buildSnapshot(tab, d) {
  const lines = [];
  lines.push(`Tab: ${TABS.find((t) => t.key === tab)?.label || tab}`);
  lines.push(`TOTAL MONEY €${Math.round(d.totalMoney)} · RESERVED €${Math.round(d.totalReserved)} · AVAILABLE €${Math.round(Math.max(0, d.dist.available))}`);
  lines.push(`Inkomen /mnd €${Math.round(d.dist.income)} · reserveringen /mnd €${Math.round(d.dist.reserved)}`);
  lines.push(`Portefeuilles: ${d.portfolios.length}`);
  d.portfolios.forEach((p) => {
    const c = calcPortfolio(p, d.expenses);
    lines.push(`- ${p.name} [${p.kind}] saldo €${Math.round(p.current_balance || 0)} · reservering actual €${Math.round(p.monthly_reservation_actual || 0)} (aanbevolen €${Math.round(c.recommended_monthly)}) · volgende €${Math.round(c.next_expected_payment)} ${c.next_payment_date || ""} · status ${c.status}`);
  });
  lines.push(`Lasten totaal: ${d.expenses.length} (${d.expenses.filter((e) => e.status !== "done").length} open)`);
  lines.push("Komende betalingen:");
  upcomingExpenses(d.expenses, 30).slice(0, 8).forEach((e) => lines.push(`- ${e.title} · €${Math.round(e.amount)} · ${e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`}`));
  lines.push(`Inkomstenbronnen: ${d.incomes.length}`);
  d.incomes.forEach((i) => lines.push(`- ${i.description || i.category} · €${i.amount} · ${i.frequency || "monthly"} · ${i.status}`));
  return lines.join("\n");
}

function buildPrompt(tab, d) {
  const label = TABS.find((t) => t.key === tab)?.label || tab;
  const overview = tab === "OVERVIEW";
  return `Je bent GIULIA, de persoonlijke AI-assistent van Salvo. Schrijf een redactioneel overzicht over de actuele staat van zijn persoonlijke financiën${overview ? " (overview)" : ` (${label}-tab)`} in een strak, editorial layout-model (zwart op wit, blauwe accenten, dunne lijnen).

Kernfilosofie: Salvo geeft zijn inkomen vooraf een bestemming. Onderscheid altijd "geld hebben" (saldo) van "geld bestemd" (reservering). Spreek Salvo aan met "je".

Output JSON met deze velden (editorial frame-labels in het Engels zoals de voorbeelden, de inhoud in het Nederlands):
- eyebrow: kleine uppercase blauwe label, formaat "PERSONAL ADMIN / <STAAT>", bijv. "PERSONAL ADMIN / CURRENT STATE".
- title: grote zwarte kop in FULL CAPS met een punt erachter, max ~7 woorden, prikkend. Geen label-woord ervoor.
- subtitle: blauwe uppercase ondertitel, één korte zin.
- body: 1-2 zinnen met concrete cijfers (TOTAL MONEY, RESERVED, AVAILABLE${overview ? "" : `, of ${label}-specifieke data`}).
- footerLeft: blauw editorial label, bijv. "HERE'S HOW WE READ A FRAME".
- footerRight: blauw editorial label, bijv. "(SCROLL)".
- attentionTitle: zwarte uppercase titel aandachtsblok, bijv. "WHAT NEEDS YOUR ATTENTION".
- attentionBadge: blauw uppercase badge, formaat "0N ITEMS NEED ACTION" met het echte aantal urgente items.
- items: 0-3 dingen die nu aandacht vragen — het aantal hangt af van wat er op dit moment echt nodig is (geen vaste 3). Elk item: title (kort), sub (1 zin uitleg met concrete bedragen) en link (één van: OVERVIEW, PORTEFEUILLES, LASTEN, INKOMEN, FORECAST, HEALTHY_MONEY) — de tab waar Salvo heen moet om het op te lossen. Gebruik echte komende betalingen of korte potjes uit de data. Als er niets urgents is, geef een lege array.
- restTitle: blauw uppercase afsluitende kop, bijv. "THE REST CAN WAIT."
- restBody: één geruststellende zin over de rest.

ELKE TAB MOET een unieke, specifieke tekst hebben — niet generisch, niet dezelfde als een andere tab. Schrijf vanuit de hoek van DEZE tab (${label}):
- OVERVIEW → globale samenvatting: totale staat, geld hebben vs bestemd, wat deze maand beweegt.
- PORTEFEUILLES → per-pot analyse: welke potjes lopen goed, welke achter, buffer- en doel-verhoudingen.
- LASTEN → komende en openstaande betalingen: wat moet wanneer betaald, wat loopt te laat.
- INKOMEN → inkomstenstromen: wat komt wanneer binnen, dekking vs reserveringen.
- FORECAST → vooruitblik: verwachte saldi-ontwikkeling en knelpunten in komende maanden.
- HEALTHY_MONEY → financieel geweten: geld hebben vs kunnen besteden, risico's, vrije ruimte.
- DOCUMENTEN → financiële documenten: wat ontbreekt, wat loopt, beheer.
Gebruik concrete data uit de snapshot die bij deze tab hoort. Geen markdown.

Data:
${buildSnapshot(tab, d)}`;
}

export default function PersonalAdminPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => (new URLSearchParams(window.location.search).get("tab") || "OVERVIEW").toUpperCase());
  const [portfolioEditor, setPortfolioEditor] = useState({ open: false, item: null });
  const [expenseEditor, setExpenseEditor] = useState({ open: false, item: null, defaultPortfolioId: null });
  const [incomeEditor, setIncomeEditor] = useState({ open: false, item: null });
  const [detail, setDetail] = useState({ open: false, portfolioId: null });
  const [editorials, setEditorials] = useState({});

  const load = async () => {
    try {
      const [p, e, i, t, d] = await Promise.all([
        base44.entities.Portfolio.list().catch(() => []),
        base44.entities.AdminObligation.list().catch(() => []),
        base44.entities.Income.list().catch(() => []),
        base44.entities.Transaction.list().catch(() => []),
        base44.entities.Document.list().catch(() => []),
      ]);
      setPortfolios(p || []); setExpenses(e || []); setIncomes(i || []); setTransactions(t || []); setDocs(d || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const dist = useMemo(() => monthlyDistribution(incomes, portfolios, expenses), [incomes, portfolios, expenses]);
  const tm = useMemo(() => totalMoney(portfolios, incomes, expenses), [portfolios, incomes, expenses]);
  const tr = useMemo(() => totalReserved(portfolios), [portfolios]);
  const dataSignature = useMemo(() => `${tab}:${Math.round(tm)}:${Math.round(tr)}:${portfolios.length}:${expenses.filter((e) => e.status !== "done").length}:${incomes.length}`, [tab, tm, tr, portfolios, expenses, incomes]);
  const data = useMemo(() => ({
    portfolios: portfolios.filter((p) => !p.archived),
    expenses, incomes, transactions, docs,
    dist, totalMoney: tm, totalReserved: tr,
    upcoming: upcomingExpenses(expenses, 30),
  }), [portfolios, expenses, incomes, transactions, docs, dist, tm, tr]);

  // Pre-warm editorials voor ALLE tabs — EÉN keer per mount (ref-guard), zodat
  // een tab direct Giulia's analyse toont. Per tab gecached in localStorage
  // (data-signature + 8u geldigheid). Niet opnieuw bij elke datawijziging
  // (voorkomt credit-verlies); alleen handmatig via refresh.
  const warmedRef = useRef(false);
  useEffect(() => {
    if (loading || warmedRef.current) return;
    warmedRef.current = true;
    let cancelled = false;
    const sig = `${Math.round(tm)}:${Math.round(tr)}:${portfolios.length}:${expenses.filter((e) => e.status !== "done").length}:${incomes.length}`;
    TABS.forEach(async (t) => {
      const key = `personalAdminV2:${t.key}`;
      const fullSig = `${t.key}:${sig}`;
      let cached = null;
      try { const raw = localStorage.getItem(key); if (raw) { const p = JSON.parse(raw); if (p && p._content && p._sig === fullSig && Date.now() - p._ts < STALE_MS) cached = p._content; } } catch { /* ignore */ }
      if (cached) { setEditorials((prev) => ({ ...prev, [t.key]: { data: cached, loading: false } })); return; }
      setEditorials((prev) => ({ ...prev, [t.key]: { data: prev[t.key]?.data || null, loading: true } }));
      try {
        const res = await base44.functions.invoke("generateAdminRecap", { prompt: buildPrompt(t.key, data), schema: EDITORIAL_SCHEMA });
        if (cancelled) return;
        const d = (res && res.ok && res.data && res.data.title && Array.isArray(res.data.items)) ? res.data : buildFallback(t.key, data);
        localStorage.setItem(key, JSON.stringify({ _content: d, _ts: Date.now(), _sig: fullSig }));
        setEditorials((prev) => ({ ...prev, [t.key]: { data: d, loading: false } }));
      } catch {
        if (cancelled) return;
        setEditorials((prev) => ({ ...prev, [t.key]: { data: prev[t.key]?.data || buildFallback(t.key, data), loading: false } }));
      }
    });
    return () => { cancelled = true; };
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshEditorial = async (tabKey) => {
    setEditorials((prev) => ({ ...prev, [tabKey]: { data: prev[tabKey]?.data || null, loading: true } }));
    try {
      const res = await base44.functions.invoke("generateAdminRecap", { prompt: buildPrompt(tabKey, data), schema: EDITORIAL_SCHEMA });
      const d = (res && res.ok && res.data && res.data.title && Array.isArray(res.data.items)) ? res.data : buildFallback(tabKey, data);
      const sig = `${tabKey}:${Math.round(tm)}:${Math.round(tr)}:${portfolios.length}:${expenses.filter((e) => e.status !== "done").length}:${incomes.length}`;
      localStorage.setItem(`personalAdminV2:${tabKey}`, JSON.stringify({ _content: d, _ts: Date.now(), _sig: sig }));
      setEditorials((prev) => ({ ...prev, [tabKey]: { data: d, loading: false } }));
    } catch {
      setEditorials((prev) => ({ ...prev, [tabKey]: { data: prev[tabKey]?.data || buildFallback(tabKey, data), loading: false } }));
    }
  };

  const activePortfolio = detail.open ? (portfolios.find((p) => p.id === detail.portfolioId) || null) : null;

  const onAdd = () => {
    if (tab === "PORTEFEUILLES") return setPortfolioEditor({ open: true, item: null });
    if (tab === "LASTEN") return setExpenseEditor({ open: true, item: null, defaultPortfolioId: null });
    if (tab === "INKOMEN") return setIncomeEditor({ open: true, item: null });
    return setPortfolioEditor({ open: true, item: null });
  };

  const afterFinanceChange = async () => { await load(); recalcServer(); };

  const doneExpense = async (e) => { try { await base44.entities.AdminObligation.update(e.id, { status: "done", last_payment_date: new Date().toISOString().slice(0, 10) }); await logLifeActivity("Finance", "completed", `${e.title} afgerekend`); await afterFinanceChange(); } catch { /* ignore */ } };
  const deleteExpense = async (e) => { try { await base44.entities.AdminObligation.delete(e.id); await logLifeActivity("Finance", "deleted", `${e.title} verwijderd`); await afterFinanceChange(); } catch { /* ignore */ } };
  const deleteIncome = async (i) => { try { await base44.entities.Income.delete(i.id); await logLifeActivity("Finance", "deleted", `Inkomen verwijderd`); await afterFinanceChange(); } catch { /* ignore */ } };

  return (
    <>
      <SpaceShell
        bgImage={IMAGES.lifePersonalAdmin}
        heroImage="https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg"
        eyebrow="LIFE → FINANCE"
        title={TABS.find((t) => t.key === tab)?.label || "Portefeuilles"}
        tabs={TABS}
        activeTab={tab}
        onTab={setTab}
        navInfo="LIFE · FINANCE"
        onAdd={onAdd}
        cardHeader={(
          <div className="flex items-center justify-between px-5 lg:px-7 pt-4 pb-3 border-b border-foreground/12">
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: "hsl(var(--ridge-deep))" }}>Editorial Admin Summary</p>
            <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: "hsl(var(--ridge-deep))" }}>GIULIA-GIULIA</p>
          </div>
        )}
        recap={<SpaceRecap data={editorials[tab]?.data} loading={editorials[tab]?.loading} onRefresh={() => refreshEditorial(tab)} onNavigate={setTab} accent="hsl(var(--ridge-deep))" />}
      >
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <FinanceStacks
            tab={tab}
            data={data}
            onOpenPortfolio={(p) => setDetail({ open: true, portfolioId: p.id })}
            onDoneExpense={doneExpense}
            onEditExpense={(e) => setExpenseEditor({ open: true, item: e, defaultPortfolioId: e.portfolio_id })}
            onDeleteExpense={deleteExpense}
            onEditIncome={(i) => setIncomeEditor({ open: true, item: i })}
            onDeleteIncome={deleteIncome}
            onNavigate={setTab}
          />
        )}
      </SpaceShell>

      <PortfolioEditor open={portfolioEditor.open} item={portfolioEditor.item} onClose={() => setPortfolioEditor({ open: false, item: null })} onSaved={afterFinanceChange} onDeleted={afterFinanceChange} />
      <ExpenseEditor open={expenseEditor.open} item={expenseEditor.item} portfolios={portfolios} defaultPortfolioId={expenseEditor.defaultPortfolioId} onClose={() => setExpenseEditor({ open: false, item: null, defaultPortfolioId: null })} onSaved={afterFinanceChange} onDeleted={afterFinanceChange} />
      <IncomeEditor open={incomeEditor.open} item={incomeEditor.item} onClose={() => setIncomeEditor({ open: false, item: null })} onSaved={afterFinanceChange} onDeleted={afterFinanceChange} />
      <PortfolioDetail
        portfolio={activePortfolio}
        expenses={expenses}
        transactions={transactions}
        onEditPortfolio={() => { setDetail({ open: false, portfolioId: null }); setPortfolioEditor({ open: true, item: activePortfolio }); }}
        onAddExpense={() => setExpenseEditor({ open: true, item: null, defaultPortfolioId: activePortfolio?.id })}
        onEditExpense={(e) => setExpenseEditor({ open: true, item: e, defaultPortfolioId: e.portfolio_id })}
        onDone={doneExpense}
        onChange={afterFinanceChange}
        onClose={() => setDetail({ open: false, portfolioId: null })}
      />
    </>
  );
}

/** Deterministische fallback-recap (object) voor het editorial overzicht. */
function buildFallback(tab, d) {
  const avail = Math.max(0, d.dist.available);
  const up = upcomingExpenses(d.expenses, 14);
  const items = up.slice(0, 3).map((e) => ({
    title: `${e.title} • ${e.daysUntil < 0 ? "Overdue" : e.daysUntil === 0 ? "Due today" : `Due in ${e.daysUntil}d`}`,
    sub: `Een betaling van €${Math.round(e.amount)} nadert${e.daysUntil < 0 ? " en loopt al — afrekenen vereist." : " — bevestig of reserveer op tijd."}`,
  }));
  const risky = d.portfolios.map((p) => ({ p, c: calcPortfolio(p, d.expenses) })).filter((x) => ["short", "critical"].includes(x.c.status));
  if (items.length === 0 && risky.length) {
    items.push({ title: `${risky[0].p.name} • Short`, sub: `De pot ${risky[0].p.name} staat ${risky[0].c.status} — de reservering loopt achter.` });
  }
  const headline = d.dist.reserved > d.dist.income ? "RESERVATIONS EXCEED INCOME." : avail < d.dist.income * 0.1 ? "ALMOST EVERYTHING IS SPOKEN FOR." : "HERE'S WHERE THINGS STAND.";
  return {
    eyebrow: "PERSONAL ADMIN / CURRENT STATE",
    title: headline,
    subtitle: "A CLEAR VIEW OF WHAT'S IN MOTION.",
    body: `Je hebt €${Math.round(d.totalMoney)} aanwezig waarvan €${Math.round(d.totalReserved)} een bestemming heeft; €${Math.round(avail)} blijft vrij. Per maand komt €${Math.round(d.dist.income)} binnen tegen €${Math.round(d.dist.reserved)} aan reserveringen.`,
    footerLeft: "HERE'S HOW WE READ A FRAME",
    footerRight: "(SCROLL)",
    attentionTitle: "WHAT NEEDS YOUR ATTENTION",
    attentionBadge: `${String(items.length || 0).padStart(2, "0")} ITEMS NEED ACTION`,
    items: items.length ? items : [{ title: "Portfolio • On track", sub: "Geen direct urgente betalingen — de potjes lopen mee." }],
    restTitle: "THE REST CAN WAIT.",
    restBody: "De overige lasten en potjes lopen op koers en hoeven nu geen actie.",
  };
}