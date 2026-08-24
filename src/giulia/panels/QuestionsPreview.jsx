import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HelpCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d", LIGHT = "#d8dab3", DEEP = "#595f34";
const PRIORITY = { now: { c: URG, l: "NOW" }, soon: { c: LIGHT, l: "SOON" }, useful: { c: MID, l: "USEFUL" }, curious: { c: PLUM, l: "CURIOUS" } };

function GraphicRule({ accent, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="h-px bg-marble/20" />
      <div className="absolute left-0 top-0 h-px w-16" style={{ background: accent }} />
    </div>
  );
}

/**
 * QuestionsPreview — reference implementation of the general ModulePanel
 * structure: fixed Header (tabs + Question button) / scrollable Body (per
 * tab) / fixed transparent Footer (context row + buttons). Tabs navigate
 * within the panel — never to pages.
 */
export default function QuestionsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    try {
      const list = await base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 12);
      setItems(list || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!activeId && items.length) setActiveId(items[0].id); }, [items, activeId]);

  const search = async () => {
    setBusy(true);
    try { await base44.functions.invoke("generateQuestions", {}); } catch { /* ignore */ }
    setBusy(false);
    load();
  };
  const answer = async (q, opt) => {
    try { await base44.functions.invoke("answerQuestion", { question_id: q.id, answer: opt }); } catch { /* ignore */ }
    load();
  };

  const active = items.find(q => q.id === activeId);
  const nowCount = items.filter(q => q.priority === "now").length;

  const context = [
    { label: "OPEN", text: `${items.length} onbeantwoorde vragen.` },
    { label: "DRINGEND", text: `${nowCount} vragen met hoge prioriteit.` },
    { label: "ACTIE", text: "Beantwoord vragen om Giulia's context te verrijken." },
  ];

  return (
    <div className="flex flex-col h-full text-storm">
      {/* ── HEADER ZONE ── tabs (navigate within panel) + Question button */}
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-storm/50 text-[10px] tracking-[0.25em]">WAT GIULIA WIL WETEN · {loading ? "–" : items.length}</p>
          <button
            onClick={search}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-metal transition disabled:opacity-50 hover:brightness-95 active:scale-95"
            style={{ background: DEEP }}
          >
            <Sparkles className="h-3 w-3" />
            {busy ? "Zoekt…" : "Vraag"}
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {loading && <span className="text-storm/40 text-xs py-1.5">Laden…</span>}
          {!loading && items.length === 0 && <span className="text-storm/40 text-xs py-1.5">Geen open vragen</span>}
          <AnimatePresence initial={false}>
            {items.map((q) => {
              const on = q.id === activeId;
              const p = PRIORITY[q.priority] || PRIORITY.useful;
              return (
                <motion.button
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveId(q.id)}
                  className={`shrink-0 max-w-[220px] truncate rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    on ? "text-metal" : "text-storm/70 border border-marble/25 bg-marble/5 hover:bg-marble/12"
                  }`}
                  style={on ? { background: p.c } : undefined}
                  title={q.title}
                >
                  {q.title}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── BODY ZONE ── selected question detail, scrolls */}
      <div className="flex-1 min-h-0 overflow-auto pt-5">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${(PRIORITY[active.priority] || PRIORITY.useful).c}22`, color: (PRIORITY[active.priority] || PRIORITY.useful).c }}
                >
                  {(PRIORITY[active.priority] || PRIORITY.useful).l}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-storm/55 font-semibold">
                  {active.kind?.replace(/_/g, " ")} · {active.domain}
                </span>
              </div>
              <p className="text-storm text-lg font-medium leading-snug mb-1.5">{active.title}</p>
              {active.body && <p className="text-storm/60 text-sm leading-relaxed mb-4">{active.body}</p>}
              {active.options && active.options.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {active.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => answer(active, o)}
                      className="px-3 py-1.5 rounded-full border border-marble/20 bg-marble/5 text-[11px] text-storm/80 hover:bg-marble/15 transition"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => answer(active, "Vertel het Giulia")}
                  className="px-3 py-1.5 rounded-full border border-marble/20 bg-marble/5 text-[11px] text-storm/80 hover:bg-marble/15 transition"
                >
                  Beantwoord →
                </button>
              )}
            </motion.div>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <HelpCircle className="h-6 w-6 text-storm/30" />
                <p className="text-storm/40 text-sm">Giulia heeft (voorlopig) geen vragen.</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER ZONE ── context row + buttons, transparent, pinned */}
      <div className="shrink-0 pt-5">
        <GraphicRule accent={URG} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          {context.map((c, i) => (
            <div key={i}>
              <div className="flex items-center gap-2.5">
                <span className="text-storm/30 text-[10px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-storm/80 text-[10px] uppercase tracking-[0.2em] font-semibold">{c.label}</p>
              </div>
              <p className="text-storm/70 text-xs mt-1.5 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <GraphicRule accent={URG} className="mt-4" />
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={search}
            disabled={busy}
            className="px-4 py-2 rounded-full text-metal text-[10px] font-semibold tracking-[0.15em] uppercase hover:brightness-95 active:scale-95 transition-all disabled:opacity-50"
            style={{ background: URG, color: PLUM }}
          >
            {busy ? "Zoekt…" : "Zoek Gaten"}
          </button>
          <button
            onClick={onOpen}
            className="px-4 py-2 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-[10px] tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors"
          >
            Open Vragen
          </button>
        </div>
      </div>
    </div>
  );
}