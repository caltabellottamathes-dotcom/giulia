import React, { useEffect, useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { Sparkles } from "lucide-react";

const PRIORITY_ACCENT = {
  now: "hsl(var(--urgent))",
  soon: "hsl(var(--sand))",
  useful: "hsl(var(--olive))",
  curious: "hsl(var(--blue-grey))",
};

/** GiuliaQuestionsWidget — Giulia's nieuwsgierigheidslaag op het dashboard. */
export default function GiuliaQuestionsWidget() {
  const { openModule } = usePanel();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const list = await base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 30);
      setQuestions(list || []);
    } catch { setQuestions([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const search = async (e) => {
    e.stopPropagation(); setBusy(true);
    try { await base44.functions.invoke("generateQuestions", {}); } catch { /* ignore */ }
    setBusy(false); load();
  };
  const answer = async (q, opt, e) => {
    e.stopPropagation();
    try { await base44.functions.invoke("answerQuestion", { question_id: q.id, answer: opt }); } catch { /* ignore */ }
    load();
  };

  const top = questions[0];

  return (
    <WidgetShell size="2x2" radius="medium" interactive onClick={() => openModule("wantstoknow")} className="min-h-[260px]">
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-8 rounded-b-[24px] glass-3 p-5 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          <WidgetHeader label="Giulia · Wants to know" count={questions.length ? `${questions.length}` : ""} />
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : top ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-end gap-3">
                <span className="text-6xl font-display font-semibold tracking-[-0.04em] leading-none text-ivory">{questions.length}</span>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-2">{questions.length === 1 ? "mysterie" : "mysteries"}</p>
              </div>
              <div className="mt-4 rounded-2xl bg-ivory/5 border border-ivory/10 p-3.5">
                <span className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: PRIORITY_ACCENT[top.priority] || "hsl(var(--olive))" }}>
                  {top.kind.replace(/_/g, " ")} · {top.domain}
                </span>
                <p className="text-sm font-medium text-ivory mt-1.5 leading-snug">{top.title}</p>
                {top.body && <p className="text-xs text-ivory/55 mt-1.5 line-clamp-3 leading-relaxed">{top.body}</p>}
              </div>
              {top.options && top.options.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {top.options.map((o) => (
                    <button key={o} onClick={(e) => answer(top, o, e)} className="chat-bubble px-3 py-1.5 text-[11px] text-ivory/80 hover:text-ivory hover:bg-ivory/10 transition">{o}</button>
                  ))}
                </div>
              ) : (
                <button onClick={(e) => answer(top, "Vertel het Giulia", e)} className="mt-3 chat-bubble px-3 py-2 text-[11px] text-ivory/80">Beantwoord →</button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Sparkles className="h-7 w-7 text-ivory/30 mb-2" />
              <p className="text-sm text-ivory/55">Giulia weet (voorlopig) alles.</p>
            </div>
          )}
          <button onClick={search} disabled={busy} className="mt-4 rounded-full px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
            {busy ? "Zoekt naar gaten…" : "Laat Giulia zoeken"}
          </button>
        </div>
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.portraitThinking} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" />
        </div>
      </div>
    </WidgetShell>
  );
}