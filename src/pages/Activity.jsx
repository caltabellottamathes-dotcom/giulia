import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import PageHero from "@/components/glass/PageHero";
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

export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHero page="activity" icon={ActivityIcon} eyebrow="Giulia" title="Activiteit" subtitle="Wat Giulia voor je heeft gedaan — per categorie" />

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

      {!loading && groupKeys.map((k) => {
        const meta = metaFor(k);
        const list = groups[k];
        return (
          <div key={k} className="rounded-2xl border border-border/40 overflow-hidden bg-background/40">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: meta.color + "22" }}>
                  <meta.icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                </span>
                <span className="text-sm font-semibold">{meta.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{list.length}</span>
              </div>
              <button
                onClick={() => clearCategory(k)}
                className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Wis categorie
              </button>
            </div>
            <div className="divide-y divide-border/30">
              {list.map((it) => (
                <div key={it.id} className="group flex items-start gap-3 px-4 py-2.5 hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm leading-snug">{it.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(it.timestamp || it.created_date).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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
        );
      })}
    </div>
  );
}