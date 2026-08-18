import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { Sparkles, Loader2 } from "lucide-react";

const PRIORITY = { now: { c: GIULIA.urgent, l: "NOW" }, soon: { c: GIULIA.light, l: "SOON" }, useful: { c: GIULIA.mid, l: "USEFUL" }, curious: { c: GIULIA.plum, l: "CURIOUS" } };

export default function QuestionsPreview({ onOpen }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => { try { const list = await base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 12); setItems(list || []); } catch { setItems([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const search = async () => { setBusy(true); try { await base44.functions.invoke("generateQuestions", {}); } catch { /* ignore */ } setBusy(false); load(); };
  const answer = async (q, opt) => { try { await base44.functions.invoke("answerQuestion", { question_id: q.id, answer: opt }); } catch { /* ignore */ } load(); };

  const nowCount = items.filter((q) => q.priority === "now").length;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Wants to Know</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{items.length} mysteries</h2>
            {nowCount > 0 && <PulseDot color={GIULIA.urgent} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{nowCount} dringend · ontbrekende context</p>
        </div>
        <OpenLink to="/wants-to-know" label="Open Vragen" color={GIULIA.light} />
      </div>

      {/* Ring + generate */}
      <div className="flex items-center gap-6">
        <AnimatedRing pct={items.length ? Math.min(100, items.length * 10) : 0} size={120} stroke={8} color={GIULIA.mid}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={items.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">OPEN</span>
        </AnimatedRing>
        <div>
          <p className="text-ivory/60 text-sm leading-relaxed max-w-sm mb-3">Giulia zoekt naar gaten in haar kennis over jou. Beantwoord vragen om haar context te verrijken.</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={search} disabled={busy} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-50 transition" style={{ background: GIULIA.light }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {busy ? "Zoekt…" : "Zoek gaten"}
          </motion.button>
        </div>
      </div>

      {/* Questions list */}
      <SectionLabel>Wat Giulia wil weten</SectionLabel>
      {loading ? <Empty text="Laden…" /> : items.length ? (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {items.map((q) => (
              <motion.div key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={onOpen} className="group rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: `${PRIORITY[q.priority]?.c || GIULIA.mid}22`, color: PRIORITY[q.priority]?.c || GIULIA.mid }}>{PRIORITY[q.priority]?.l || "USEFUL"}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ivory/55 font-semibold">{q.kind?.replace(/_/g, " ")} · {q.domain}</span>
                </div>
                <p className="block text-sm font-medium text-ivory">{q.title}</p>
                {q.body && <p className="block text-xs text-ivory/50 line-clamp-2 mt-0.5">{q.body}</p>}
                {q.options && q.options.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {q.options.map((o) => (
                      <button key={o} onClick={(e) => { e.stopPropagation(); answer(q, o); }} className="chat-bubble px-2.5 py-1 text-[11px] text-ivory/80 hover:text-ivory transition">{o}</button>
                    ))}
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); answer(q, "Vertel het Giulia"); }} className="mt-2 chat-bubble px-2.5 py-1 text-[11px] text-ivory/80">Beantwoord →</button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : <Empty text="Giulia heeft (voorlopig) geen vragen" />}

      <ContextGrid items={[
        { label: "OPEN", text: `${items.length} onbeantwoorde vragen.` },
        { label: "DRINGEND", text: `${nowCount} vragen met hoge prioriteit.` },
        { label: "DOMEIN", text: items[0] ? items[0].domain || "—" : "—" },
      ]} />
      <ActionRow actions={[
        { label: "Zoek Gaten", primary: true, color: GIULIA.light, onClick: search },
        { label: "Open Vragen", to: "/wants-to-know" },
      ]} />
    </div>
  );
}