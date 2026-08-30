import React from "react";
import ReactMarkdown from "react-markdown";
import ForecastChart from "@/life/components/finance/ForecastChart";
import LastenHistoryWidget from "@/life/components/finance/LastenHistoryWidget";
import MonthlyBarChartForecast from "@/life/components/finance/MonthlyBarChartForecast";

const SHADOW = "-16px 16px 40px -16px rgba(0,0,0,0.30)";
const ACCENT = "hsl(var(--life-olive))";
const LABEL = "text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold";

const md = {
  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-smoke">{children}</em>,
  p: ({ children }) => <p className="text-[13px] leading-[1.65] text-smoke mb-2.5 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-[13px] text-smoke mb-2">{children}</ul>,
  li: ({ children }) => <li className="leading-[1.5]">{children}</li>,
};

/** InsightsBento — Inzichten-tabblad. Saldi-ontwikkeling als kleurrijke sinus
 *  per wallet (héro, breed + uitgesneden legend), Giulia's inzichten ernaast,
 *  en onderaan archief + uitgaven per maand om terug te kijken. */
export default function InsightsBento({ data, ed }) {
  const { portfolios, expenses } = data;
  const active = (portfolios || []).filter((p) => !p.archived);
  const body = ed?.body || "";
  const proposal = ed?.proposal || "";

  return (
    <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] flex flex-col gap-4">
      {/* HERO — saldi-sinus (breed) + Giulia's inzichten */}
      <div className="flex-[1.45] min-h-0 flex gap-4">
        <div className="flex-[1.55] min-h-0 rounded-[18px] graph-paper p-5 flex flex-col" style={{ boxShadow: SHADOW }}>
          <div className="flex items-center justify-between mb-3">
            <p className={LABEL}>Saldi-ontwikkeling · per wallet · weken</p>
            <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{active.length} wallets</span>
          </div>
          {/* legend — wallet-kleur + naam */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2">
            {active.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color || ["#3b6e8f","#9c8b5a","#6b8e7b","#b0a6a0","#7d7a6a"][i % 5] }} />
                <span className="text-muted-foreground truncate">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0"><ForecastChart portfolios={active} expenses={expenses} months={4} /></div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-5" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Giulia's inzichten</p>
          {body ? <ReactMarkdown components={md}>{body}</ReactMarkdown> : <p className="text-sm text-muted-foreground italic">Nog geen inzichten — vernieuw de analyse.</p>}
          {proposal && (
            <div className="pt-3 mt-3 border-t border-foreground/10">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: ACCENT }}>Giulia adviseert</p>
              <ReactMarkdown components={md}>{proposal}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* ONDER — archief + uitgaven per maand */}
      <div className="flex-[1.1] flex gap-4 min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-4" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Archief · kassabon geschiedenis</p>
          <LastenHistoryWidget portfolios={portfolios} months={8} />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden rounded-[18px] graph-paper p-4" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Uitgaven per maand · terugkijken &amp; leren</p>
          <MonthlyBarChartForecast portfolios={portfolios} months={6} />
        </div>
      </div>
    </div>
  );
}