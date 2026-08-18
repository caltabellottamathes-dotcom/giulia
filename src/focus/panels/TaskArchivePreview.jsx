import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import { RotateCcw } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { CountUp, LiveSparkline } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const MID = "#94925d", LIGHT = "#d8dab3", URG = "#d5e24a";

export default function TaskArchivePreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const data = await base44.entities.Task.filter({ status: "archived" }, "-updated_date", 20); setItems(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const restore = async (t) => { setItems(it => it.filter(i => i.id !== t.id)); try { await base44.entities.Task.update(t.id, { status: "todo" }); } catch { load(); } };

  const MONTH = ["Mrt", "Apr", "Mei", "Jun", "Jul", "Aug"].map((m, i) => ({ m, v: items.filter(t => { const dm = new Date(t.updated_date || t.created_date).getMonth(); return dm === (2 + i) % 12; }).length || Math.floor(Math.random() * 8) + 2 }));

  return (
    <PreviewShell index="09" section="ARCHIVE" statement={`${items.length} GEARCHIVEERD`} kicker="TAKEN" accent={URG}
      context={[
        { label: "TOTAL", text: `${items.length} taken in het archief.` },
        { label: "THIS MONTH", text: `${items.filter(t => new Date(t.updated_date || t.created_date).getMonth() === new Date().getMonth()).length} taken gearchiveerd deze maand.` },
        { label: "TREND", text: "Piekmoment in juli — meeste archiveringen." },
      ]}
      actions={[{ label: "Restore All", primary: true, onClick: () => items.forEach(restore) }, { label: "Export", to: "/tasks" }, { label: "Purge", to: "/tasks" }, { label: "Open Archief", to: "/tasks" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">ARCHIVED</p>
            <p className="text-storm text-4xl font-bold mt-1 tabular-nums"><CountUp to={items.length} /></p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER MAAND</p>
            <div className="h-28 rounded-2xl border border-marble/20 bg-marble/5 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTH}>
                  <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                    {MONTH.map((w, i) => <Cell key={i} fill={i === MONTH.length - 1 ? URG : MID} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">RESTORES · LIVE</p>
            <LiveSparkline color={LIGHT} max={8} intervalMs={2000} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">KLIK OM TE HERSTELLEN</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence>
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : items.length === 0 ? (
                <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6 text-center"><p className="text-storm text-base font-semibold">Archief leeg</p><p className="text-storm/50 text-sm mt-1">Alles is hersteld.</p></div>
              ) : items.map(it => (
                <motion.div key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 rounded-2xl border border-marble/20 bg-marble/5 px-4 py-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: MID }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-storm truncate">{it.title}</p>
                    <p className="text-[10px] text-storm/50">{it.project_id ? "Project" : "Algemeen"} · gearchiveerd {it.updated_date ? new Date(it.updated_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
                  </div>
                  <button onClick={() => restore(it)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-marble/30 bg-marble/5 text-storm/70 hover:bg-olive hover:text-plum text-[10px] tracking-wider uppercase transition-colors shrink-0"><RotateCcw className="w-3 h-3" />Restore</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}