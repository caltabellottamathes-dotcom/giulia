import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import { Telescope, Sparkles, Check, Archive, Trash2, Eye, Clock, TrendingUp, AlertCircle, Lightbulb, Repeat, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/system/components/glass/PageHero";

// Insights is Giulia's observation room — everyday patterns, behaviors, signals.
// NOT research reports. More like: "hm, dit valt me op."

const CATS = [
  { id: "Patroon", label: "Patroon", icon: Repeat, color: "bg-ridge text-charcoal" },
  { id: "Observatie", label: "Observatie", icon: Eye, color: "bg-sand text-ivory" },
  { id: "Gedrag", label: "Gedrag", icon: TrendingUp, color: "bg-olive text-ivory" },
  { id: "Signaal", label: "Signaal", icon: AlertCircle, color: "bg-charcoal text-ivory" },
  { id: "Idee", label: "Idee", icon: Lightbulb, color: "bg-stone text-charcoal" },
  { id: "Opmerking", label: "Opmerking", icon: Star, color: "bg-blue-grey text-charcoal" },
  // Geautomatiseerde categorieën (geschreven door analyzeFocusPatterns / analyzeLifePatterns / runProactivity via insightHelper)
  { id: "Risk", label: "Risico", icon: AlertCircle, color: "bg-charcoal text-ivory" },
  { id: "Suggestion", label: "Suggestie", icon: Lightbulb, color: "bg-sand text-ivory" },
  { id: "Opportunity", label: "Kans", icon: TrendingUp, color: "bg-olive text-ivory" },
  { id: "Follow-up", label: "Follow-up", icon: Repeat, color: "bg-ridge text-charcoal" },
  { id: "Trend", label: "Trend", icon: TrendingUp, color: "bg-blue-grey text-charcoal" },
  { id: "Review", label: "Review", icon: Star, color: "bg-stone text-charcoal" },
  { id: "Research", label: "Onderzoek", icon: Telescope, color: "bg-blue-grey text-charcoal" },
];

const CAT_MAP = Object.fromEntries(CATS.map((c) => [c.id, c]));

const STATUS_COLORS = { new: "text-olive", reviewed: "text-charcoal/60", actioned: "text-sand", archived: "text-charcoal/30" };

export default function Insights() {
  const { data: insights, loading, reload } = useEntityList("Insight", { sort: "-created_date" });
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", category: "Observatie" });
  const { toast } = useToast();

  const filtered = filter === "all" ? insights : insights.filter((i) => i.category === filter);
  const newCount = insights.filter((i) => i.status === "new").length;

  const setStatus = async (ins, status) => {
    await base44.entities.Insight.update(ins.id, { status });
    reload();
  };

  const createInsight = async () => {
    if (!draft.title.trim()) return;
    await base44.entities.Insight.create({
      ...draft,
      title: draft.title.trim(),
      source: "Handmatig",
      status: "new",
      confidence: 0.75,
    });
    setDraft({ title: "", content: "", category: "Observatie" });
    setShowNew(false);
    reload();
    toast({ title: "Observatie toegevoegd" });
  };

  const delInsight = async (ins) => {
    if (!window.confirm("Verwijderen?")) return;
    await base44.entities.Insight.delete(ins.id);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="insights"
        icon={Telescope}
        eyebrow="Giulia observeert"
        title="Inzichten"
        subtitle="Wat ik opval. Patronen. Gedrag. Dingen die ik zie en denk: hmm."
        actions={
          <button
            onClick={() => setShowNew(!showNew)}
            className="h-9 px-4 rounded-full bg-charcoal text-ivory text-xs font-bold hover:bg-charcoal/90 transition inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> Noteer observatie
          </button>
        }
      />

      {/* Stats bar */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { label: "Nieuw", count: insights.filter(i => i.status === "new").length, accent: "bg-olive text-ivory" },
          { label: "Patronen", count: insights.filter(i => i.category === "Patroon").length, accent: "bg-ridge text-charcoal" },
          { label: "Signalen", count: insights.filter(i => i.category === "Signaal").length, accent: "bg-charcoal text-ivory" },
          { label: "Ideeën", count: insights.filter(i => i.category === "Idee").length, accent: "bg-stone text-charcoal" },
        ].map(({ label, count, accent }) => (
          <div key={label} className="glass-1 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0">
            <span className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", accent)}>{count}</span>
            <span className="text-sm font-semibold text-foreground/70">{label}</span>
          </div>
        ))}
      </div>

      {/* Inline new form */}
      {showNew && (
        <div className="glass-2 rounded-3xl p-6 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">Nieuwe observatie</p>
            <button onClick={() => setShowNew(false)} className="text-foreground/40 hover:text-foreground text-lg leading-none">×</button>
          </div>
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Wat valt je op?"
            className="w-full bg-foreground/5 border border-foreground/12 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-olive/40"
            onKeyDown={(e) => e.key === "Enter" && createInsight()}
          />
          <textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Meer context (optioneel)…"
            className="w-full bg-foreground/5 border border-foreground/12 rounded-2xl px-4 py-2.5 text-sm focus:outline-none resize-none min-h-[72px]"
          />
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setDraft({ ...draft, category: c.id })}
                className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition", draft.category === c.id ? c.color + " border-transparent" : "border-foreground/15 text-foreground/60 hover:text-foreground")}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            onClick={createInsight}
            className="h-10 px-6 rounded-full bg-charcoal text-ivory text-sm font-bold hover:bg-charcoal/90 transition"
          >
            Opslaan
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold transition", filter === "all" ? "bg-charcoal text-ivory" : "bg-foreground/8 text-foreground/60 hover:text-foreground")}
        >
          Alles {insights.length > 0 && `(${insights.length})`}
        </button>
        {CATS.map((c) => {
          const cnt = insights.filter(i => i.category === c.id).length;
          if (!cnt) return null;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold border transition inline-flex items-center gap-1.5", filter === c.id ? c.color + " border-transparent" : "border-foreground/15 text-foreground/60 hover:text-foreground")}
            >
              <c.icon className="h-3 w-3" /> {c.label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Insights list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((ins) => {
            const cat = CAT_MAP[ins.category] || CATS[1];
            const CatIcon = cat.icon;
            return (
              <div
                key={ins.id}
                className={cn(
                  "glass-1 rounded-2xl p-5 border-l-4 transition hover:glass-2",
                  ins.status === "new" ? "border-l-olive" : ins.status === "actioned" ? "border-l-sand" : "border-l-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", cat.color)}>
                    <CatIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-[10px] uppercase tracking-wider font-bold", cat.color.split(" ")[1] || "text-foreground")}>{cat.label}</span>
                      {ins.status === "new" && <span className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" />}
                      {ins.source && <span className="text-[10px] text-foreground/40">{ins.source}</span>}
                      {ins.created_date && (
                        <span className="text-[10px] text-foreground/35 flex items-center gap-0.5 ml-auto">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(ins.created_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{ins.title}</p>
                    {ins.content && <p className="text-sm text-foreground/65 mt-1 leading-relaxed">{ins.content}</p>}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 ml-10">
                  {ins.status !== "actioned" && (
                    <button onClick={() => setStatus(ins, "actioned")} className="text-[11px] font-semibold text-olive hover:underline inline-flex items-center gap-1">
                      <Check className="h-3 w-3" /> Actie
                    </button>
                  )}
                  {ins.status !== "reviewed" && ins.status !== "archived" && (
                    <button onClick={() => setStatus(ins, "reviewed")} className="text-[11px] font-semibold text-foreground/50 hover:underline inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Gezien
                    </button>
                  )}
                  <button onClick={() => setStatus(ins, "archived")} className="text-[11px] font-semibold text-foreground/40 hover:underline inline-flex items-center gap-1">
                    <Archive className="h-3 w-3" /> Archiveer
                  </button>
                  <button onClick={() => delInsight(ins)} className="text-[11px] font-semibold text-foreground/30 hover:text-destructive hover:underline inline-flex items-center gap-1 ml-auto">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-1 rounded-3xl p-16 text-center">
          <Telescope className="h-8 w-8 text-foreground/25 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground/50">Giulia observeert nog.</p>
          <p className="text-xs text-foreground/35 mt-1">Inzichten verschijnen hier zodra ik iets opmerk.</p>
        </div>
      )}
    </div>
  );
}