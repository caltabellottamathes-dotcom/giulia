import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import { Telescope, Sparkles, Check, Archive, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/components/glass/PageHero";

const CATS = ["Opportunity", "Risk", "Research", "Suggestion", "Follow-up", "Trend"];
const CAT_STYLE = {
  Opportunity: "bg-olive text-ivory",
  Risk: "bg-charcoal text-ivory",
  Research: "bg-blue-grey text-charcoal",
  Suggestion: "bg-sand text-ivory",
  "Follow-up": "bg-stone text-charcoal",
  Trend: "bg-olive text-ivory",
};

/**
 * Insights — Giulia's proactive research room. Ask Giulia to research a topic
 * (web-enabled), review generated insights, mark them actioned or archived.
 */
export default function Insights() {
  const { data: insights, loading, reload } = useEntityList("Insight", { sort: "-created_date" });
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const filtered = filter === "all" ? insights : insights.filter((i) => i.category === filter);

  const research = async () => {
    setBusy(true);
    try {
      const prompt = topic
        ? `Je bent Giulia. Onderzoek het onderwerp "${topic}" met actuele context. Geef 3 actionable inzichten of suggesties (opportuniteit, risico, opvolging). Schrijf in het Nederlands.`
        : `Je bent Giulia, proactieve AI-assistent voor een drukke professional. Geef 3 proactieve inzichten of suggesties voor vandaag. Schrijf in het Nederlands.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  category: { type: "string" },
                  confidence: { type: "number" },
                },
              },
            },
          },
        },
      });
      const arr = res.insights || [];
      if (arr.length) {
        await base44.entities.Insight.bulkCreate(
          arr.map((x) => ({
            title: x.title || "Inzicht",
            content: x.content || "",
            category: CATS.includes(x.category) ? x.category : "Suggestion",
            confidence: typeof x.confidence === "number" ? x.confidence : 0.6,
            source: "Giulia · web onderzoek",
            topic: topic || "",
            status: "new",
          }))
        );
        toast({ title: `${arr.length} inzichten toegevoegd` });
        setTopic("");
        reload();
      } else {
        toast({ title: "Geen inzichten gevonden" });
      }
    } catch {
      toast({ title: "Onderzoek mislukt", variant: "destructive" });
    }
    setBusy(false);
  };

  const setStatus = async (ins, status) => {
    await base44.entities.Insight.update(ins.id, { status });
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHero
        page="insights"
        icon={Telescope}
        eyebrow="Giulia"
        title="Inzichten"
        subtitle="Proactief onderzoek & signalen"
      />

      {/* Research composer */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="h-9 w-9 rounded-xl bg-sand text-ivory flex items-center justify-center shrink-0">
            <Telescope className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">Giulia · onderzoek</p>
            <p className="text-sm font-semibold text-foreground">Laat Giulia proactief onderzoek doen</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Onderwerp — een project, markt, contact…"
            className="flex-1 min-w-0 bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-olive/40"
          />
          <button
            onClick={research}
            disabled={busy}
            className="rounded-xl bg-olive text-ivory px-4 py-2.5 text-sm font-semibold hover:bg-olive/90 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Onderzoek
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1 text-xs font-semibold rounded-full border transition",
            filter === "all" ? "bg-charcoal text-ivory border-charcoal" : "bg-foreground/5 text-foreground/60 border-foreground/10 hover:text-foreground"
          )}
        >
          Alles
        </button>
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full border transition",
              filter === c ? "bg-charcoal text-ivory border-charcoal" : "bg-foreground/5 text-foreground/60 border-foreground/10 hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((ins) => (
            <div key={ins.id} className="glass-card-2 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <span
                  className={cn(
                    "h-5 px-2 rounded-md text-[9px] font-bold flex items-center uppercase tracking-wide",
                    CAT_STYLE[ins.category] || CAT_STYLE.Suggestion
                  )}
                >
                  {ins.category}
                </span>
                <span className="text-[10px] text-foreground/45 tabular-nums">
                  {ins.confidence ? `${Math.round(ins.confidence * 100)}%` : ""}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">{ins.title}</p>
              <p className="text-xs text-foreground/65 mt-1 leading-relaxed">{ins.content}</p>
              {ins.source && <p className="text-[10px] text-foreground/40 mt-2">{ins.source}</p>}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setStatus(ins, "actioned")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-olive hover:underline"
                >
                  <Check className="h-3 w-3" /> Actie ondernemen
                </button>
                <button
                  onClick={() => setStatus(ins, "archived")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/50 hover:underline"
                >
                  <Archive className="h-3 w-3" /> Archiveer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-foreground/50">
          Nog geen inzichten. Vraag Giulia om onderzoek te doen.
        </div>
      )}
    </div>
  );
}