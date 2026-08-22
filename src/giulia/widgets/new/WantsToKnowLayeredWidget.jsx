import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ae0d061fb_WantsToknow.jpeg";
const PRIORITY_ACCENT = {
  now: "hsl(var(--d-giulia-urgent))",
  soon: "hsl(var(--d-giulia-light))",
  useful: "hsl(var(--d-giulia-mid))",
  curious: "hsl(var(--d-giulia-deep))",
};

/** WantsToKnowLayeredWidget — "WANTS TO KNOW!" · P·4:5·B·SIDE (gelaagd).
 *  Portrait-foto (de loep) full-bleed als shell; boven de foto: header +
 *  grote live-tellende count van Giulia's open mysteries. Glazen card onder:
 *  de meest recente vraag (kind · domein) + body + antwoord-chips + de
 *  "Laat Giulia zoeken"-knop. De loep blijft als focuspunt bovenaan zichtbaar.
 *  Kleursysteem: GIULIA + Urgent. */

export default function WantsToKnowLayeredWidget() {
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
  const count = questions.length;
  const accent = top ? (PRIORITY_ACCENT[top.priority] || "hsl(var(--d-giulia-mid))") : "hsl(var(--d-giulia-mid))";

  return (
    <div className="w-[300px]">
      <PhotoGlassLayeredWidget
        shape="4:5"
        photo={PHOTO}
        glassPosition="bottom"
        glassFraction={0.56}
        overhang={0.06}
        domain="giulia"
        radius="large"
        glassBlur={8}
        overlay="bg-gradient-to-t from-black/45 via-black/10 to-transparent"
        photoChildren={
          <div className="absolute top-0 inset-x-0 p-4 flex flex-col" style={{ height: "40%" }}>
            <WidgetHeader label="Wants to Know!" type="pulse" />
            <div className="flex-1" />
            <div className="flex items-end gap-2">
              <CountUp value={count} className="text-[48px] font-display font-bold leading-[0.85] tracking-[-0.03em]" />
              <span className="text-[10px] uppercase tracking-[0.24em] mb-2 opacity-70">{count === 1 ? "mysterie" : "mysteries"}</span>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
          </div>
        ) : top ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: accent }}>
              {top.kind.replace(/_/g, " ")} · {top.domain}
            </span>
            <p className="text-[13px] font-medium leading-snug">{top.title}</p>
            {top.body && <p className="text-[11px] opacity-55 leading-relaxed line-clamp-2">{top.body}</p>}
            {top.options && top.options.length ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {top.options.map((o) => (
                  <button key={o} onClick={(e) => answer(top, o, e)} className="chat-bubble px-2.5 py-1.5 text-[11px] opacity-80 hover:opacity-100 hover:bg-white/10 transition">{o}</button>
                ))}
              </div>
            ) : (
              <button onClick={(e) => answer(top, "Vertel het Giulia", e)} className="chat-bubble self-start px-2.5 py-1.5 text-[11px] opacity-80">Beantwoord →</button>
            )}
            <button onClick={search} disabled={busy} className="mt-1 self-start rounded-full px-3 py-2 text-[11px] font-semibold transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
              {busy ? "Zoekt…" : "Laat Giulia zoeken"}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1">
            <Sparkles className="h-5 w-5 opacity-30" />
            <p className="text-[11px] opacity-55">Giulia weet (voorlopig) alles.</p>
          </div>
        )}
      </PhotoGlassLayeredWidget>
    </div>
  );
}