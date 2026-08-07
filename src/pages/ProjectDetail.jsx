import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import Avatar from "@/components/glass/Avatar";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import {
  ArrowLeft, CheckSquare, Calendar, Mail, FileText, Sparkles,
} from "lucide-react";

const sections = ["Overview", "Tasks", "Timeline", "Files", "Communication"];

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Overview");
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await base44.entities.Project.get(id);
        setProject(p);
        const [allTasks, allEvents, allEmails, allDocs, allContacts] = await Promise.all([
          base44.entities.Task.list(),
          base44.entities.Event.list(),
          base44.entities.Email.list(),
          base44.entities.Document.list(),
          base44.entities.Contact.list(),
        ]);
        setTasks(allTasks.filter((t) => t.project_id === id));
        setEvents(allEvents.filter((e) => e.project_id === id));
        setEmails(allEmails.filter((m) => m.project_id === id));
        setDocuments(allDocs.filter((d) => d.project_id === id));
        setContacts(allContacts);
      } catch (e) {
        /* project not found */
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="space-y-4"><div className="h-40 rounded-2xl shimmer" /><div className="h-64 rounded-2xl shimmer" /></div>;
  if (!project) return <GlassPanel level={2} className="p-12 text-center"><p className="text-sm text-muted-foreground">Project niet gevonden</p><GlassButton variant="outline" size="sm" className="mt-4" onClick={() => navigate("/projects")}>Terug</GlassButton></GlassPanel>;

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3 w-3" /> Terug naar projecten
      </button>

      <div className="relative overflow-hidden rounded-2xl">
        <div className="aspect-[21/8] relative">
          <img src={project.image || IMAGES.walkingChairs} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge variant={statusVariantMap[project.status]} className="bg-white/20 border-white/30 text-white">
                {(project.status || "planning").replace(/_/g, " ")}
              </StatusBadge>
              {project.category && <span className="text-xs text-white/60">{project.category}</span>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-display font-semibold text-white mb-2">{project.title}</h1>
            {project.description && <p className="text-sm text-white/70 max-w-2xl">{project.description}</p>}
            <div className="flex items-center gap-6 mt-4 text-xs text-white/60">
              {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</span>}
              {project.next_milestone && <><span>·</span><span>Volgende: {project.next_milestone}</span></>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border/40">
        {sections.map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={cn("px-4 py-2 text-sm whitespace-nowrap transition-all border-b-2 -mb-px", activeSection === s ? "border-olive text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeSection === "Overview" && (
            <>
              <GlassPanel level={2} className="p-6">
                <h2 className="text-sm font-display font-semibold mb-4">Projectvoortgang</h2>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-display font-semibold">{project.progress || 0}</span>
                  <span className="text-lg text-muted-foreground mb-1">%</span>
                  <span className="text-xs text-muted-foreground ml-auto">voltooid</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-olive/60 rounded-full transition-all duration-700" style={{ width: `${project.progress || 0}%` }} />
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                )}
              </GlassPanel>
            </>
          )}

          {activeSection === "Tasks" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-display font-semibold mb-4">Taken</h2>
              <div className="space-y-2">
                {tasks.length === 0 && <p className="text-sm text-muted-foreground">Geen taken gekoppeld aan dit project.</p>}
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                    <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm flex-1">{task.title}</p>
                    {task.priority && <StatusBadge variant={task.priority === "high" ? "urgent" : "muted"}>{task.priority}</StatusBadge>}
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Timeline" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-display font-semibold mb-4">Tijdlijn</h2>
              <div className="space-y-4">
                {events.length === 0 && <p className="text-sm text-muted-foreground">Geen afspraken gekoppeld.</p>}
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
              <h2 className="text-sm font-display font-semibold mb-4">Bestanden</h2>
              <div className="space-y-2">
                {documents.length === 0 && <p className="text-sm text-muted-foreground">Geen bestanden gekoppeld.</p>}
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer" onClick={() => doc.url && window.open(doc.url, "_blank")}>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{doc.name}</span>
                    {doc.owner && <span className="text-xs text-muted-foreground">{doc.owner}</span>}
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Communication" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-display font-semibold mb-4">Communicatie</h2>
              <div className="space-y-2">
                {emails.length === 0 && <p className="text-sm text-muted-foreground">Geen emails gekoppeld.</p>}
                {emails.map((email) => (
                  <div key={email.id} className="p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer" onClick={() => navigate("/email")}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{email.sender}</span>
                      {email.timestamp && <span className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
        </div>

        <div className="space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-olive" />
              <h3 className="text-sm font-display font-semibold">Giulia context</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dit project heeft {tasks.length} taken, {events.length} afspraken en {emails.length} emails.
              {project.deadline && ` De deadline nadert over ${Math.max(0, Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)))} dagen.`}
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Betrokkenen</h3>
            <div className="space-y-2">
              {contacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/people/${contact.id}`)}>
                  <Avatar src={contact.avatar} name={contact.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    {contact.role && <p className="text-xs text-muted-foreground truncate">{contact.role}</p>}
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-xs text-muted-foreground">Nog geen contacten</p>}
            </div>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Snelkoppelingen</h3>
            <div className="space-y-1">
              <button onClick={() => navigate("/email")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors"><Mail className="h-4 w-4" /> {emails.length} emails</button>
              <button onClick={() => navigate("/agenda")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors"><Calendar className="h-4 w-4" /> {events.length} afspraken</button>
              <button onClick={() => navigate("/documents")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors"><FileText className="h-4 w-4" /> {documents.length} bestanden</button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}