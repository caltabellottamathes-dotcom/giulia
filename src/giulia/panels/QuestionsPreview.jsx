import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, BarGrow } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d", LIGHT = "#d8dab3";
const PRIORITY = { now: { c: URG, l: "NOW" }, soon: { c: LIGHT, l: "SOON" }, useful: { c: MID, l: "USEFUL" }, curious: { c: PLUM, l: "CURIOUS" } };

export default function QuestionsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => { try { const list = await base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 12); setItems(list || []); } catch { setItems([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const search = async () => { setBusy(true); try { await base44.functions.invoke("generateQuestions", {}); } catch { /* ignore */ } setBusy(false); load(); };
  const answer = async (q, opt) => { try { await base44.functions.invoke("answerQuestion", { question_id: q.id, answer: opt }); } catch { /* ignore */ } load(); };

  const nowCount = items.filter(q => q.priority === "now").length;
  const counts = { now: 0, soon: 0, useful: 0, curious: 0 };
  items.forEach(q => { if (counts[q.priority] !== undefined) counts[q.priority]++; });

  return (
    <PreviewShell index="19" section="WANTS TO KNOW" statement={`${items.length} MYSTERIES`} kicker="ONTBREKENDE CONTEXT" accent={URG}
      context={[
        { label: "OPEN", text: `${items.length} onbeantwoorde vragen.` },
        { label: "DRINGEND", text: `${nowCount} vragen met hoge prioriteit.` },
        { label: "ACTIE", text: "Beantwoord vragen om Giulia's context te verrijken." },
      ]}
      actions={[{ label: busy ? "Zoekt…" : "Zoek Gaten", primary: true, onClick: search }, { label: "Open Vragen", to: "/wants-to-know" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={items.length ? Math.min(100, items.length * 10) : 0} size={150} color={MID} label={String(items.length)} sub="OPEN" /></div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PRIORITEIT</p>
            {Object.keys(PRIORITY).map((k, i) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-storm/70">{PRIORITY[k].l}</span>
                  <span className="text-storm tabular-nums">{counts[k]}</span>
                </div>
                <BarGrow value={counts[k]} max={Math.max(...Object.values(counts), 1)} color={PRIORITY[k].c} delay={i * 0.12} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">WAT GIULIA WIL WETEN · {items.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence>
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : items.length === 0 ? <p className="text-storm/40 text-sm">Giulia heeft (voorlopig) geen vragen.</p> : items.map(q => (
                <motion.div key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={onOpen} className="rounded-2xl border border-marble/25 bg-marble/8 px-4 py-3.5 cursor-pointer hover:bg-marble/12 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: `${(PRIORITY[q.priority] || PRIORITY.useful).c}22`, color: (PRIORITY[q.priority] || PRIORITY.useful).c }}>{(PRIORITY[q.priority] || PRIORITY.useful).l}</span>
                    <span className="text-[10px] uppercase tracking-wider text-storm/55 font-semibold">{q.kind?.replace(/_/g, " ")} · {q.domain}</span>
                  </div>
                  <p className="block text-sm font-medium text-storm">{q.title}</p>
                  {q.body && <p className="block text-xs text-storm/50 line-clamp-2 mt-0.5">{q.body}</p>}
                  {q.options && q.options.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {q.options.map(o => <button key={o} onClick={(e) => { e.stopPropagation(); answer(q, o); }} className="px-2.5 py-1 rounded-full border border-marble/20 bg-marble/5 text-[11px] text-storm/80 hover:bg-marble/15 transition">{o}</button>)}
                    </div>
                  ) : <button onClick={(e) => { e.stopPropagation(); answer(q, "Vertel het Giulia"); }} className="mt-2 px-2.5 py-1 rounded-full border border-marble/20 bg-marble/5 text-[11px] text-storm/80 hover:bg-marble/15 transition">Beantwoord →</button>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}