import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { CircleDot, Wallet, ListChecks, Banknote, LineChart, FileText, HeartPulse } from "lucide-react";
import { logLifeActivity } from "@/lib/lifeActivity";
import {
  calcPortfolio, monthlyDistribution, totalMoney, totalReserved,
  upcomingExpenses,
} from "@/lib/financeUtils";
import SpaceShell from "@/life/components/space/SpaceShell";
import AdminEditorial from "@/life/components/finance/AdminEditorial";
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
  const data = useMemo(() => ({
    portfolios: portfolios.filter((p) => !p.archived),
    expenses, incomes, transactions, docs,
    dist, totalMoney: tm, totalReserved: tr,
    upcoming: upcomingExpenses(expenses, 30),
  }), [portfolios, expenses, incomes, transactions, docs, dist, tm, tr]);

  // Editorial is nu statisch (AdminEditorial) — lokaal berekend, geen LLM, geen credits.

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
        recap={<AdminEditorial tab={tab} data={data} onNavigate={setTab} accent="hsl(var(--ridge-deep))" />}
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