import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHero from "@/system/components/glass/PageHero";
import { IMAGES } from "@/lib/images";
import { HelpCircle, Sparkles, Loader2, Check } from "lucide-react";

const PRIORITY = {
  now: { label: "Nu", accent: "hsl(var(--urgent))" },
  soon: { label: "Binnenkort", accent: "hsl(var(--sand))" },
  useful: { label: "Nuttig", accent: "hsl(var(--olive))" },
  curious: { label: "Nieuwsgierig", accent: "hsl(var(--blue-grey))" },
};

/** WantsToKnow — Giulia's nieuwsgierigheidslaag. Eén vraag tegelijk,
 *  beantwoord of overgeslagen, Giulia leert van elk antwoord. */
export default function WantsToKnow() {
  const [open, setOpen] = useState([]);
  const [answered, setAnswered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [answering, setAnswering] = useState(null);
  const [custom, setCustom] = useState("");
  const { toast } = useToast();

  const load = async () => {
    try {
      const [o, a] = await Promise.all([
        base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 50).catch(() => []),
        base44.entities.GiuliaQuestion.filter({ status: "answered" }, "-updated_date", 12).catch(() => []),
      ]);
      setOpen(o || []); setAnswered(a || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const search = async () => {
    setBusy(true);
    try {
      const r = await base44.functions.invoke("generateQuestions", {});
      toast({ title: r?.created ? `${r.created} nieuwe vragen` : "Geen nieuwe gaten" });
    } catch { toast({ title: "Zoeken mislukt", variant: "destructive" }); }
    setBusy(false); load();
  };

  const answer = async (q, text) => {
    if (!text) return;
    setAnswering(q.id);
    try {
      const r = await base44.functions.invoke("answerQuestion", { question_id: q.id, answer: text });
      toast({ title: "Genoteerd", description: r?.response ? String(r.response).slice(0, 80) : undefined });
    } catch { toast({ title: "Opslaan mislukt", variant: "destructive" }); }
    setAnswering(null); setCustom(""); load();
  };

  const skip = async (q) => {
    setAnswering(q.id);
    try { await base44.entities.GiuliaQuestion.update(q.id, { status: "skipped" }); } catch { /* ignore */ }
    setAnswering(null); load();
  };

  const current = open[0];
  const rest = open.slice(1);

  return (
    <div className="animate-fade-up">
      <PageHero page="wantstoknow" image={IMAGES.portraitThinking} icon={HelpCircle} eyebrow="GIULIA WANTS TO KNOW" title="Giulia wil weten" subtitle="Giulia's nieuwsgierigheidslaag — continu op zoek naar ontbrekende context" />

      <div className="max-w-3xl mx-auto px-1">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">{open.length} {open.length === 1 ? "mysterie" : "mysteries"} open</p>
            <p className="text-sm text-foreground/45 mt-1">Eén vraag tegelijk. Beantwoord of sla over — Giulia leert.</p>
          </div>
          <button onClick={search} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-olive text-ivory px-4 py-2.5 text-xs font-semibold hover:bg-olive/90 transition disabled:opacity-50 shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Laat Giulia zoeken
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>
        ) : current ? (
          <div className="space-y-6">
            <div className="rounded-[28px] glass-2 p-7 relative overflow-hidden">
              <span className="absolute left-0 top-6 bottom-6 w-1 rounded-r" style={{ background: PRIORITY[current.priority]?.accent || "hsl(var(--olive))" }} />
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold" style={{ color: PRIORITY[current.priority]?.accent }}>{PRIORITY[current.priority]?.label}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">{current.kind.replace(/_/g, " ")} · {current.domain}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-display font-semibold tracking-tight text-foreground leading-tight text-balance">{current.title}</h2>
              {current.body && <p className="text-[15px] text-foreground/65 mt-3 leading-relaxed">{current.body}</p>}
              {current.options && current.options.length ? (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {current.options.map((o) => (
                    <button key={o} onClick={() => answer(current, o)} disabled={answering === current.id} className="rounded-full bg-foreground/[0.06] border border-foreground/12 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/10 transition disabled:opacity-50">
                      {o}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Of typ je eigen antwoord…" onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) answer(current, custom.trim()); }} className="flex-1 rounded-full bg-foreground/[0.05] border border-foreground/10 px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
                <button onClick={() => answer(current, custom.trim())} disabled={answering === current.id || !custom.trim()} className="rounded-full bg-charcoal text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-charcoal/90 transition disabled:opacity-40">Stuur</button>
              </div>
              <button onClick={() => skip(current)} disabled={answering === current.id} className="mt-4 text-xs text-foreground/40 hover:text-foreground/70 transition">Overslaan</button>
            </div>

            {rest.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/45 font-semibold mb-3">Nog {rest.length} in de wachtrij</p>
                <div className="space-y-2">
                  {rest.slice(0, 8).map((q) => (
                    <div key={q.id} className="flex items-center gap-3 rounded-2xl bg-foreground/[0.04] px-4 py-3">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PRIORITY[q.priority]?.accent }} />
                      <span className="text-sm text-foreground/75 truncate flex-1">{q.title}</span>
                      <span className="text-[10px] uppercase tracking-wider text-foreground/35">{q.domain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] glass-2 p-12 flex flex-col items-center text-center">
            <Check className="h-8 w-8 text-olive/60 mb-3" />
            <p className="text-lg font-display font-semibold">Giulia heeft (voorlopig) geen vragen</p>
            <p className="text-sm text-foreground/50 mt-1 max-w-sm">Ze kent je wereld goed genoeg — of er is nog niet genoeg data om gaten te zien. Laat haar zoeken om nieuwe mysteries te vinden.</p>
            <button onClick={search} disabled={busy} className="mt-5 inline-flex items-center gap-2 rounded-full bg-olive text-ivory px-4 py-2.5 text-xs font-semibold hover:bg-olive/90 transition disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Laat Giulia zoeken
            </button>
          </div>
        )}

        {answered.length > 0 && (
          <div className="mt-10">
            <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/45 font-semibold mb-3">Onlangs beantwoord</p>
            <div className="space-y-2">
              {answered.map((q) => (
                <div key={q.id} className="rounded-2xl bg-foreground/[0.03] px-4 py-3">
                  <p className="text-sm text-foreground/70">{q.title}</p>
                  {q.answer && <p className="text-xs text-foreground/45 mt-1">→ {q.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}