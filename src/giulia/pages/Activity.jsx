import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import PageHero from "@/system/components/glass/PageHero";
import { base44 } from "@/api/base44Client";
import {
  Mail, Calendar, FileText, MessageCircle, CheckSquare, BookOpen,
  Trash2, Activity as ActivityIcon, Sparkles,
} from "lucide-react";

const SRC_META = {
  email: { label: "Email", icon: Mail, color: "hsl(16 45% 47%)" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "hsl(var(--sand))" },
  task: { label: "Taken", icon: CheckSquare, color: "hsl(var(--olive))" },
  calendar: { label: "Agenda", icon: Calendar, color: "hsl(var(--ridge))" },
  system: { label: "Systeem", icon: ActivityIcon, color: "hsl(var(--smoke))" },
  giulia: { label: "Giulia", icon: Sparkles, color: "hsl(var(--olive))" },
  knowledge: { label: "Kennis", icon: BookOpen, color: "hsl(var(--olive))" },
  files: { label: "Documenten", icon: FileText, color: "hsl(var(--charcoal))" },
};
const metaFor = (src) =>
  SRC_META[(src || "").toLowerCase()] || { label: src || "Overig", icon: ActivityIcon, color: "hsl(var(--smoke))" };

/** Activity — per-agent tabs bovenaan i.p.v. eindeloos scrollende gestapelde groepen. */
export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Activity.list("-created_date", 200);
      setItems(list || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try { await base44.entities.Activity.delete(id); } catch { load(); }
  };
  const clearCategory = async (k) => {
    const ids = items.filter((i) => (i.source || "").toLowerCase() === k).map((i) => i.id);
    setItems((prev) => prev.filter((i) => (i.source || "").toLowerCase() !== k));
    try { await base44.entities.Activity.deleteMany({ id: { $in: ids } }); } catch { load(); }
  };

  const sorted = [...items].sort((a, b) => new Date(b.timestamp || b.created_date) - new Date(a.timestamp || a.created_date));
  const groups = {};
  sorted.forEach((it) => {
    const k = (it.source || "overig").toLowerCase();
    (groups[k] = groups[k] || []).push(it);
  });
  const groupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const visible = tab === "all" ? sorted : (groups[tab] || []);

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHero page="activity" icon={ActivityIcon} eyebrow="Giulia" title="I Do Process!" subtitle="Wat Giulia voor je heeft gedaan — per agent" />

      {loading && (
        <GlassPanel level={2} className="p-6 space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
        </GlassPanel>
      )}

      {!loading && sorted.length === 0 && (
        <GlassPanel level={2} className="p-6">
          <p className="text-sm text-muted-foreground text-center py-8">Nog geen activiteit — Giulia werkt autonoom verder.</p>
        </GlassPanel>
      )}

      {!loading && sorted.length > 0 && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setTab("all")}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-2",
                tab === "all" ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
              )}
            >
              Alles
              <span className={cn("px-1.5 py-0.5 rounded-full text-[9px]", tab === "all" ? "bg-background/20" : "bg-foreground/10")}>{sorted.length}</span>
            </button>
            {groupKeys.map((k) => {
              const meta = metaFor(k);
              return (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-2",
                    tab === k ? "text-white font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
                  )}
                  style={tab === k ? { background: meta.color } : undefined}
                >
                  <meta.icon className="h-3 w-3" />
                  {meta.label}
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[9px]", tab === k ? "bg-white/20" : "bg-foreground/10")}>{groups[k].length}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/40">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <span className="text-sm font-semibold">{tab === "all" ? "Alle activiteit" : metaFor(tab).label}</span>
              {tab !== "all" && (
                <button
                  onClick={() => clearCategory(tab)}
                  className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Wis categorie
                </button>
              )}
            </div>
            <div className="divide-y divide-border/30 max-h-[560px] overflow-y-auto">
              {visible.map((it) => (
                <div key={it.id} className="group flex items-start gap-3 px-4 py-2.5 hover:bg-foreground/[0.02] transition-colors">
                  <span className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: metaFor(it.source).color }} />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm leading-snug">{it.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {metaFor(it.source).label} · {new Date(it.timestamp || it.created_date).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                    aria-label="Verwijder activiteit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}