import React from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import {
  mockProjects, mockTasks, mockEvents, mockApprovals,
} from "@/lib/mockData";
import {
  Calendar, Mail, MessageCircle, Sparkles, ArrowRight,
  AlertCircle, CheckSquare, Phone, Briefcase,
  ChevronRight,
} from "lucide-react";

/**
 * Home — the GIULIA OS dashboard.
 * Minimal by design: only the greeting, a compact "Today" summary,
 * and Giulia's latest observation. Active projects, email & WhatsApp
 * previews are NOT permanent — they slide in as floating glass panels
 * when the user opens them from the quick-action strip.
 */

const quickActions = [
  { label: "Projecten", icon: Briefcase, path: "/projects" },
  { label: "Email", icon: Mail, path: "/email" },
  { label: "WhatsApp", icon: MessageCircle, path: "/whatsapp" },
  { label: "Nieuwe taak", icon: CheckSquare, path: "/tasks" },
  { label: "Agenda", icon: Calendar, path: "/agenda" },
  { label: "Vraag Giulia", icon: Sparkles, path: "/chat" },
  { label: "Bel Giulia", icon: Phone, path: "/voice" },
];

export default function Home() {
  const navigate = useNavigate();

  const todayEvents = mockEvents.filter((e) => e.start.startsWith("2026-08-07"));
  const todayTasks = mockTasks.filter((t) => t.status === "today");
  const attentionItems = mockApprovals.filter((a) => a.status === "pending").slice(0, 2);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ── Editorial greeting ── */}
      <section className="relative overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${IMAGES.sittingChairs})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-warm-white/92 via-warm-white/68 to-warm-white/15" />
        <div className="relative px-8 lg:px-12 py-12 lg:py-16 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            {new Date().toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-4xl lg:text-6xl font-heading font-light tracking-tight mb-4 text-balance leading-[1.05]">
            {greeting}.
          </h1>
          <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
            Je hebt {todayEvents.length} afspraken en {todayTasks.length} taken
            voor vandaag. {attentionItems.length > 0
              ? `${attentionItems.length} acties wachten op je goedkeuring.`
              : "Alles staat klaar."}
          </p>
        </div>
      </section>

      {/* ── Two-part composition: Today (wide) + Giulia (feature) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today — compact, editorial */}
        <GlassPanel level={2} className="lg:col-span-8 p-8 lg:p-10">
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="text-2xl font-heading font-light tracking-tight">Vandaag</h2>
            <button
              onClick={() => navigate("/agenda")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Volledige agenda <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Timeline of the day */}
          <div className="space-y-1">
            {todayEvents.map((event) => {
              const project = mockProjects.find((p) => p.id === event.project_id);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-5 py-3.5 -mx-2 px-2 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer group"
                  onClick={() => navigate("/agenda")}
                >
                  <div className="text-right shrink-0 w-16">
                    <p className="text-sm font-medium tabular-nums">
                      {new Date(event.start).toLocaleTimeString("nl-NL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {new Date(event.end).toLocaleTimeString("nl-NL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="w-px self-stretch bg-border/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    {project && (
                      <span className="text-[10px] text-olive mt-0.5 inline-block">
                        {project.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {todayEvents.length === 0 && (
              <p className="text-sm text-muted-foreground py-6">Geen afspraken vandaag.</p>
            )}
          </div>

          {/* Today's tasks — compact strip */}
          {todayTasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                Taken voor vandaag
              </p>
              <div className="space-y-2.5">
                {todayTasks.slice(0, 3).map((task) => {
                  const project = mockProjects.find((p) => p.id === task.project_id);
                  return (
                    <div key={task.id} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-border/80 shrink-0" />
                      <p className="text-sm flex-1 truncate">{task.title}</p>
                      {project && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {project.title}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Giulia observation — single feature panel */}
        <GlassPanel level={3} className="lg:col-span-4 p-7 lg:p-8 flex flex-col float-shadow">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-foreground/70" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
                Giulia observatie
              </p>
              <h2 className="text-sm font-heading font-medium">Voorstel</h2>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85 flex-1">
            Je hebt morgen twee afspraken die overlappen met de deadline van je
            Marktanalyse project. Ik stel voor om de wireframe review te
            verplaatsen naar vrijdag.
          </p>
          <div className="mt-6 space-y-2">
            <GlassButton
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate("/approvals")}
            >
              Bekijk voorstel
            </GlassButton>
            <button
              onClick={() => navigate("/chat")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
            >
              Negeer — vraag Giulia iets anders
            </button>
          </div>
        </GlassPanel>
      </section>

      {/* ── Needs attention — compact inline strip ── */}
      {attentionItems.length > 0 && (
        <section>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 mb-3">
            Vraagt aandacht
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attentionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate("/approvals")}
                className="glass-1 rounded-2xl p-5 text-left hover:scale-[1.01] transition-transform group flex items-start gap-3"
              >
                <AlertCircle className="h-4 w-4 text-olive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight mb-1">{item.description}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.proposed_action}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick actions — subtle horizontal strip ── */}
      <section className="flex flex-wrap gap-2.5">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="glass-1 rounded-full px-4 py-2.5 text-xs font-medium flex items-center gap-2 hover:scale-[1.02] hover:text-foreground transition-all duration-300 group"
          >
            <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            {action.label}
          </button>
        ))}
      </section>
    </div>
  );
}