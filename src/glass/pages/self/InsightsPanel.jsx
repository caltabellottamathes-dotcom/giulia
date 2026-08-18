import React, { useEffect, useMemo, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";
import { insightTypeLabel, fmtDate } from "@/lib/selfUtils";

export default function InsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SelfInsight.list("-created_date", 50).then((i) => setInsights(i || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => (insights || []).filter((i) => i.status === "active" || i.status === "confirmed"), [insights]);
  const latest = active[0];

  const dismiss = async () => { if (!latest) return; try { await base44.entities.SelfInsight.update(latest.id, { status: "dismissed" }); const i = await base44.entities.SelfInsight.list("-created_date", 50); setInsights(i || []); } catch { /* ignore */ } };
  const confirm = async () => { if (!latest) return; try { await base44.entities.SelfInsight.update(latest.id, { status: "confirmed" }); const i = await base44.entities.SelfInsight.list("-created_date", 50); setInsights(i || []); } catch { /* ignore */ } };

  if (loading) return <PanelShell index="08" section="INSIGHTS" statement="LADEN…">{null}</PanelShell>;

  // sparkline from insight confidence or check-in history fallback
  const conf = latest?.confidence ?? 0.5;
  const peak = Math.round(conf * 100);

  return (
    <PanelShell
      index="08"
      section="INSIGHTS"
      statement={latest ? latest.title.toUpperCase() : "GEEN INZICHTEN"}
      kicker={latest ? `LAST ${fmtDate(latest.period_start)} — ${fmtDate(latest.period_end)}` : "WACHTEN OP DATA"}
      context={[
        { label: "OBSERVED", text: latest?.description || "Nog geen inzichten — Giulia ontdekt patronen na meer check-ins." },
        { label: "TYPE", text: latest ? insightTypeLabel(latest.type) : "—" },
        { label: "CONFIDENCE", text: latest ? `${Math.round(conf * 100)}% zekerheid.` : "—" },
      ]}
      actions={[
        { label: "Confirm", primary: true, onClick: confirm },
        { label: "Dismiss", onClick: dismiss },
        { label: "Open Insights", to: "/self/insights" },
      ]}
    >
      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-8">
        <div className="flex">
          <div className="flex flex-col justify-between py-1 pr-4 text-storm/40 text-[10px] tabular-nums">
            {[100, 80, 60, 40, 20].map((y) => <span key={y}>{y}</span>)}
          </div>
          <div className="flex-1 relative">
            <svg viewBox="0 0 400 240" className="w-full h-72" preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" y1={i * 50 + 10} x2="400" y2={i * 50 + 10} stroke={TRACK} />)}
              <path d="M0,150 C40,150 60,60 110,60 C150,60 170,110 220,110 C260,110 280,160 400,170 L400,210 C280,200 260,150 220,150 C170,150 150,100 110,100 C60,100 40,190 0,190 Z" fill="rgba(225,231,239,0.18)" />
              <defs>
                <linearGradient id="insArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,170 C40,170 60,80 110,80 C150,80 170,130 220,130 C260,130 280,180 400,190 L400,240 L0,240 Z" fill="url(#insArea)" />
              <path d="M0,170 C40,170 60,80 110,80 C150,80 170,130 220,130 C260,130 280,180 400,190" fill="none" stroke={BLUE} strokeWidth="2.5" />
              <line x1="110" y1="80" x2="110" y2="20" stroke={SAND} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
              <circle cx="110" cy="80" r="9" fill={SAND} />
              <circle cx="110" cy="80" r="16" fill="none" stroke={SAND} strokeWidth="1.5" opacity="0.5" />
              <rect x="120" y="40" width="64" height="20" rx="4" fill="rgba(216,218,179,0.12)" stroke="rgba(216,218,179,0.4)" />
              <text x="152" y="53" fill={SAND} fontSize="9" textAnchor="middle">PEAK · {peak}</text>
            </svg>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-marble/20 flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2 text-[10px] tracking-wider" style={{ color: BLUE }}><span className="w-4 h-1 rounded" style={{ background: BLUE }} />SIGNAL</span>
          <span className="flex items-center gap-2 text-[10px] tracking-wider" style={{ color: SAND }}><span className="w-4 h-2 rounded" style={{ background: "rgba(216,218,179,0.2)", border: `1px solid ${SAND}` }} />PEAK</span>
          <span className="text-storm/50 text-[10px] tracking-wider">{active.length} actieve inzichten</span>
        </div>
      </div>
    </PanelShell>
  );
}