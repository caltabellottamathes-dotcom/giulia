import React, { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, calcPortfolio, upcomingExpenses } from "@/lib/financeUtils";
import FinanceHealthCard from "@/life/components/finance/FinanceHealthCard";
import ReservationTreemap from "@/life/components/finance/ReservationTreemap";

const SHADOW = "-16px 16px 40px -16px rgba(0,0,0,0.30)";
const LABEL = "text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold";

const VERDICT_STYLE = {
  SAFE_TO_BUY: { c: "hsl(var(--life-pistachio))", l: "Safe to buy" },
  AFFORDABLE_BUT_WAIT: { c: "hsl(var(--life-ridge))", l: "Affordable, but wait" },
  NOT_A_GOOD_IDEA_RIGHT_NOW: { c: "hsl(var(--smoke))", l: "Not a good idea right now" },
  DO_NOT_BUY: { c: "hsl(var(--life-urgent))", l: "Do not buy" },
  NEEDS_MORE_INFORMATION: { c: "hsl(var(--muted-foreground))", l: "Needs more information" },
};

function buildSnapshot(d, ind, cs) {
  const lines = [];
  lines.push(`TOTAL MONEY €${Math.round(cs.have)} · BESTEMD €${Math.round(cs.reserved)} · KUNNEN BESTEDEN €${Math.round(cs.free)} · KOMENDE BETALINGEN €${Math.round(cs.upcoming)}`);
  lines.push(`Maandinkomen €${Math.round(ind.income)} · verplichtingen €${Math.round(ind.commitments)} · over €${Math.round(ind.available)}`);
  lines.push(`Coverage ${Math.round(ind.coverage * 100)}% · emergency €${Math.round(ind.emergencyBal)} · savings €${Math.round(ind.savings)}`);
  (d.portfolios || []).forEach((p) => lines.push(`- ${p.name}: saldo €${Math.round(p.current_balance || 0)} / doel €${Math.round(p.target_balance || 0)} · status ${calcPortfolio(p, d.expenses).status}`));
  return lines.join("\n");
}

function adviceText(ind, cs) {
  const bits = [];
  if (ind.commitments > ind.income) bits.push("Je vaste lasten zijn momenteel hoger dan je inkomen — weinig vrije ruimte.");
  else bits.push("Je vaste lasten zijn gedekt door je inkomen.");
  if (cs.free < ind.income * 0.1) bits.push("Je komende maand kent weinig vrije ruimte vóór je volgende inkomsten.");
  if (ind.coverage >= 0.8) bits.push("Je portefeuilles lopen grotendeels op koers.");
  else bits.push("Enkele portefeuilles lopen achter — nieuwe ruimte kan daar beter heen.");
  return bits.join(" ");
}

/** HealthyMoneyBento — Overview-achtige bento voor het Healthy Money-tabblad.
 *  Finance Health widget, money-health-indicatoren, de "kan ik dit betalen?"-
 *  check, en geld-hebben-vs-besteden. Zelfde bento-regels als Overview: flex-
 *  rijen, aspect-tiles, zwevende schaduw, uitgelijnd met de titel. */
export default function HealthyMoneyBento({ data }) {
  const { portfolios, expenses, incomes, dist, totalMoney: tm, totalReserved: tr } = data;
  const active = (portfolios || []).filter((p) => !p.archived);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const indicators = useMemo(() => {
    const coverage = active.length ? active.filter((p) => ["safe", "on_track"].includes(calcPortfolio(p, expenses).status)).length / active.length : 0;
    const emergency = active.find((p) => p.kind === "onvoorzien" || p.kind === "sparen");
    const upcoming = upcomingExpenses(expenses, 30).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const savings = active.filter((p) => p.kind === "sparen").reduce((s, p) => s + (Number(p.current_balance) || 0), 0);
    return { income: dist.income, commitments: dist.reserved, available: dist.available, coverage, emergencyBal: Number(emergency?.current_balance) || 0, upcoming, savings };
  }, [active, expenses, dist]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSpend = useMemo(() => {
    const upcoming = upcomingExpenses(expenses, 30).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const free = Math.max(0, tm - tr - Math.max(0, upcoming - tr));
    return { have: tm, reserved: tr, upcoming, free };
  }, [tm, tr, expenses]);

  const snapshot = useMemo(() => buildSnapshot(data, indicators, canSpend), [data, indicators, canSpend]); // eslint-disable-line react-hooks/exhaustive-deps

  const assess = async () => {
    const q = query.trim();
    if (!q) return;
    setBusy(true); setResult(null);
    try {
      const res = await base44.functions.invoke("assessAffordability", { query: q, snapshot });
      if (res && res.ok && res.data) setResult(res.data);
      else setResult({ verdict: "NEEDS_MORE_INFORMATION", reasoning: ["Giulia kon geen analyse maken — probeer met meer detail."], advice: "", impulseCheck: "", waitingPeriod: "" });
    } catch { setResult({ verdict: "NEEDS_MORE_INFORMATION", reasoning: ["Er ging iets mis bij de analyse."], advice: "", impulseCheck: "", waitingPeriod: "" }); }
    finally { setBusy(false); }
  };

  const vs = result ? VERDICT_STYLE[result.verdict] || VERDICT_STYLE.NEEDS_MORE_INFORMATION : null;

  return (
    <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] flex flex-col gap-4">
      <div className="flex-[1.2] min-h-0 flex gap-4">
        <div className="h-full aspect-square shrink-0 overflow-hidden rounded-[20px]" style={{ boxShadow: SHADOW }}>
          <FinanceHealthCard />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-5" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Financial health</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Ind label="Monthly income" v={fmtEuro(indicators.income)} />
            <Ind label="Commitments" v={fmtEuro(indicators.commitments)} />
            <Ind label="Available" v={fmtEuro(indicators.available)} c="hsl(var(--life-ridge))" />
            <Ind label="Coverage" v={`${Math.round(indicators.coverage * 100)}%`} />
            <Ind label="Emergency" v={fmtEuro(indicators.emergencyBal)} />
            <Ind label="Upcoming" v={fmtEuro(indicators.upcoming)} c={indicators.upcoming > Math.max(indicators.available, 1) ? "hsl(var(--life-urgent))" : undefined} />
            <Ind label="Savings" v={fmtEuro(indicators.savings)} />
            <Ind label="Free to spend" v={fmtEuro(canSpend.free)} c="hsl(var(--life-pistachio))" />
          </div>
          <p className="text-[12px] text-muted-foreground mt-4 leading-[1.55]">{adviceText(indicators, canSpend)}</p>
        </div>
      </div>

      <div className="flex-[1.4] flex gap-4 min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-5" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-1"}>Kan ik dit betalen?</p>
          <p className="text-[11px] text-muted-foreground mb-2">Typ iets — Giulia toont de volledige context.</p>
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") assess(); }} placeholder="bv. stoel van €450?" className="flex-1 min-w-0 rounded-xl bg-foreground/[0.05] border border-foreground/12 px-3 py-2.5 text-sm outline-none focus:border-foreground/25" />
            <button onClick={assess} disabled={busy || !query.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-plum text-ivory px-4 py-2.5 text-xs font-semibold disabled:opacity-40">{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}Beoordeel</button>
          </div>
          {result && (
            <div className="mt-4 rounded-xl border border-foreground/12 p-4 bg-white/55">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Resultaat</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: vs.c }}><span className="h-2 w-2 rounded-full" style={{ background: vs.c }} />{result.verdictLabel || vs.l}</span>
              </div>
              {Array.isArray(result.reasoning) && result.reasoning.length > 0 && (
                <ul className="mt-2 space-y-1">{result.reasoning.map((x, i) => <li key={i} className="text-[12px] text-foreground/80 leading-[1.5] flex gap-2"><span style={{ color: vs.c }}>•</span><span>{x}</span></li>)}</ul>
              )}
              {result.advice && <p className="text-[12px] text-foreground/75 leading-[1.5] mt-2">{result.advice}</p>}
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-5" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Geld hebben vs. besteden</p>
          <ReservationTreemap portfolios={portfolios} income={dist.income} />
        </div>
      </div>
    </div>
  );
}

function Ind({ label, v, c }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</p>
      <p className="text-xl font-display font-semibold tabular-nums leading-none mt-1" style={{ color: c || "hsl(var(--foreground))" }}>{v}</p>
    </div>
  );
}