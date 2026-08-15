import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import StatusBadge from "@/system/components/glass/StatusBadge";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Bell, HelpCircle, MessageCircle, Info, Check, X } from "lucide-react";

const tabs = ["unread", "answered", "dismissed", "all"];
const tabLabel = { unread: "Nieuw", answered: "Beantwoord", dismissed: "Weg", all: "Alles" };
const kindIcon = { question: HelpCircle, remark: MessageCircle, info: Info };
const kindLabel = { question: "Vraag", remark: "Opmerking", info: "Melding" };

/** Notifications — vragen & opmerkingen van Giulia. Geen taken, geen goedkeuringen. */
export default function Notifications() {
  const [tab, setTab] = useState("unread");
  const [answering, setAnswering] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const { data: items, loading, reload } = useEntityList("Notification", { sort: "-created_date", realtime: true });

  const filtered = items.filter((n) => tab === "all" || n.status === tab);

  const dismiss = async (n) => {
    await base44.entities.Notification.update(n.id, { status: "dismissed" });
    reload();
  };
  const submitAnswer = async (n) => {
    await base44.entities.Notification.update(n.id, { status: "answered", answer: answerText });
    setAnswering(null);
    setAnswerText("");
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="notifications" icon={Bell} eyebrow="Giulia" title="Notificaties" subtitle="Vragen en opmerkingen — geen taken, geen goedkeuringen" />

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const count = t === "all" ? items.length : items.filter((n) => n.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-2",
                tab === t ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
              )}
            >
              {tabLabel[t]}
              {count > 0 && <span className={cn("px-1.5 py-0.5 rounded-full text-[9px]", tab === t ? "bg-background/20" : "bg-foreground/10")}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading && [0, 1].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        {!loading && filtered.map((n) => {
          const Icon = kindIcon[n.kind] || MessageCircle;
          return (
            <GlassPanel key={n.id} level={2} className="p-5" style={n.urgent ? { borderLeft: "3px solid hsl(10 60% 50%)" } : undefined}>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-olive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge variant="muted">{kindLabel[n.kind] || "Opmerking"}</StatusBadge>
                    {n.urgent && <StatusBadge variant="urgent">Urgent</StatusBadge>}
                  </div>
                  {n.title && <h3 className="text-sm font-display font-semibold">{n.title}</h3>}
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  {n.answer && (
                    <div className="glass-1 rounded-lg p-3 mt-3">
                      <p className="text-[10px] uppercase tracking-wider text-olive mb-1">Jouw antwoord</p>
                      <p className="text-xs text-muted-foreground">{n.answer}</p>
                    </div>
                  )}
                  {answering === n.id && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        autoFocus
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[70px] resize-none"
                        placeholder="Jouw antwoord..."
                      />
                      <div className="flex gap-2">
                        <GlassButton variant="primary" size="sm" onClick={() => submitAnswer(n)}><Check className="h-3.5 w-3.5" /> Versturen</GlassButton>
                        <GlassButton variant="outline" size="sm" onClick={() => setAnswering(null)}>Annuleer</GlassButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {n.status !== "dismissed" && answering !== n.id && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                  {n.requires_response && n.status !== "answered" && (
                    <GlassButton variant="primary" size="sm" onClick={() => { setAnswering(n.id); setAnswerText(""); }}>Beantwoorden</GlassButton>
                  )}
                  <GlassButton variant="ghost" size="sm" onClick={() => dismiss(n)}><X className="h-3.5 w-3.5" /> Weg</GlassButton>
                </div>
              )}
            </GlassPanel>
          );
        })}
        {!loading && filtered.length === 0 && (
          <GlassPanel level={2} className="p-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Niets hier</p>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}