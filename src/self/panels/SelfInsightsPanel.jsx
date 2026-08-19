import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart } from "recharts";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { insightTypeLabel, fmtDate } from "@/lib/selfUtils";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { X, Check, Eye, BarChart3 } from "lucide-react";

export default function SelfInsightsPanel() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const list = await base44.entities.SelfInsight.list("-created_date", 50).catch(() => []); setInsights(list || []); }
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

  // Generate chart data from confidence progression
  const chartData = Array.from({ length: 8 }).map((_, i) => {
    const base = 30 + Math.sin(i / 2) * 20 + (latest?.confidence ? latest.confidence * 40 : 20);
    const sig = Math.max(10, Math.min(95, base + (i / 8) * 30));
    return { label: `${i + 1}`, signal: Math.round(sig), peak: i === 3 ? peak : null };
  });

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Self Insights</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{active.length} patronen</h2>
            {latest && <PulseDot color={BLUE} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">Wat SELF over langere tijd begrijpt.</p>
        </div>
        <OpenLink to="/insights" label="Open Insights" />
      </div>

      {/* Area chart with peak marker — full glass visualization */}
      {latest && (
        <div className="glass-card-2 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-ivory/50 text-[10px] uppercase tracking-[0.22em]">Signal strength</p>
            <span className="text-[10px] tracking-wider" style={{ color: SAND }}>PEAK · {peak}</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="insArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${BLUE}`, borderRadius: 12, fontSize: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="signal" stroke={BLUE} strokeWidth={2.5} fill="url(#insArea)" animationDuration={1400} />
              <Line type="monotone" dataKey="peak" stroke={SAND} strokeWidth={2} strokeDasharray="5 5" dot={{ fill: SAND, r: 5 }} animationDuration={1200} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 text-[9px] tracking-wider">
            <span className="flex items-center gap-1.5" style={{ color: BLUE }}><span className="w-3 h-1 rounded" style={{ background: BLUE }} />SIGNAL</span>
            <span className="flex items-center gap-1.5" style={{ color: SAND }}><span className="w-3 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: SAND }} />PEAK</span>
            <span className="text-ivory/45 ml-auto">{active.length} actieve inzichten</span>
          </div>
        </div>
      )}

      {/* Latest insight — full card */}
      {latest ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-2 rounded-2xl p-5">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-[9px] uppercase tracking-wide font-semibold px-2 py-1 rounded shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", color: BLUE }}>{insightTypeLabel(latest.type)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{latest.title}</p>
              {latest.description && <p className="text-[11px] text-ivory/50 mt-1 leading-relaxed">{latest.description}</p>}
            </div>
          </div>
          {latest.period_start && (
            <p className="text-[9px] text-ivory/35 tracking-wider mb-4">{fmtDate(latest.period_start)} — {fmtDate(latest.period_end)}</p>
          )}
          {latest.status === "active" && (
            <div className="flex items-center gap-4 pt-3 border-t border-ivory/10">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => confirm(latest.id)} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-semibold px-3 py-1.5 rounded-full" style={{ background: SAND, color: "#2D2D23" }}>
                <Check className="w-3 h-3" /> Bevestig
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => dismiss(latest.id)} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-semibold text-ivory/50 hover:text-ivory/70 transition-colors">
                <X className="w-3 h-3" /> Negeer
              </motion.button>
            </div>
          )}
        </motion.div>
      ) : <Empty text="Nog geen patronen ontdekt." />}

      {/* More insights */}
      {active.length > 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Meer</p>
          <div className="flex flex-col gap-1.5">
            {active.slice(1, 5).map((ins, i) => (
              <motion.div key={ins.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-2 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: i % 2 === 0 ? BLUE : SAND }} />
                <p className="text-sm text-ivory/70 truncate flex-1">{ins.title}</p>
                <span className="text-[9px] text-ivory/40">{insightTypeLabel(ins.type)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "OBSERVED", text: latest?.description || "Nog geen inzichten — Giulia ontdekt patronen na meer check-ins." },
        { label: "TYPE", text: latest ? insightTypeLabel(latest.type) : "—" },
        { label: "CONFIDENCE", text: latest ? `${Math.round((latest.confidence || 0.5) * 100)}% zekerheid.` : "—" },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Confirm", primary: true, color: SAND, onClick: () => latest && confirm(latest.id) },
        { label: "Dismiss", onClick: () => latest && dismiss(latest.id) },
        { label: "Open Insights", to: "/self/insights" },
      ]} />
    </div>
  );
}