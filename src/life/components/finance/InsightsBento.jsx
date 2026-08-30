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

/** InsightsBento — Overview-achtige bento voor het Inzichten-tabblad (voorheen
 *  Forecast). Giulia's inzichten (grappig, opgemaakt), saldi-ontwikkeling,
 *  en een archief om terug te kijken, evalueren en leren. Zelfde bento-regels
 *  als Overview: flex-rijen, aspect-tiles, zwevende schaduw, uitgelijnd. */
export default function InsightsBento({ data, ed }) {
  const { portfolios, expenses } = data;
  const active = (portfolios || []).filter((p) => !p.archived);
  const body = ed?.body || "";
  const proposal = ed?.proposal || "";

  return (
    <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] flex flex-col gap-4">
      <div className="flex-[1.3] min-h-0 flex gap-4">
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
        <div className="h-full aspect-[4/3] shrink-0 overflow-hidden rounded-[18px] graph-paper p-4" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Saldi-ontwikkeling · 12 mnd</p>
          <div className="h-[calc(100%-28px)]"><ForecastChart portfolios={active} expenses={expenses} months={12} /></div>
        </div>
      </div>

      <div className="flex-[1.5] flex gap-4 min-h-0">
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