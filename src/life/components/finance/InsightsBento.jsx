import React from "react";
import ReactMarkdown from "react-markdown";
import WalletSineChart from "@/life/components/finance/WalletSineChart";
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

/** InsightsBento — Inzichten-tabblad. Elk element is een eigen bento-tile:
 *  Giulia's inzichten, de kleurrijke saldi-ontwikkeling (per wallet een sinus),
 *  Giulia adviseert, archief (kassabon geschiedenis), uitgaven per maand. */
export default function InsightsBento({ data, ed }) {
  const { portfolios, expenses } = data;
  const active = (portfolios || []).filter((p) => !p.archived);
  const body = ed?.body || "";
  const proposal = ed?.proposal || "";

  return (
    <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] flex flex-col gap-4">
      <div className="flex-[1.25] min-h-0 flex gap-4">
        {/* Giulia's inzichten — eigen tile */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-5" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Giulia's inzichten</p>
          {body ? <ReactMarkdown components={md}>{body}</ReactMarkdown> : <p className="text-sm text-muted-foreground italic">Nog geen inzichten — vernieuw de analyse.</p>}
        </div>
        {/* Saldi-ontwikkeling — kleurrijke sine-grafiek, eigen tile */}
        <div className="flex-[1.15] min-h-0 overflow-hidden rounded-[18px] graph-paper p-4" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Saldi-ontwikkeling · 12 mnd</p>
          <div className="h-[calc(100%-28px)]"><WalletSineChart portfolios={active} expenses={expenses} months={12} /></div>
        </div>
      </div>

      <div className="flex-[1] flex gap-4 min-h-0">
        {/* Giulia adviseert — eigen tile */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-5" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Giulia adviseert</p>
          {proposal ? (
            <ReactMarkdown components={md}>{proposal}</ReactMarkdown>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: ACCENT }}>Giulia adviseert</p>
              <p className="text-sm text-muted-foreground italic">Nog geen voorstel — vernieuw de analyse.</p>
            </>
          )}
        </div>
        {/* Archief — eigen tile */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-[18px] graph-paper p-4" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Archief · kassabon geschiedenis</p>
          <LastenHistoryWidget portfolios={portfolios} months={8} />
        </div>
        {/* Uitgaven per maand — eigen tile */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-[18px] graph-paper p-4" style={{ boxShadow: SHADOW }}>
          <p className={LABEL + " mb-3"}>Uitgaven per maand</p>
          <div className="h-[calc(100%-28px)]"><MonthlyBarChartForecast portfolios={portfolios} months={6} /></div>
        </div>
      </div>
    </div>
  );
}