import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { Check, X, ArrowUpRight } from "lucide-react";

export default function ApprovalsPreview({ onOpen }) {
  const navigate = useNavigate();
  const { data: items, loading, reload } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date", limit: 10, realtime: true });

  const decide = async (a, action) => { try { await base44.functions.invoke("executeApproval", { approval_id: a.id, action }); } catch { /* ignore */ } reload(); };
  const pct = items.length ? 100 : 0;
  const forGiulia = items.filter((a) => a.assignee === "giulia").length;
  const forYou = items.length - forGiulia;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Approvals</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{items.length} wachtend</h2>
            {items.length > 0 && <PulseDot color={GIULIA.urgent} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{forYou} voor jou · {forGiulia} voor Giulia</p>
        </div>
        <OpenLink to="/approvals" label="Open Goedkeuringen" color={GIULIA.light} />
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-6">
        <AnimatedRing pct={pct} size={120} stroke={8} color={GIULIA.light}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={items.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">WACHT</span>
        </AnimatedRing>
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5"><p className="text-ivory/55 text-xs">Voor jou</p><p className="text-ivory text-xl font-display font-semibold"><CountUp value={forYou} /></p></div>
          <div className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5"><p className="text-ivory/55 text-xs">Voor Giulia</p><p className="text-ivory text-xl font-display font-semibold"><CountUp value={forGiulia} /></p></div>
        </div>
      </div>

      {/* Approvals list */}
      <SectionLabel>Wacht op goedkeuring</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {items.map((a) => (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} onClick={onOpen} className="group rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="block text-sm font-medium text-ivory">{a.title || a.action_type}</p>
                    <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${a.assignee === "giulia" ? "" : ""}`} style={{ background: a.assignee === "giulia" ? `${GIULIA.plum}30` : `${GIULIA.mid}30`, color: a.assignee === "giulia" ? "rgba(255,255,255,0.7)" : GIULIA.light }}>{a.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}</span>
                    <p className="block text-xs text-ivory/50 line-clamp-2 mt-1">{a.description}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-ivory/40 shrink-0 mt-0.5" />
                </div>
                <div className="flex gap-2 mt-3">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); decide(a, "approve"); }} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-charcoal transition" style={{ background: GIULIA.light }}><Check className="h-3.5 w-3.5" /> Goed</motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); decide(a, "reject"); }} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full glass-button text-ivory px-3 py-1.5 text-xs font-semibold hover:bg-white/15 transition"><X className="h-3.5 w-3.5" /> Af</motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : <Empty text="Niets wat op jou wacht" />}

      <ContextGrid items={[
        { label: "WACHTEND", text: `${items.length} goedkeuringen wachten op actie.` },
        { label: "VOOR JOU", text: `${forYou} vereisen jouw directe goedkeuring.` },
        { label: "VOOR GIULIA", text: `${forGiulia} kunnen door Giulia worden afgehandeld.` },
      ]} />
      <ActionRow actions={[
        { label: "Open Goedkeuringen", primary: true, color: GIULIA.light, to: "/approvals" },
      ]} />
    </div>
  );
}