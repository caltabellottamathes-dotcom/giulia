import React from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import { mockActivity } from "@/lib/mockData";
import {
  Mail, Calendar, FileText, MessageCircle, CheckSquare,
  Sparkles, Brain, BookOpen, Activity as ActivityIcon,
} from "lucide-react";

const actionIcons = {
  prepared_email: Mail,
  detected_conflict: Calendar,
  updated_project: FileText,
  found_documents: FileText,
  created_task: CheckSquare,
  prepared_whatsapp: MessageCircle,
  organized_knowledge: BookOpen,
};

const sourceColors = {
  Email: "text-blue-grey",
  WhatsApp: "text-olive",
  Agenda: "text-olive",
  Projects: "text-foreground/70",
  Documents: "text-foreground/70",
  Knowledge: "text-foreground/70",
};

export default function Activity() {
  const sorted = [...mockActivity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-heading font-light tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Wat Giulia voor je heeft gedaan</p>
      </div>

      <GlassPanel level={2} className="p-6">
        <div className="space-y-1">
          {sorted.map((item, idx) => {
            const Icon = actionIcons[item.action] || ActivityIcon;
            return (
              <div key={item.id}>
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-xl glass-1 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {idx < sorted.length - 1 && (
                      <div className="absolute left-1/2 top-full w-px h-2 bg-border/40 -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase tracking-wider ${sourceColors[item.source] || "text-muted-foreground"}`}>
                        {item.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel level={3} className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-olive" />
          <p className="text-xs font-medium uppercase tracking-wider text-olive">Giulia samenvatting</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vandaag heeft Giulia {sorted.length} acties uitgevoerd: 2 emails voorbereid, 1 agendabotsing gedetecteerd,
          1 project bijgewerkt, 1 taak aangemaakt en kennis georganiseerd.
        </p>
      </GlassPanel>
    </div>
  );
}