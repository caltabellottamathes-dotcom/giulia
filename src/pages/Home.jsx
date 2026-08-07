import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import {
  mockProjects, mockTasks, mockEvents, mockEmails,
  mockWhatsApp, mockApprovals, mockContacts,
} from "@/lib/mockData";
import {
  Calendar, Mail, MessageCircle, Sparkles, ArrowRight,
  AlertCircle, Clock, CheckSquare, Plus, Phone,
} from "lucide-react";

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

export default function Home() {
  const navigate = useNavigate();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const todayEvents = mockEvents.filter((e) => e.start.startsWith("2026-08-07"));
  const todayTasks = mockTasks.filter((t) => t.status === "today");
  const attentionItems = mockApprovals.filter((a) => a.status === "pending").slice(0, 3);
  const activeProjects = mockProjects.filter((p) => p.status === "in_progress" || p.status === "planning").slice(0, 3);
  const unreadEmails = mockEmails.filter((m) => m.folder === "inbox" && m.status === "unread");
  const unreadWhatsApp = mockWhatsApp.filter((m) => m.direction === "received" && m.status === "unread");
  const giuliaDrafts = mockEmails.filter((m) => m.folder === "giulia_drafts");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  const quickActions = [
    { label: "Nieuwe taak", icon: CheckSquare, action: () => navigate("/tasks") },
    { label: "Nieuw project", icon: Plus, action: () => navigate("/projects") },
    { label: "Nieuw event", icon: Calendar, action: () => navigate("/agenda") },
    { label: "Email opstellen", icon: Mail, action: () => navigate("/email") },
    { label: "Vraag Giulia", icon: Sparkles, action: () => navigate("/chat") },
    { label: "Bel Giulia", icon: Phone, action: () => navigate("/voice") },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 editorial-bg"
          style={{ backgroundImage: `url(${IMAGES.sittingChairs})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30" />
        <div className="relative p-8 lg:p-12 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl lg:text-4xl font-heading font-light tracking-tight mb-3 text-balance">
            {greeting}. Waarmee kan Giulia je vandaag helpen?
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Je hebt {todayEvents.length} afspraken, {todayTasks.length} taken voor vandaag,
            en {attentionItems.length} acties wachten op je goedkeuring.
          </p>
        </div>
      </div>

      {/* Editorial asymmetric grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today — large left */}
        <GlassPanel level={2} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-heading font-medium">Vandaag</h2>
            <button
              onClick={() => navigate("/agenda")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Volledige agenda <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {todayEvents.map((event) => {
              const project = mockProjects.find((p) => p.id === event.project_id);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer group"
                  onClick={() => navigate("/agenda")}
                >
                  <div className="text-right shrink-0 w-16">
                    <p className="text-sm font-medium">
                      {new Date(event.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(event.end).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="w-px h-12 bg-border/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-foreground transition-colors">{event.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    {project && (
                      <span className="text-[10px] text-olive mt-1 inline-block">{project.title}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {todayTasks.length > 0 && (
              <div className="pt-3 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Taken voor vandaag</p>
                {todayTasks.slice(0, 3).map((task) => {
                  const project = mockProjects.find((p) => p.id === task.project_id);
                  return (
                    <div key={task.id} className="flex items-center gap-3 py-1.5">
                      <div className="h-4 w-4 rounded border border-border/80 shrink-0" />
                      <p className="text-sm flex-1 truncate">{task.title}</p>
                      {project && <span className="text-[10px] text-muted-foreground">{project.title}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlassPanel>

        {/* Giulia observation */}
        <GlassPanel level={3} className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
            </div>
            <h2 className="text-sm font-heading font-medium">Giulia's observatie</h2>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80 flex-1">
            Je hebt morgen twee afspraken die overlappen met de deadline van je Marktanalyse project.
            Ik stel voor om de wireframe review te verplaatsen naar vrijdag.
          </p>
          <div className="mt-4 space-y-2">
            <GlassButton
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => navigate("/approvals")}
            >
              Bekijk voorstel
            </GlassButton>
            <button
              onClick={() => navigate("/chat")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Negeer — vraag Giulia iets anders
            </button>
          </div>
        </GlassPanel>
      </div>

      {/* Needs attention + Communication */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel level={2} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-olive" />
            <h2 className="text-sm font-heading font-medium">Vraagt aandacht</h2>
          </div>
          <div className="space-y-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate("/approvals")}
                className="cursor-pointer group p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">{item.description}</p>
                  <StatusBadge variant="urgent">{item.category}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{item.proposed_action}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Communication */}
        <div className="space-y-6">
          <GlassPanel level={1} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Email</h3>
              </div>
              <span className="text-xs text-muted-foreground">{unreadEmails.length} ongelezen</span>
            </div>
            <div className="space-y-2">
              {unreadEmails.slice(0, 2).map((email) => (
                <div
                  key={email.id}
                  onClick={() => navigate("/email")}
                  className="cursor-pointer text-xs"
                >
                  <p className="font-medium truncate">{email.sender}</p>
                  <p className="text-muted-foreground truncate">{email.subject}</p>
                </div>
              ))}
              {giuliaDrafts.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[10px] uppercase tracking-wider text-olive mb-1">Giulia concepten</p>
                  <p className="text-xs text-muted-foreground">{giuliaDrafts.length} wacht op goedkeuring</p>
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">WhatsApp</h3>
              </div>
              <span className="text-xs text-muted-foreground">{unreadWhatsApp.length} ongelezen</span>
            </div>
            <div className="space-y-2">
              {unreadWhatsApp.slice(0, 2).map((msg) => {
                const contact = mockContacts.find((c) => c.id === msg.contact_id);
                return (
                  <div key={msg.id} onClick={() => navigate("/whatsapp")} className="cursor-pointer text-xs">
                    <p className="font-medium truncate">{contact?.name}</p>
                    <p className="text-muted-foreground truncate">{msg.message}</p>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>

        {/* Quick actions */}
        <GlassPanel level={2} className="p-6">
          <h2 className="text-sm font-heading font-medium mb-4">Snelle acties</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="glass-button rounded-xl p-3 text-left transition-all group"
              >
                <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground mb-2 transition-colors" />
                <p className="text-xs font-medium">{action.label}</p>
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Active Projects — editorial */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-medium">Actieve projecten</h2>
          <button
            onClick={() => navigate("/projects")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Alle projecten <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeProjects.map((project, idx) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className={cn(
                "cursor-pointer group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01]",
                idx === 0 && "md:col-span-1"
              )}
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <StatusBadge variant={statusVariantMap[project.status]} className="mb-2 bg-white/20 border-white/30 text-white">
                    {project.status.replace("_", " ")}
                  </StatusBadge>
                  <h3 className="text-white font-heading font-medium mb-1">{project.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-white/70">
                    <span>{project.progress}% voltooid</span>
                    <span>·</span>
                    <span>{project.next_milestone}</span>
                  </div>
                  <div className="mt-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/60 rounded-full transition-all duration-700"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}