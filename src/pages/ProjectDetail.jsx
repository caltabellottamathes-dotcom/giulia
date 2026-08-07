import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import Avatar from "@/components/glass/Avatar";
import {
  mockProjects, mockTasks, mockEvents, mockEmails,
  mockContacts, mockDocuments,
} from "@/lib/mockData";
import {
  ArrowLeft, CheckSquare, Calendar, Mail, FileText,
  Users, MessageSquare, Activity as ActivityIcon, Sparkles,
  ChevronRight, Plus,
} from "lucide-react";

const sections = ["Overview", "Tasks", "Timeline", "Milestones", "Files", "Notes", "People", "Communication", "Decisions", "Activity"];

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

const progressCategories = [
  { label: "Research", value: 85 },
  { label: "Design", value: 60 },
  { label: "Development", value: 40 },
  { label: "Content", value: 20 },
  { label: "Launch", value: 0 },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Overview");

  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];
  const tasks = mockTasks.filter((t) => t.project_id === project.id);
  const events = mockEvents.filter((e) => e.project_id === project.id);
  const emails = mockEmails.filter((m) => m.project_id === project.id);
  const documents = mockDocuments.filter((d) => d.project_id === project.id);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back link */}
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Terug naar projecten
      </button>

      {/* Project header with image */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="aspect-[21/8] relative">
          <img src={project.image} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge variant={statusVariantMap[project.status]} className="bg-white/20 border-white/30 text-white">
                {project.status.replace("_", " ")}
              </StatusBadge>
              <span className="text-xs text-white/60">{project.category}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-heading font-light text-white mb-2">{project.title}</h1>
            <p className="text-sm text-white/70 max-w-2xl">{project.description}</p>
            <div className="flex items-center gap-6 mt-4 text-xs text-white/60">
              <span>Deadline: {new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</span>
              <span>·</span>
              <span>Volgende: {project.next_milestone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border/40">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={cn(
              "px-4 py-2 text-sm whitespace-nowrap transition-all border-b-2 -mb-px",
              activeSection === s
                ? "border-olive text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {activeSection === "Overview" && (
            <>
              <GlassPanel level={2} className="p-6">
                <h2 className="text-sm font-heading font-medium mb-4">Projectvoortgang</h2>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-heading font-light">{project.progress}</span>
                  <span className="text-lg text-muted-foreground mb-1">%</span>
                  <span className="text-xs text-muted-foreground ml-auto">voltooid</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-olive/60 rounded-full transition-all duration-700" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="space-y-3">
                  {progressCategories.map((cat) => (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{cat.label}</span>
                        <span>{cat.value}%</span>
                      </div>
                      <div className="h-0.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${cat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel level={1} className="p-6">
                <h3 className="text-sm font-heading font-medium mb-3">Beschrijving</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </GlassPanel>
            </>
          )}

          {activeSection === "Tasks" && (
            <GlassPanel level={2} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-heading font-medium">Taken</h2>
                <GlassButton variant="glass" size="sm"><Plus className="h-3.5 w-3.5" /> Taak</GlassButton>
              </div>
              <div className="space-y-2">
                {tasks.length === 0 && <p className="text-sm text-muted-foreground">Geen taken gekoppeld aan dit project.</p>}
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                    <div className="h-4 w-4 rounded border border-border/80 shrink-0" />
                    <p className="text-sm flex-1">{task.title}</p>
                    <StatusBadge variant={task.priority === "high" ? "urgent" : "muted"}>{task.priority}</StatusBadge>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Timeline" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Tijdlijn</h2>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-olive" />
                      <div className="w-px flex-1 bg-border/60" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.start).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Files" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Bestanden</h2>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{doc.name}</span>
                    <span className="text-xs text-muted-foreground">{doc.owner}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Communication" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Communicatie</h2>
              <div className="space-y-2">
                {emails.map((email) => (
                  <div key={email.id} className="p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{email.sender}</span>
                      <span className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Activity" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Activiteit</h2>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="text-sm">Giulia werkte dit project bij met een notitie van Thomas</p>
                    <p className="text-xs text-muted-foreground">2 dagen geleden</p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}

          {["Milestones", "Notes", "People", "Decisions"].includes(activeSection) && (
            <GlassPanel level={2} className="p-6 text-center">
              <p className="text-sm text-muted-foreground">{activeSection} sectie — binnenkort beschikbaar</p>
            </GlassPanel>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-olive" />
              <h3 className="text-sm font-heading font-medium">Giulia context</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dit project heeft {tasks.length} taken, {events.length} afspraken en {emails.length} emails.
              De deadline nadert over {Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))} dagen.
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Betrokkenen</h3>
            <div className="space-y-2">
              {mockContacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/people/${contact.id}`)}>
                  <Avatar src={contact.avatar} name={contact.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Snelkoppelingen</h3>
            <div className="space-y-1">
              <button onClick={() => navigate("/email")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> {emails.length} emails
              </button>
              <button onClick={() => navigate("/agenda")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Calendar className="h-4 w-4" /> {events.length} afspraken
              </button>
              <button onClick={() => navigate("/documents")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-4 w-4" /> {documents.length} bestanden
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}