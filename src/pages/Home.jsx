import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import GlassPanel from "@/components/glass/GlassPanel";
import StatusBadge from "@/components/glass/StatusBadge";
import {
  mockProjects, mockTasks, mockEvents, mockEmails,
  mockWhatsApp, mockApprovals, mockContacts,
} from "@/lib/mockData";
import {
  Calendar, Mail, MessageCircle, Sparkles, ArrowRight,
  AlertCircle, CheckSquare, Plus, Phone, Briefcase,
} from "lucide-react";

const statusVariantMap = {
  planning: "waiting",
  in_progress: "active",
  waiting: "waiting",
  completed: "completed",
  archived: "muted",
};

const quickActions = [
  { label: "Nieuwe taak", icon: CheckSquare, path: "/tasks" },
  { label: "Nieuw project", icon: Plus, path: "/projects" },
  { label: "Nieuw event", icon: Calendar, path: "/agenda" },
  { label: "Email opstellen", icon: Mail, path: "/email" },
  { label: "Vraag Giulia", icon: Sparkles, path: "/chat" },
  { label: "Bel Giulia", icon: Phone, path: "/voice" },
];

export default function Home() {
  const navigate = useNavigate();

  const todayEvents = mockEvents.filter((e) => e.start.startsWith("2026-08-07"));
  const todayTasks = mockTasks.filter((t) => t.status === "today");
  const attentionItems = mockApprovals.filter((a) => a.status === "pending").slice(0, 3);
  const activeProjects = mockProjects
    .filter((p) => p.status === "in_progress" || p.status === "planning")
    .slice(0, 3);
  const unreadEmails = mockEmails.filter((m) => m.folder === "inbox" && m.status === "unread");
  const unreadWhatsApp = mockWhatsApp.filter((m) => m.direction === "received" && m.status === "unread");
  const giuliaDrafts = mockEmails.filter((m) => m.folder === "giulia_drafts");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="space-y-8 animate-fade-up">
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
        <div className="absolute inset-0 bg-gradient-to-r from-warm-white/90 via-warm-white/65 to-warm-white/15" />
        <div className="relative px-8 lg:px-12 py-10 lg:py-16 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            {new Date().toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-3xl lg:text-5xl font-heading font-light tracking-tight mb-4 text-balance leading-[1.1]">
            {greeting}.
          </h1>
          <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
            Je hebt {todayEvents.length} afspraken, {todayTasks.length} taken voor
            vandaag, en {attentionItems.length} acties wachten op je goedkeuring.
          </p>
        </div>
      </section>

      {/* ── Asymmetric composition: Today (wide) + Giulia (feature) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today — wide */}
        <GlassPanel level={2} className="lg:col-span-8 p-7 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-light">Vandaag</h2>
            <button
              onClick={() => navigate("/agenda")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Volledige agenda <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-1">
            {todayEvents.map((event) => {
              const project = mockProjects.find((p) => p.id === event.project_id);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 py-3 -mx-2 px-2 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer group"
                  onClick={() => navigate("/agenda")}
                >
                  <div className="text-right shrink-0 w-14">
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
                    <p className="text-xs text-muted-foreground truncate">
                      {event.location}
                    </p>
                    {project && (
                      <span className="text-[10px] text-olive mt-0.5 inline-block">
                        {project.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {todayTasks.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                Taken voor vandaag
              </p>
              <div className="space-y-2">
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

        {/* Giulia observation — feature panel */}
        <GlassPanel level={3} className="lg:col-span-4 p-7 lg:p-8 flex flex-col">
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
            <button
              onClick={() => navigate("/approvals")}
              className="w-full h-10 rounded-xl bg-charcoal text-ivory text-sm font-medium hover:bg-charcoal/90 transition-colors"
            >
              Bekijk voorstel
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
            >
              Negeer — vraag Giulia iets anders
            </button>
          </div>
        </GlassPanel>
      </section>

      {/* ── Projects (image-led, asymmetric) + Right stack ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active projects — editorial, image-led */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-light">Actieve projecten</h2>
            <button
              onClick={() => navigate("/projects")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Alle projecten <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Featured project — spans 2 cols, larger */}
            {activeProjects[0] && (
              <div
                onClick={() => navigate(`/projects/${activeProjects[0].id}`)}
                className="md:col-span-2 cursor-pointer group relative overflow-hidden rounded-2xl aspect-[16/7]"
              >
                <img
                  src={activeProjects[0].image}
                  alt={activeProjects[0].title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <StatusBadge
                    variant={statusVariantMap[activeProjects[0].status]}
                    className="mb-3 self-start bg-white/15 border-white/25 text-white"
                  >
                    {activeProjects[0].status.replace("_", " ")}
                  </StatusBadge>
                  <h3 className="text-white text-xl font-heading font-light mb-2">
                    {activeProjects[0].title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-white/70">
                    <span>{activeProjects[0].progress}% voltooid</span>
                    <span>·</span>
                    <span>{activeProjects[0].next_milestone}</span>
                  </div>
                  <div className="mt-3 h-0.5 bg-white/20 rounded-full overflow-hidden max-w-xs">
                    <div
                      className="h-full bg-white/60 rounded-full transition-all duration-700"
                      style={{ width: `${activeProjects[0].progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Smaller project cards */}
            {activeProjects.slice(1).map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="cursor-pointer group relative overflow-hidden rounded-2xl aspect-[4/3]"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <StatusBadge
                    variant={statusVariantMap[project.status]}
                    className="mb-2 bg-white/15 border-white/25 text-white"
                  >
                    {project.status.replace("_", " ")}
                  </StatusBadge>
                  <h3 className="text-white font-heading font-medium text-sm mb-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-white/70">
                    <span>{project.progress}%</span>
                    <span>·</span>
                    <span className="truncate">{project.next_milestone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right stack — Attention + Communication */}
        <div className="lg:col-span-4 space-y-6">
          {/* Needs attention */}
          <GlassPanel level={2} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-olive" />
              <h3 className="text-sm font-heading font-medium">Vraagt aandacht</h3>
            </div>
            <div className="space-y-1">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate("/approvals")}
                  className="cursor-pointer group p-3 -mx-1 rounded-xl hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium leading-tight">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.proposed_action}
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Communication — Email */}
          <GlassPanel level={1} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Email</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {unreadEmails.length} ongelezen
              </span>
            </div>
            <div className="space-y-2.5">
              {unreadEmails.slice(0, 2).map((email) => (
                <div
                  key={email.id}
                  onClick={() => navigate("/email")}
                  className="cursor-pointer"
                >
                  <p className="text-xs font-medium truncate">{email.sender}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {email.subject}
                  </p>
                </div>
              ))}
              {giuliaDrafts.length > 0 && (
                <div className="pt-2.5 border-t border-border/40 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-olive" />
                  <p className="text-[11px] text-muted-foreground">
                    {giuliaDrafts.length} Giulia concepten wachten
                  </p>
                </div>
              )}
            </div>
          </GlassPanel>

          {/* Communication — WhatsApp */}
          <GlassPanel level={1} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">WhatsApp</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {unreadWhatsApp.length} ongelezen
              </span>
            </div>
            <div className="space-y-2.5">
              {unreadWhatsApp.slice(0, 2).map((msg) => {
                const contact = mockContacts.find((c) => c.id === msg.contact_id);
                return (
                  <div
                    key={msg.id}
                    onClick={() => navigate("/whatsapp")}
                    className="cursor-pointer"
                  >
                    <p className="text-xs font-medium truncate">
                      {contact?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {msg.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* ── Quick actions — subtle, horizontal ── */}
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