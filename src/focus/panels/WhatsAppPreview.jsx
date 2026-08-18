import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { Check, X, MessageCircle } from "lucide-react";

export default function WhatsAppPreview({ onOpen }) {
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [m, d] = await Promise.all([
        base44.entities.WhatsAppMessage.filter({ status: "unread" }, "-timestamp", 10),
        base44.entities.Approval.filter({ type: "whatsapp", status: "pending" }, "-created_date", 10),
      ]);
      setMsgs(m || []); setDrafts(d || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const decide = async (d, status) => { setDrafts((prev) => prev.filter((x) => x.id !== d.id)); try { await base44.entities.Approval.update(d.id, { status: status === "approved" ? "executed" : "discarded" }); } catch { load(); } };
  const draftPct = drafts.length ? 100 : 0;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>WhatsApp</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{drafts.length} concepten</h2>
            {drafts.length > 0 && <PulseDot color={FOCUS.light} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{msgs.length} ongelezen berichten</p>
        </div>
        <OpenLink to="/whatsapp" label="Open WhatsApp" color={FOCUS.light} />
      </div>

      {/* Drafts ring + unread count */}
      <div className="flex items-center gap-6">
        <AnimatedRing pct={draftPct} size={120} stroke={8} color={FOCUS.light}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={drafts.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">CONCEPTEN</span>
        </AnimatedRing>
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3">
            <p className="text-ivory/55 text-xs">Ongelezen</p>
            <p className="text-ivory text-2xl font-display font-semibold"><CountUp value={msgs.length} /></p>
          </div>
          <p className="text-ivory/60 text-sm leading-relaxed max-w-xs">{drafts.length} Giulia-concepten wachten op jouw goedkeuring.</p>
        </div>
      </div>

      {/* Giulia drafts */}
      {drafts.length > 0 && (
        <>
          <SectionLabel>Giulia-concepten ter goedkeuring</SectionLabel>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {drafts.map((d, i) => (
                <motion.div key={d.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: FOCUS.light }} />
                    <p className="text-sm text-ivory flex-1">{d.content}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => decide(d, "approved")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition" style={{ background: FOCUS.light, color: "#2D2D23" }}><Check className="w-3.5 h-3.5" /> Goedkeuren</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => decide(d, "rejected")} className="inline-flex items-center gap-1.5 rounded-full glass-button text-ivory px-3 py-1.5 text-xs font-semibold hover:bg-white/15 transition"><X className="w-3.5 h-3.5" /> Afkeuren</motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Unread messages */}
      <SectionLabel>Ongelezen berichten</SectionLabel>
      {loading ? <Empty text="Laden…" /> : msgs.length ? (
        <div className="flex flex-col gap-2">
          {msgs.map((m, i) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={onOpen} className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: FOCUS.urgent }} />
              <p className="text-sm text-ivory flex-1 truncate">{m.message}</p>
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Alles gelezen" />}

      <ContextGrid items={[
        { label: "CONCEPTEN", text: `${drafts.length} Giulia-concepten wachten op goedkeuring.` },
        { label: "ONGELEZEN", text: `${msgs.length} ongelezen berichten.` },
        { label: "ACTIE", text: drafts.length > 0 ? "Keur de concepten goed of af om te reageren." : "Geen actie nodig." },
      ]} />
      <ActionRow actions={[
        { label: "Open WhatsApp", primary: true, color: FOCUS.light, to: "/whatsapp" },
      ]} />
    </div>
  );
}