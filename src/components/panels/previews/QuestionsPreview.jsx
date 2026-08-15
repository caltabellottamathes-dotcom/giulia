import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, Empty, SectionLabel, HeroStat } from "./previewParts";
import { Sparkles, Loader2 } from "lucide-react";

const PRIORITY_ACCENT = {
  now: "hsl(var(--urgent))",
  soon: "hsl(var(--sand))",
  useful: "hsl(var(--olive))",
  curious: "hsl(var(--blue-grey))",
};

/** QuestionsPreview — LEVEL 02 quick-context voor de WANTS TO KNOW-module. */
export default function QuestionsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const list = await base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 12);
      setItems(list || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const search = async () => {
    setBusy(true);
    try { await base44.functions.invoke("generateQuestions", {}); } catch { /* ignore */ }
    setBusy(false); load();
  };
  const answer = async (q, opt) => {
    try { await base44.functions.invoke("answerQuestion", { question_id: q.id, answer: opt }); } catch { /* ignore */ }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
        <HeroStat value={items.length} label="Mysteries" accent="hsl(var(--olive))" sub="ontbrekende context" />
        <button onClick={search} disabled={busy} className="animate-fade-up rounded-2xl glass-card-2 px-4 text-ivory text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50 flex flex-col items-center justify-center gap-1 min-w-[96px]">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Zoek gaten</>}
        </button>
      </div>
      <SectionLabel>Wat Giulia wil weten</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((q) => (
            <Card key={q.id} accent={PRIORITY_ACCENT[q.priority] || "hsl(var(--olive))"} onClick={onOpen}>
              <span className="text-[10px] uppercase tracking-wider text-ivory/55 font-semibold">{q.kind.replace(/_/g, " ")} · {q.domain}</span>
              <span className="block text-sm font-medium text-ivory mt-1.5">{q.title}</span>
              {q.body && <span className="block text-xs text-ivory/50 line-clamp-2 mt-0.5">{q.body}</span>}
              {q.options && q.options.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.options.map((o) => (
                    <button key={o} onClick={(e) => { e.stopPropagation(); answer(q, o); }} className="chat-bubble px-2.5 py-1 text-[11px] text-ivory/80 hover:text-ivory transition">{o}</button>
                  ))}
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); answer(q, "Vertel het Giulia"); }} className="mt-2 chat-bubble px-2.5 py-1 text-[11px] text-ivory/80">Beantwoord →</button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Giulia heeft (voorlopig) geen vragen" />
      )}
    </div>
  );
}