import React from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import {
  Mail, Calendar, FileText, MessageCircle, CheckSquare,
  Sparkles, BookOpen, Activity as ActivityIcon,
} from "lucide-react";

const actionIcons = {
  prepared_email: Mail, detected_conflict: Calendar, updated_project: FileText,
  found_documents: FileText, created_task: CheckSquare, prepared_whatsapp: MessageCircle,
  organized_knowledge: BookOpen,
};

export default function Activity() {
  const { data: items, loading } = useEntityList("Activity");
  const sorted = [...items].sort((a, b) => new Date(b.timestamp || b.created_date) - new Date(a.timestamp || a.created_date));

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="activity"
        icon={ActivityIcon}
        eyebrow="Giulia"
        title="Activiteit"
        subtitle="Wat Giulia voor je heeft gedaan"
      />

      <GlassPanel level={2} className="p-6">
        <div className="space-y-1">
          {loading && [0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
          {!loading && sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nog geen activiteit — Giulia werkt autonoom verder.</p>
          )}
          {sorted.map((item, idx) => {
            const Icon = actionIcons[item.action] || ActivityIcon;
            return (
              <div key={item.id}>
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-xl glass-1 flex items-center justify-center"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                    {idx < sorted.length - 1 && <div className="absolute left-1/2 top-full w-px h-2 bg-border/40 -translate-x-1/2" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.source && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.source}</span>}
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.timestamp || item.created_date).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {sorted.length > 0 && (
        <GlassPanel level={3} className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-olive" />
            <p className="text-xs font-medium uppercase tracking-wider text-olive">Giulia samenvatting</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Giulia heeft {sorted.length} activiteit{sorted.length !== 1 ? "en" : ""} geregistreerd.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}