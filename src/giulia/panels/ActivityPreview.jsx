import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";

const SRC_COLOR = { giulia: GIULIA.mid, email: GIULIA.light, whatsapp: GIULIA.urgent, tasks: GIULIA.plum };

export default function ActivityPreview({ onOpen }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const data = await base44.entities.Activity.filter({}, "-timestamp", 12); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  const sources = useMemo(() => { const m = {}; items.forEach((i) => { const s = i.source || "other"; m[s] = (m[s] || 0) + 1; }); return Object.entries(m).map(([n, v]) => ({ label: n.slice(0, 4).toUpperCase(), value: v, c: SRC_COLOR[n] || "rgba(255,255,255,0.4)" })); }, [items]);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Activity</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{items.length} recent</h2>
            {items.length > 0 && <PulseDot color={GIULIA.mid} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{sources.length} bronnen actief</p>
        </div>
        <OpenLink to="/activity" label="Open Activiteit" color={GIULIA.light} />
      </div>

      {/* Ring + source chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <AnimatedRing pct={items.length ? 100 : 0} size={120} stroke={8} color={GIULIA.mid}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={items.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">EVENTS</span>
        </AnimatedRing>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Bronnen · verdeling</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={sources} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${GIULIA.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {sources.map((d, i) => <Cell key={i} fill={d.c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity feed */}
      <SectionLabel>Laatste gebeurtenissen</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {items.map((a, i) => (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }} onClick={onOpen} className="group rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SRC_COLOR[a.source] || "rgba(255,255,255,0.4)" }} />
                  <span className="block text-sm text-ivory/80 line-clamp-2 flex-1">{a.description}</span>
                </div>
                <span className="block text-[11px] text-ivory/40 mt-1 ml-4">{a.source ? a.source + " · " : ""}{a.timestamp ? format(new Date(a.timestamp), "d MMM HH:mm") : ""}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : <Empty text="Geen recente activiteit" />}

      <ContextGrid items={[
        { label: "RECENT", text: `${items.length} gebeurtenissen in de activiteitenfeed.` },
        { label: "BRONNEN", text: `${sources.length} verschillende bronnen actief.` },
        { label: "LAATSTE", text: items[0] ? items[0].description?.slice(0, 60) + "…" : "Geen activiteit." },
      ]} />
      <ActionRow actions={[
        { label: "Open Activiteit", primary: true, color: GIULIA.light, to: "/activity" },
      ]} />
    </div>
  );
}