import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, LiveSparkline, CountUp } from "@/glass/components/modules/viz";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";

const PLUM = "#301728", URG = "#d5e24a", LIGHT = "#d8dab3";
const STAGES = ["SUBMITTED", "REVIEW", "DECISION", "DONE"];

export default function ApprovalsPreview({ onOpen }) {
  const { data: items, loading, reload } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date", limit: 10, realtime: true });
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);

  const pending = (items || []).length;
  const decided = approved + rejected;
  const rate = decided ? Math.round((approved / decided) * 100) : 0;

  const decide = async (id, ok) => {
    try { await base44.functions.invoke("executeApproval", { approval_id: id, action: ok ? "approve" : "reject" }); } catch { /* ignore */ }
    if (ok) setApproved(a => a + 1); else setRejected(r => r + 1);
    reload();
  };

  return (
    <PreviewShell index="04" section="APPROVALS" statement={`${pending} PENDING`} kicker="WORKFLOW" accent={URG}
      context={[
        { label: "PENDING", text: `${pending} verzoeken wachten op je beslissing.` },
        { label: "APPROVED", text: `${approved} goedgekeurd deze sessie.` },
        { label: "RATE", text: decided ? `${rate}% goedkeuringsgraad.` : "Nog geen beslissingen genomen." },
      ]}
      actions={[{ label: "Approve All", primary: true, to: "/approvals" }, { label: "Delegate", to: "/approvals" }, { label: "History", to: "/approvals" }, { label: "Open Approvals", to: "/approvals" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center">
            <AnimatedRing pct={rate} size={160} color={URG} label={`${rate}%`} sub="APPROVAL RATE" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 text-center">
              <p className="text-storm text-2xl font-bold tabular-nums"><CountUp to={approved} /></p>
              <p className="text-storm/50 text-[9px] tracking-[0.2em] mt-1">APPROVED</p>
            </div>
            <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 text-center">
              <p className="text-storm text-2xl font-bold tabular-nums"><CountUp to={rejected} /></p>
              <p className="text-storm/50 text-[9px] tracking-[0.2em] mt-1">REJECTED</p>
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">DECISIONS · LIVE</p>
            <LiveSparkline color={PLUM} max={10} intervalMs={2000} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PIPELINE</p>
          <div className="relative h-14 rounded-2xl border border-marble/20 bg-marble/5 overflow-hidden mb-4">
            <div className="absolute inset-0 flex items-center justify-between px-6">
              {STAGES.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-1.5 z-10">
                  <span className={`w-3 h-3 rounded-full ${i === 0 ? "bg-urgent" : i === STAGES.length - 1 ? "bg-plum" : "bg-marble/30"}`} />
                  <span className="text-[9px] tracking-[0.15em] text-storm/60">{s}</span>
                </div>
              ))}
            </div>
            {[0, 1, 2].map(d => (
              <motion.div key={d} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-urgent/70"
                animate={{ left: ["4%", "92%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, delay: d * 1.2, ease: "linear" }} />
            ))}
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PENDING · {pending}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2.5">
            <AnimatePresence>
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : pending === 0 ? (
                <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6 text-center">
                  <p className="text-storm text-base font-semibold">Alles afgehandeld</p>
                  <p className="text-storm/50 text-sm mt-1">Geen openstaande goedkeuringen.</p>
                </div>
              ) : items.map(it => (
                <motion.div key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  className="rounded-2xl border border-marble/25 bg-marble/8 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-storm text-sm font-semibold truncate">{it.title || it.action_type}</p>
                        {it.priority === "high" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-urgent/20 text-urgent">URGENT</span>}
                      </div>
                      <p className="text-[11px] text-storm/50 mt-0.5">{it.assignee || "—"} · {it.type || "—"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => decide(it.id, false)} className="w-8 h-8 rounded-full border border-marble/30 bg-marble/5 text-storm/70 hover:bg-marble/15 hover:text-storm transition-colors flex items-center justify-center"><X className="w-4 h-4" /></button>
                      <button onClick={() => decide(it.id, true)} className="w-8 h-8 rounded-full bg-urgent text-plum hover:brightness-110 active:scale-90 transition-all flex items-center justify-center"><Check className="w-4 h-4" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}