import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { IMAGES } from "@/lib/images";
import { Empty, Card, Stat } from "@/system/panels/previewParts";
import { insightTypeColor, insightTypeLabel, fmtDate } from "@/lib/selfUtils";
import { Telescope, ArrowUpRight, Eye, X, Check, BarChart3 } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const TABS = [
  { key: "self_insights", label: "Self Insights" },
  { key: "patterns", label: "Patterns" },
  { key: "balance", label: "Balance" },
  { key: "capacity_patterns", label: "Capacity Patterns" },
];

export default function SelfInsightsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "self_insights");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const list = await base44.entities.SelfInsight.list("-created_date", 50).catch(() => []); setInsights(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (insights || []).filter((i) => i.status === "active" || i.status === "confirmed"), [insights]);
  const patterns = useMemo(() => active.filter((i) => i.type === "pattern" || i.type === "behavior"), [active]);
  const balance = useMemo(() => active.filter((i) => i.type === "balance" || i.type === "imbalance"), [active]);
  const capacity = useMemo(() => active.filter((i) => i.type === "capacity" || i.type === "overload" || i.type === "under_recovery"), [active]);

  const dismiss = async (id) => { try { await base44.entities.SelfInsight.update(id, { status: "dismissed" }); await load(); } catch { /* ignore */ } };
  const confirm = async (id) => { try { await base44.entities.SelfInsight.update(id, { status: "confirmed" }); await load(); } catch { /* ignore */ } };
  const setTab2 = (t) => { setTab(t); navigate(`/self/insights?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="self-insights" image={IMAGES.selfInsights} icon={Telescope} eyebrow="SELF" title="Self Insights" subtitle="Patronen, balans en inzichten over langere tijd" />

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab2(t.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition" style={tab === t.key ? { background: SAGE, color: "hsl(var(--self-primary))" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : (
        <>
          {tab === "self_insights" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Actief" value={active.length} accent={SAGE} />
                <Stat label="Patronen" value={patterns.length} accent="hsl(var(--self-accent-deep))" />
                <Stat label="Bevestigd" value={active.filter((i) => i.status === "confirmed").length} accent={SAGE} />
              </div>
              <div className="space-y-2">
                {active.length ? active.map((ins) => (
                  <Card key={ins.id} accent={insightTypeColor(ins.type)}>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", color: insightTypeColor(ins.type) }}>{insightTypeLabel(ins.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{ins.title}</p>
                        {ins.description && <p className="text-[11px] text-muted-foreground mt-0.5">{ins.description}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">{ins.category || "—"} · {fmtDate(ins.period_start)} — {fmtDate(ins.period_end)}</p>
                      </div>
                    </div>
                    {ins.status === "active" && (
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); confirm(ins.id); }} className="text-[10px] uppercase tracking-wide font-semibold flex items-center gap-1" style={{ color: SAGE }}><Check className="w-3 h-3" /> Bevestig</button>
                        <button onClick={(e) => { e.stopPropagation(); dismiss(ins.id); }} className="text-[10px] uppercase tracking-wide font-semibold flex items-center gap-1 text-muted-foreground"><X className="w-3 h-3" /> Negeer</button>
                      </div>
                    )}
                  </Card>
                )) : <Empty text="Nog geen inzichten — Giulia ontdekt patronen na meer check-ins en routines." />}
              </div>
            </div>
          )}

          {tab === "patterns" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Terugkerende patronen die SELF heeft ontdekt.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {patterns.length ? patterns.map((p) => (
                  <GlassPanel key={p.id} level={2} className="p-5">
                    <Eye className="w-5 h-5 mb-2" style={{ color: insightTypeColor(p.type) }} />
                    <h3 className="text-lg font-display font-semibold">{p.title}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">{p.category || "—"}</p>
                  </GlassPanel>
                )) : <Empty text="Nog geen patronen ontdekt." />}
              </div>
            </div>
          )}

          {tab === "balance" && (
            <div className="space-y-6">
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Balans FOCUS · LIFE · SELF</p>
                <p className="text-sm text-muted-foreground">Balans-inzichten worden hier zichtbaar naarmate er meer data verzameld is.</p>
              </GlassPanel>
              <div className="space-y-2">
                {balance.length ? balance.map((b) => (
                  <Card key={b.id} accent={insightTypeColor(b.type)}>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: insightTypeColor(b.type) }} />
                      <div className="flex-1"><p className="text-sm font-semibold">{b.title}</p>{b.description && <p className="text-[11px] text-muted-foreground">{b.description}</p>}</div>
                    </div>
                  </Card>
                )) : <Empty text="Nog geen balans-inzichten." />}
              </div>
            </div>
          )}

          {tab === "capacity_patterns" && (
            <div className="space-y-6">
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Capaciteit patronen</p>
                <p className="text-sm text-muted-foreground">Langetermijnpatronen rondom capaciteit worden hier zichtbaar.</p>
              </GlassPanel>
              <div className="space-y-2">
                {capacity.length ? capacity.map((c) => (
                  <Card key={c.id} accent={insightTypeColor(c.type)}>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", color: insightTypeColor(c.type) }}>{insightTypeLabel(c.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{c.title}</p>
                        {c.description && <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>}
                      </div>
                    </div>
                  </Card>
                )) : <Empty text="Nog geen capaciteit-patronen." />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}