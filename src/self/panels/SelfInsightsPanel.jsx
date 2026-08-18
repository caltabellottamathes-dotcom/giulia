import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { insightTypeLabel, fmtDate } from "@/lib/selfUtils";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { ArrowUpRight, Eye, X, Check, BarChart3 } from "lucide-react";

export default function SelfInsightsPanel() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const list = await base44.entities.SelfInsight.list("-created_date", 20).catch(() => []); setInsights(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (insights || []).filter((i) => i.status === "active" || i.status === "confirmed"), [insights]);
  const latest = active[0];

  const dismiss = async (id) => { try { await base44.entities.SelfInsight.update(id, { status: "dismissed" }); await load(); } catch { /* ignore */ } };
  const confirm = async (id) => { try { await base44.entities.SelfInsight.update(id, { status: "confirmed" }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const conf = latest?.confidence ?? 0.5;
  const peak = Math.round(conf * 100);

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Self Insights</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} patronen</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">Wat SELF over langere tijd begrijpt.</p>
        <button onClick={() => navigate("/self/insights")} className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Insights <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Area chart with peak */}
      {latest && (
        <div className="glass-card-2 rounded-2xl p-4">
          <svg viewBox="0 0 400 200" className="w-full h-40" preserveAspectRatio="none">
            {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" y1={i * 40 + 10} x2="400" y2={i * 40 + 10} stroke={TRACK} />)}
            <defs>
              <linearGradient id="insAreaMini" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.4" />
                <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,140 C40,140 60,60 110,60 C150,60 170,100 220,100 C260,100 280,150 400,160 L400,200 L0,200 Z" fill="url(#insAreaMini)" />
            <path d="M0,140 C40,140 60,60 110,60 C150,60 170,100 220,100 C260,100 280,150 400,160" fill="none" stroke={BLUE} strokeWidth="2.5" />
            <line x1="110" y1="60" x2="110" y2="20" stroke={SAND} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
            <circle cx="110" cy="60" r="6" fill={SAND} />
            <circle cx="110" cy="60" r="12" fill="none" stroke={SAND} strokeWidth="1.5" opacity="0.5" />
          </svg>
          <div className="flex items-center gap-4 mt-3 text-[9px] tracking-wider">
            <span className="flex items-center gap-1.5" style={{ color: BLUE }}><span className="w-3 h-1 rounded" style={{ background: BLUE }} />SIGNAL</span>
            <span className="flex items-center gap-1.5" style={{ color: SAND }}><span className="w-3 h-2 rounded" style={{ background: "rgba(216,218,179,0.2)", border: `1px solid ${SAND}` }} />PEAK · {peak}</span>
            <span className="text-ivory/45 ml-auto">{active.length} actief</span>
          </div>
        </div>
      )}

      {/* Latest insight */}
      {latest ? (
        <div className="glass-card-2 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", color: BLUE }}>{insightTypeLabel(latest.type)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{latest.title}</p>
              {latest.description && <p className="text-[11px] text-ivory/50 mt-0.5 line-clamp-2">{latest.description}</p>}
            </div>
          </div>
          {latest.period_start && (
            <p className="text-[9px] text-ivory/35 tracking-wider mb-3">{fmtDate(latest.period_start)} — {fmtDate(latest.period_end)}</p>
          )}
          {latest.status === "active" && (
            <div className="flex items-center gap-3">
              <button onClick={() => confirm(latest.id)} className="text-[10px] uppercase tracking-wide font-semibold flex items-center gap-1" style={{ color: SAND }}><Check className="w-3 h-3" /> Bevestig</button>
              <button onClick={() => dismiss(latest.id)} className="text-[10px] uppercase tracking-wide font-semibold flex items-center gap-1 text-ivory/40"><X className="w-3 h-3" /> Negeer</button>
            </div>
          )}
        </div>
      ) : <Empty text="Nog geen patronen ontdekt." />}

      {/* More insights list */}
      {active.length > 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Meer</p>
          <div className="flex flex-col gap-1.5">
            {active.slice(1, 4).map((ins) => (
              <div key={ins.id} className="glass-card-2 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BLUE }} />
                <p className="text-sm text-ivory/70 truncate flex-1">{ins.title}</p>
                <span className="text-[9px] text-ivory/40">{insightTypeLabel(ins.type)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Patronen" icon={Eye} onClick={() => navigate("/self/insights?tab=patterns")} />
          <ActionBtn label="Balans" icon={BarChart3} onClick={() => navigate("/self/insights?tab=balance")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/insights")} />
        </div>
      </div>
    </div>
  );
}