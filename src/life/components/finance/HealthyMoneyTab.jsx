import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, ArrowRight } from "lucide-react";
import { fmtEuro, calcPortfolio, upcomingExpenses } from "@/lib/financeUtils";
import HebbenBestedenBar from "@/life/components/finance/HebbenBestedenBar";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.35)] p-4 ${className}`}>{children}</div>
);
const labelCls = "text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-semibold";

const VERDICT_STYLE = {
  SAFE_TO_BUY: { c: "hsl(var(--life-pistachio))", l: "Safe to buy" },
  AFFORDABLE_BUT_WAIT: { c: "hsl(var(--life-ridge))", l: "Affordable, but wait" },
  NOT_A_GOOD_IDEA_RIGHT_NOW: { c: "hsl(var(--smoke))", l: "Not a good idea right now" },
  DO_NOT_BUY: { c: "hsl(var(--life-urgent))", l: "Do not buy" },
  NEEDS_MORE_INFORMATION: { c: "hsl(var(--muted-foreground))", l: "Needs more information" },
};

/** HealthyMoneyTab — GIULIA's financiële geweten. Geld-hebben vs. geld-kunnen-
 *  besteden, een Money Health momentopname, en een interactieve
 *  "What are you thinking about spending?"-beoordeling via de
 *  assessAffordability-functie (Calculator-sleutel). */
export default function HealthyMoneyTab({ data }) {
  const { portfolios, expenses, incomes, dist, totalMoney: tm, totalReserved: tr } = data;
  const active = (portfolios || []).filter((p) => !p.archived);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const indicators = useMemo(() => {
    const income = dist.income;
    const commitments = dist.reserved;
    const available = dist.available;
    const coverage = active.length ? active.filter((p) => ["safe", "on_track"].includes(calcPortfolio(p, expenses).status)).length / active.length : 0;
    const emergency = active.find((p) => p.kind === "onvoorzien" || p.kind === "sparen");
    const emergencyBal = Number(emergency?.current_balance) || 0;
    const upcoming = upcomingExpenses(expenses, 30).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const savings = active.filter((p) => p.kind === "sparen").reduce((s, p) => s + (Number(p.current_balance) || 0), 0);
    return { income, commitments, available, coverage, emergencyBal, upcoming, savings };
  }, [active, expenses, dist]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSpend = useMemo(() => {
    const upcoming = upcomingExpenses(expenses, 30).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    // echt vrij = aanwezig − bestemd (potjes) − komende verplichtingen die nog niet in potjes zitten
    const free = Math.max(0, tm - tr - Math.max(0, upcoming - tr));
    return { have: tm, reserved: tr, upcoming, free };
  }, [tm, tr, expenses]);

  const snapshot = useMemo(() => buildSnapshot(data, indicators, canSpend), [data, indicators, canSpend]);

  const assess = async () => {
    const q = query.trim();
    if (!q) return;
    setBusy(true); setResult(null);
    try {
      const res = await base44.functions.invoke("assessAffordability", { query: q, snapshot });
      if (res && res.ok && res.data) setResult(res.data);
      else setResult({ verdict: "NEEDS_MORE_INFORMATION", reasoning: ["GIULIA kon geen analyse maken — probeer het opnieuw met iets meer detail."], impulseCheck: "", waitingPeriod: "", advice: "" });
    } catch {
      setResult({ verdict: "NEEDS_MORE_INFORMATION", reasoning: ["Er ging iets mis bij de analyse."], impulseCheck: "", waitingPeriod: "", advice: "" });
    } finally { setBusy(false); }
  };

  return (
    <>
      {/* 1 · MONEY HEALTH */}
      <Card>
        <div className="flex items-center justify-between">
          <p className={labelCls}>Financial health</p>
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-life-ridge">Stable</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <Ind label="Monthly income" v={fmtEuro(indicators.income)} />
          <Ind label="Monthly commitments" v={fmtEuro(indicators.commitments)} />
          <Ind label="Available after commitments" v={fmtEuro(indicators.available)} c="hsl(var(--life-ridge))" />
          <Ind label="Portfolio coverage" v={`${Math.round(indicators.coverage * 100)}%`} />
          <Ind label="Emergency reserve" v={fmtEuro(indicators.emergencyBal)} />
          <Ind label="Upcoming pressure" v={fmtEuro(indicators.upcoming)} c={indicators.upcoming > Math.max(indicators.available, 1) ? "hsl(var(--life-urgent))" : undefined} />
          <Ind label="Savings position" v={fmtEuro(indicators.savings)} />
          <Ind label="Free to spend" v={fmtEuro(canSpend.free)} c="hsl(var(--life-pistachio))" />
        </div>
        <p className="text-[12px] text-muted-foreground mt-3 leading-[1.55]">{adviceText(indicators, canSpend)}</p>
      </Card>

      {/* 2 · GELD HEBBEN VS KUNNEN BESTEDEN */}
      <Card>
        <p className={labelCls + " mb-3"}>Geld hebben vs. geld kunnen besteden</p>
        <HebbenBestedenBar total={canSpend.have} reserved={canSpend.reserved + canSpend.upcoming} available={canSpend.free} />
        <p className="text-[12px] text-muted-foreground mt-3 leading-[1.55]">Having money is not the same as having money available to spend. Geld met een bestemming is nog niet vrij — het wacht op een vaste last of doel.</p>
      </Card>

      {/* 3/8 · CAN I AFFORD THIS? + MONEY CONVERSATION */}
      <Card>
        <p className={labelCls + " mb-1"}>What are you thinking about spending?</p>
        <p className="text-[11px] text-muted-foreground mb-2">Typ anything — GIULIA toont de volledige context erbij.</p>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") assess(); }} placeholder="bv. Kan ik deze stoel van €450 kopen?" className="flex-1 min-w-0 rounded-xl glass-1 px-3 py-2.5 text-sm outline-none" />
          <button onClick={assess} disabled={busy || !query.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-plum text-ivory px-4 py-2.5 text-xs font-semibold disabled:opacity-40">{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}Beoordeel</button>
        </div>
        {result && <ResultCard r={result} />}
      </Card>
    </>
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
function Box({ t, v, sub, c }) {
  return (
    <div className="rounded-xl p-3 bg-white/55 border border-foreground/12">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: c }} />
        <p className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: c }}>{t}</p>
      </div>
      <p className="text-2xl font-display font-semibold tabular-nums mt-1 text-foreground">{v}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function ResultCard({ r }) {
  const vs = VERDICT_STYLE[r.verdict] || VERDICT_STYLE.NEEDS_MORE_INFORMATION;
  return (
    <div className="mt-4 rounded-xl border border-foreground/12 p-4 bg-white/55">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Resultaat</p>
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: vs.c }}><span className="h-2 w-2 rounded-full" style={{ background: vs.c }} />{r.verdictLabel || vs.l}</span>
      </div>
      {Array.isArray(r.reasoning) && r.reasoning.length > 0 && (
        <ul className="mt-2 space-y-1">
          {r.reasoning.map((x, i) => <li key={i} className="text-[12px] text-foreground/80 leading-[1.5] flex gap-2"><span style={{ color: vs.c }}>•</span><span>{x}</span></li>)}
        </ul>
      )}
      {r.impulseCheck && (
        <div className="mt-3 pt-3 border-t border-foreground/10">
          <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-smoke">Impulse check</p>
          <p className="text-[12px] text-foreground/75 leading-[1.5] mt-1">{r.impulseCheck}</p>
        </div>
      )}
      {r.waitingPeriod && (
        <div className="mt-2">
          <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-smoke">Wachttijd</p>
          <p className="text-[12px] text-foreground/75 mt-0.5">{r.waitingPeriod}</p>
        </div>
      )}
      {r.advice && (
        <div className="mt-2">
          <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-smoke">Advies</p>
          <p className="text-[12px] text-foreground/75 leading-[1.5] mt-1">{r.advice}</p>
        </div>
      )}
    </div>
  );
}

function buildSnapshot(d, ind, cs) {
  const lines = [];
  lines.push(`TOTAL MONEY €${Math.round(cs.have)} · BESTEMD €${Math.round(cs.reserved)} · KUNNEN BESTEDEN €${Math.round(cs.free)} · KOMENDE BETALINGEN €${Math.round(cs.upcoming)}`);
  lines.push(`Maandinkomen €${Math.round(ind.income)} · maandelijkse verplichtingen/reserveringen €${Math.round(ind.commitments)} · over €${Math.round(ind.available)}`);
  lines.push(`Portefeuille coverage ${Math.round(ind.coverage * 100)}% · emergency reserve €${Math.round(ind.emergencyBal)} · savings €${Math.round(ind.savings)}`);
  lines.push("Portefeuilles:");
  (d.portfolios || []).forEach((p) => {
    const c = calcPortfolio(p, d.expenses);
    lines.push(`- ${p.name}: saldo €${Math.round(p.current_balance || 0)} / doel €${Math.round(p.target_balance || 0)} · buffer €${Math.round(p.desired_buffer || 0)} · reservering €${Math.round(p.monthly_reservation_actual || 0)}/mnd · status ${c.status} · volgende €${Math.round(c.next_expected_payment)}`);
  });
  lines.push(`Inkomsten: ${(d.incomes || []).map((i) => `${i.description} €${i.amount} ${i.frequency} ${i.expected_date || ""}`).join("; ")}`);
  return lines.join("\n");
}

function adviceText(ind, cs) {
  const bits = [];
  if (ind.commitments > ind.income) bits.push("Je vaste lasten en reserveringen zijn momenteel hoger dan je inkomen — er blijft weinig vrije ruimte.");
  else bits.push("Je vaste lasten zijn momenteel gedekt door je inkomen.");
  if (cs.free < ind.income * 0.1) bits.push("Je komende maand kent weinig vrije ruimte voordat je volgende inkomstenmoment binnenkomt.");
  if (ind.coverage >= 0.8) bits.push("Je portefeuilles lopen grotendeels op koers.");
  else bits.push("Enkele portefeuilles lopen achter — nieuwe vrije ruimte kan daar beter heen.");
  return bits.join(" ");
}