import React from "react";
import PanelShell from "@/glass/components/self/PanelShell";

const PLUM = "#301728", URG = "#d5e24a", OLIVE = "#d8dab3";

export default function InsightsPanel() {
  return (
    <PanelShell
      index="08"
      section="INSIGHTS"
      statement="CAPACITY HAS SHIFTED"
      kicker="LAST 10 DAYS"
      context={[
        { label: "OBSERVED", text: "Beschikbare capacity daalt na dagen met late afspraken." },
        { label: "POSSIBLE CONNECTION", text: "Mogelijk verband met slaapritme aan het eind van de week." },
        { label: "CONFIDENCE", text: "Matig — patroon steunt op 10 dagen, niet op een seizoen." },
      ]}
      actions={[
        { label: "View Pattern", primary: true },
        { label: "Compare Period" },
        { label: "Dismiss" },
        { label: "Save Insight" },
        { label: "Open Insights" },
      ]}
    >
      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-8">
        <div className="flex">
          <div className="flex flex-col justify-between py-1 pr-4 text-storm/40 text-[10px] tabular-nums">
            {[100, 80, 60, 40, 20].map((y) => <span key={y}>{y}</span>)}
          </div>
          <div className="flex-1 relative">
            <svg viewBox="0 0 400 240" className="w-full h-72" preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" y1={i * 50 + 10} x2="400" y2={i * 50 + 10} stroke="rgba(255,255,255,0.05)" />)}
              <path d="M0,150 C40,150 60,60 110,60 C150,60 170,110 220,110 C260,110 280,160 400,170 L400,210 C280,200 260,150 220,150 C170,150 150,100 110,100 C60,100 40,190 0,190 Z" fill="rgba(48,23,40,0.25)" />
              <path d="M0,180 C60,170 100,150 150,160 C200,168 240,140 290,150 C340,158 370,140 400,148" fill="none" stroke={OLIVE} strokeWidth="2" strokeDasharray="5 4" />
              <defs>
                <linearGradient id="insArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PLUM} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={PLUM} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,170 C40,170 60,80 110,80 C150,80 170,130 220,130 C260,130 280,180 400,190 L400,240 L0,240 Z" fill="url(#insArea)" />
              <path d="M0,170 C40,170 60,80 110,80 C150,80 170,130 220,130 C260,130 280,180 400,190" fill="none" stroke={PLUM} strokeWidth="2.5" />
              <line x1="110" y1="80" x2="110" y2="20" stroke={URG} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
              <circle cx="110" cy="80" r="9" fill={URG} />
              <circle cx="110" cy="80" r="16" fill="none" stroke={URG} strokeWidth="1.5" opacity="0.5" />
              <rect x="120" y="40" width="64" height="20" rx="4" fill="rgba(213,226,74,0.12)" stroke="rgba(213,226,74,0.4)" />
              <text x="152" y="53" fill={URG} fontSize="9" textAnchor="middle">PEAK · 08</text>
            </svg>
            <div className="flex justify-between text-storm/40 text-[10px] tracking-wider mt-2">
              {["06", "08", "10", "12", "14", "16"].map((d) => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-marble/20 flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2 text-[10px] tracking-wider text-plum"><span className="w-4 h-1 rounded bg-plum"/>CAPACITY</span>
          <span className="flex items-center gap-2 text-[10px] tracking-wider text-olive"><span className="w-4 h-1 rounded bg-olive"/>MOOD</span>
          <span className="flex items-center gap-2 text-[10px] tracking-wider text-urgent"><span className="w-4 h-2 rounded bg-urgent/20 border border-urgent/40"/>PEAK</span>
        </div>
      </div>
    </PanelShell>
  );
}