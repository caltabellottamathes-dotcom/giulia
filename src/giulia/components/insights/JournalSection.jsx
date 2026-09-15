import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { journalTypeLabel, fmtTime, fmtDate } from "@/lib/selfUtils";
import { BookOpen, Star, Plus, Trash2, Clock, Sparkles } from "lucide-react";

// JournalSection — het journal als volwaardige tab in Insights.
// Zelfde editorial taal als de Observaties-tab: glass-kaarten, pill-filters,
// stats-chips. Eén duidelijke plek: Giulia's dagbeeld bovenaan, daaronder
// je eigen entries per dag.

const TYPES = [
  { id: "entry", label: "Entry", color: "bg-stone text-charcoal" },
  { id: "moment", label: "Moment", color: "bg-ridge text-charcoal" },
  { id: "reflection", label: "Reflectie", color: "bg-blue-grey text-charcoal" },
  { id: "highlight", label: "Highlight", color: "bg-sand text-ivory" },
  { id: "thread", label: "Draad", color: "bg-olive text-ivory" },
];
const TYPE_MAP = Object.fromEntries(TYPES.map((t) => [t.id, t]));

export default function JournalSection() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("today");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ title: "", type: "moment", content: "" });

  const load = async () => {
    try {
      const list = await base44.entities.JournalEntry.list("-date", 120);
      setEntries(list || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const today = useMemo(() => {
    const d = new Date().toDateString();
    return entries
      .filter((e) => e.date && new Date(e.date).toDateString() === d)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries]);
  const highlights = useMemo(() => entries.filter((e) => e.is_highlight), [entries]);
  // Giulia's avonddagbeeld (buildDailyJournal) — het anker van de tab.
  const dagbeeld = useMemo(
    () => entries.find((e) => (e.agent_source || "").includes("buildDailyJournal") || /^Dagbeeld/i.test(e.title || "")),
    [entries]
  );

  const add = async () => {
    if (!draft.title.trim()) return;
    await base44.entities.JournalEntry.create({
      title: draft.title.trim(),
      type: draft.type,
      content: draft.content || undefined,
      date: new Date().toISOString(),
      is_highlight: draft.type === "highlight",
    });
    setDraft({ title: "", type: "moment", content: "" });
    setShowNew(false);
    await load();
    toast({ title: "Aan je journal toegevoegd" });
  };

  const del = async (e) => {
    if (!window.confirm("Deze entry verwijderen?")) return;
    await base44.entities.JournalEntry.delete(e.id);
    load();
  };

  const list = view === "today" ? today : view === "highlights" ? highlights : entries;

  return (
    <div className="space-y-5">
      {/* Stats bar — zelfde vorm als de Observaties-tab */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { label: "Vandaag", count: today.length, accent: "bg-olive text-ivory" },
          { label: "Highlights", count: highlights.length, accent: "bg-sand text-ivory" },
          { label: "Totaal", count: entries.length, accent: "bg-stone text-charcoal" },
        ].map(({ label, count, accent }) => (
          <div key={label} className="glass-1 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0">
            <span className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", accent)}>{count}</span>
            <span className="text-sm font-semibold text-foreground/70">{label}</span>
          </div>
        ))}
        <button
          onClick={() => setShowNew(!showNew)}
          className="ml-auto h-8 px-4 rounded-full bg-charcoal text-ivory text-xs font-bold hover:bg-charcoal/90 transition inline-flex items-center gap-1.5 shrink-0 self-center"
        >
          <Plus className="h-3.5 w-3.5" /> Entry
        </button>
      </div>

      {/* Giulia's dagbeeld — avondreflectie als redactionele kaart */}
      {dagbeeld ? (
        <div className="rounded-[28px] bg-charcoal p-6 text-ivory">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-ivory/60" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-ivory/60 font-bold">
              Giulia's dagbeeld · {fmtDate(dagbeeld.date)}
            </p>
          </div>
          <h3 className="text-xl font-display font-semibold tracking-[-0.02em] mb-2">{dagbeeld.title}</h3>
          {dagbeeld.content && (
            <p className="text-sm leading-relaxed text-ivory/85 whitespace-pre-line">{dagbeeld.content}</p>
          )}
        </div>
      ) : (
        <div className="glass-1 rounded-3xl p-8 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-foreground/30 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground/60">Nog geen dagbeeld.</p>
            <p className="text-xs text-foreground/40 mt-1">Giulia schrijft elke avond om 22:00 een samenvatting van je dag.</p>
          </div>
        </div>
      )}

      {/* Nieuwe entry */}
      {showNew && (
        <div className="glass-2 rounded-3xl p-6 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">Nieuwe journal entry</p>
            <button onClick={() => setShowNew(false)} className="text-foreground/40 hover:text-foreground text-lg leading-none">×</button>
          </div>
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Wat wil je vastleggen?"
            className="w-full bg-foreground/5 border border-foreground/12 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-olive/40"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setDraft({ ...draft, type: t.id })}
                className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition", draft.type === t.id ? t.color + " border-transparent" : "border-foreground/15 text-foreground/60 hover:text-foreground")}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Meer context (optioneel)…"
            className="w-full bg-foreground/5 border border-foreground/12 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/40 resize-none min-h-[72px]"
          />
          <button onClick={add} className="h-10 px-6 rounded-full bg-charcoal text-ivory text-sm font-bold hover:bg-charcoal/90 transition">
            Opslaan
          </button>
        </div>
      )}

      {/* View pills */}
      <div className="flex flex-wrap gap-2">
        {[["today", "Vandaag"], ["all", "Alles"], ["highlights", "Highlights"]].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold transition", view === k ? "bg-charcoal text-ivory" : "bg-foreground/8 text-foreground/60 hover:text-foreground")}
          >
            {l} {view === k && `(${list.length})`}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
        </div>
      ) : list.length > 0 ? (
        <div className="space-y-3">
          {list.map((e) => {
            const t = TYPE_MAP[e.type] || TYPES[0];
            return (
              <div key={e.id} className="glass-1 rounded-2xl p-5 border-l-4 border-l-transparent hover:glass-2 transition group">
                <div className="flex items-start gap-3">
                  <span className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", t.color)}>
                    {e.is_highlight ? <Star className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-[10px] uppercase tracking-wider font-bold", t.color.split(" ")[1])}>{journalTypeLabel(e.type)}</span>
                      {e.is_highlight && <Star className="h-3 w-3 text-sand" />}
                      {(e.mood || e.tags?.length > 0) && (
                        <span className="text-[10px] text-foreground/40">{[e.mood, ...(e.tags || [])].filter(Boolean).slice(0, 3).join(" · ")}</span>
                      )}
                      {e.date && (
                        <span className="text-[10px] text-foreground/35 flex items-center gap-0.5 ml-auto">
                          <Clock className="h-2.5 w-2.5" />
                          {view === "today" ? fmtTime(e.date) : fmtDate(e.date)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{e.title}</p>
                    {e.content && <p className="text-sm text-foreground/65 mt-1 leading-relaxed">{e.content}</p>}
                  </div>
                  <button onClick={() => del(e)} className="text-foreground/25 hover:text-destructive opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-1 rounded-3xl p-12 text-center">
          <BookOpen className="h-8 w-8 text-foreground/25 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground/50">
            {view === "today" ? "Vandaag staat nog niks in je journal." : view === "highlights" ? "Nog geen highlights." : "Je journal is nog leeg."}
          </p>
          <p className="text-xs text-foreground/35 mt-1">Leg hier je momenten, reflecties en gedachten vast — of wacht op Giulia's dagbeeld.</p>
        </div>
      )}
    </div>
  );
}