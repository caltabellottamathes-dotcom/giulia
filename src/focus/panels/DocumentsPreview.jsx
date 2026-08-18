import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink } from "@/self/components/SelfViz";
import { FileText, Check } from "lucide-react";

export default function DocumentsPreview({ onOpen }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const data = await base44.entities.Upload.filter({}, "-created_date", 20); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const mark = async (u) => { setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "processed" } : x))); try { await base44.entities.Upload.update(u.id, { status: "processed" }); } catch { load(); } };
  const nieuw = items.filter((i) => i.status === "new");
  const nieuwPct = items.length ? Math.round((nieuw.length / items.length) * 100) : 0;
  const byType = useMemo(() => { const m = {}; items.forEach((i) => { const t = (i.filename || "").split(".").pop()?.toUpperCase() || "OTHER"; m[t] = (m[t] || 0) + 1; }); return Object.entries(m).slice(0, 4); }, [items]);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Documents</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{items.length} bestanden</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{nieuw.length} nieuw · wacht op verwerking</p>
        </div>
        <OpenLink to="/documents" label="Open Documenten" color={FOCUS.light} />
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-6">
        <AnimatedRing pct={nieuwPct} size={120} stroke={8} color={FOCUS.light}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={nieuw.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">NIEUW</span>
        </AnimatedRing>
        <p className="text-ivory/60 text-sm leading-relaxed max-w-sm">{items.length} bestanden totaal. {nieuw.length} wachten op verwerking. {byType.length} verschillende bestandstypes.</p>
      </div>

      {/* Type distribution */}
      {byType.length > 0 && (
        <div className="glass-card-2 rounded-2xl p-5">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Bestandstypes</p>
          <div className="flex flex-wrap gap-2">
            {byType.map(([type, count], i) => (
              <span key={type} className="text-xs px-3 py-1.5 rounded-full border" style={{ background: `${[FOCUS.deep, FOCUS.mid, FOCUS.light, FOCUS.urgent][i % 4]}20`, color: [FOCUS.deep, FOCUS.mid, FOCUS.light, FOCUS.urgent][i % 4], borderColor: `${[FOCUS.deep, FOCUS.mid, FOCUS.light, FOCUS.urgent][i % 4]}40` }}>{type} · {count}</span>
            ))}
          </div>
        </div>
      )}

      <SectionLabel>Recente bestanden</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          {items.slice(0, 6).map((u, i) => (
            <motion.div key={u.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative flex items-center gap-3 rounded-2xl pl-4 pr-3 py-3 glass-card-2 hover:bg-white/10 transition-all duration-300 hover:translate-x-0.5">
              <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: u.status === "new" ? FOCUS.urgent : "rgba(255,255,255,0.3)" }} />
              <button onClick={onOpen} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                <span className="h-8 w-8 rounded-xl glass-button text-ivory flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-ivory/70" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-ivory truncate">{u.filename || "Bestand"}</span>{u.note && <span className="block text-xs text-ivory/50 truncate">{u.note}</span>}</span>
              </button>
              {u.status === "new" && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => mark(u)} className="shrink-0 rounded-full p-2 hover:bg-white/10 transition"><Check className="w-3.5 h-3.5" style={{ color: FOCUS.light }} /></motion.button>}
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Geen bestanden" />}

      <ContextGrid items={[
        { label: "TOTAAL", text: `${items.length} bestanden opgeslagen.` },
        { label: "NIEUW", text: `${nieuw.length} bestanden wachten op verwerking.` },
        { label: "LAATSTE", text: items[0] ? items[0].filename || "Bestand" : "Nog geen bestanden." },
      ]} />
      <ActionRow actions={[
        { label: "Open Documenten", primary: true, color: FOCUS.light, to: "/documents" },
      ]} />
    </div>
  );
}