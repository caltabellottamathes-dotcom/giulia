import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "@/system/panels/previewParts";
import { insightTypeColor, insightTypeLabel, fmtDate } from "@/lib/selfUtils";
import { ArrowUpRight, Eye, X, Check, BarChart3 } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

/** Self Insights panel — actieve inzichten en patronen. */
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
  const patterns = useMemo(() => active.filter((i) => i.type === "pattern" || i.type === "behavior"), [active]);
  const balance = useMemo(() => active.filter((i) => i.type === "balance" || i.type === "imbalance"), [active]);
  const capacity = useMemo(() => active.filter((i) => i.type === "capacity" || i.type === "overload"), [active]);

  const dismiss = async (id) => { try { await base44.entities.SelfInsight.update(id, { status: "dismissed" }); await load(); } catch { /* ignore */ } };
  const confirm = async (id) => { try { await base44.entities.SelfInsight.update(id, { status: "confirmed" }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Self Insights</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} patronen</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">Wat SELF over langere tijd begrijpt.</p>
      </div>

      {/* New insights */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Nieuwe inzichten</p>
        {active.length ? (
          <div className="flex flex-col gap-2">
            {active.slice(0, 4).map((ins) => (
              <Card key={ins.id} accent={insightTypeColor(ins.type)} onClick={() => navigate("/self/insights")}>
                <div className="flex items-start gap-2">
                  <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", color: insightTypeColor(ins.type) }}>{insightTypeLabel(ins.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{ins.title}</p>
                    {ins.description && <p className="text-[11px] text-ivory/50 mt-0.5 line-clamp-2">{ins.description}</p>}
                  </div>
                </div>
                {ins.status === "active" && (
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={(e) => { e.stopPropagation(); confirm(ins.id); }} className="text-[10px] uppercase tracking-wide font-semibold flex items-center gap-1" style={{ color: SAGE }}><Check className="w-3 h-3" /> Bevestig</button>
                    <button onClick={(e) => { e.stopPropagation(); dismiss(ins.id); }} className="text-[10px] uppercase tracking-wide font-semibold flex items-center gap-1 text-ivory/40"><X className="w-3 h-3" /> Negeer</button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : <Empty text="Nog geen patronen ontdekt." />}
      </div>

      {/* Balance summary */}
      {balance.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Balans</p>
          <div className="glass-card-2 rounded-2xl p-4 space-y-1.5">
            {balance.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: insightTypeColor(b.type) }} />
                <p className="text-sm text-ivory/70 truncate flex-1">{b.title}</p>
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
          <ActionBtn label="Capaciteit" icon={BarChart3} onClick={() => navigate("/self/insights?tab=capacity")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/insights")} />
        </div>
      </div>
    </div>
  );
}