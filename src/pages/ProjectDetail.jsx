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
  ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle, Loader2, Pencil, Trash2,
  Calendar, Mail, FileText, Users, Briefcase,
} from "lucide-react";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";

const statusMeta = {
  done: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500" },
  completed: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500" },
  in_progress: { label: "Actief", color: "text-olive", dot: "bg-olive" },
  upcoming: { label: "Gepland", color: "text-blue-500", dot: "bg-blue-500" },
  today: { label: "Vandaag", color: "text-olive", dot: "bg-olive" },
  todo: { label: "Te doen", color: "text-muted-foreground", dot: "bg-muted-foreground/50" },
  waiting: { label: "Wacht", color: "text-amber-500", dot: "bg-amber-500" },
  overdue: { label: "Te laat", color: "text-red-500", dot: "bg-red-500" },
  delegated: { label: "Gedelegeerd", color: "text-purple-500", dot: "bg-purple-500" },
};

const projectStatusMap = {
  planning: "Planning", in_progress: "Actief", waiting: "Wacht", completed: "Klaar", archived: "Gearchiveerd",
};

const projectStatusVariant = {
  planning: "waiting", in_progress: "active", waiting: "waiting", completed: "completed", archived: "muted",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
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
    } catch {
      /* project not found */
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    const next = task.status === "done" ? "in_progress" : "done";
    await base44.entities.Task.update(task.id, { status: next });
    const allTasks = await base44.entities.Task.list();
    const projTasks = allTasks.filter((t) => t.project_id === id);
    setTasks(projTasks);
    if (projTasks.length) {
      const done = projTasks.filter((t) => t.status === "done").length;
      const progress = Math.round((done / projTasks.length) * 100);
      await base44.entities.Project.update(id, { progress });
      setProject((p) => (p ? { ...p, progress } : p));
    }
  };

  const delProject = async () => {
    if (!window.confirm("Project verwijderen?")) return;
    await base44.entities.Project.delete(id);
    navigate("/projects");
  };

  if (loading) return <div className="space-y-4"><div className="h-40 rounded-2xl shimmer" /><div className="h-64 rounded-2xl shimmer" /></div>;
  if (!project) return (
    <GlassPanel level={2} className="p-12 text-center">
      <p className="text-sm text-muted-foreground">Project niet gevonden</p>
      <GlassButton variant="outline" size="sm" className="mt-4" onClick={() => navigate("/projects")}>Terug</GlassButton>
    </GlassPanel>
  );

  // group tasks by context (fase)
  const groups = {};
  tasks.forEach((t) => {
    const ctx = t.context || "Overig";
    if (!groups[ctx]) groups[ctx] = [];
    groups[ctx].push(t);
  });
  const groupKeys = Object.keys(groups).sort();

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const activeCount = tasks.filter((t) => t.status === "in_progress").length;
  const todoCount = tasks.filter((t) => ["todo", "upcoming"].includes(t.status)).length;
  const waitCount = tasks.filter((t) => t.status === "waiting").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : (project.progress || 0);

  const stats = [
    { label: "Taken", value: tasks.length, icon: Briefcase, tone: "text-foreground" },
    { label: "Klaar", value: doneCount, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Actief", value: activeCount, icon: Loader2, tone: "text-olive" },
    { label: "Te doen", value: todoCount, icon: Circle, tone: "text-muted-foreground" },
    { label: "Wacht", value: waitCount, icon: AlertCircle, tone: "text-amber-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar projecten
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] float-shadow">
        <div className="aspect-[21/8] relative">
          <img src={project.image || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/60 to-charcoal/25" />
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button onClick={() => setEditorOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition">
              <Pencil className="h-3.5 w-3.5" /> Bewerk
            </button>
            <button onClick={delProject} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500/40 transition">
              <Trash2 className="h-3.5 w-3.5" /> Verwijder
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge variant={projectStatusVariant[project.status] || "waiting"} className="bg-white/20 border-white/30 text-white">
                {projectStatusMap[project.status] || "Planning"}
              </StatusBadge>
              {project.category && <span className="text-[11px] uppercase tracking-wider text-white/60">{project.category}</span>}
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2 tracking-tight">{project.title}</h1>
            {project.description && <p className="text-sm text-white/70 max-w-2xl">{project.description}</p>}
            {(project.deadline || project.next_milestone) && (
              <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
                {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</span>}
                {project.next_milestone && <span>Volgende: {project.next_milestone}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel level={2} className="p-6">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Voortgang</p>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-5xl font-display font-bold leading-none">{progress}</span>
            <span className="text-xl text-muted-foreground mb-0.5">%</span>
            <span className="text-xs text-muted-foreground ml-auto mb-1.5">{doneCount}/{tasks.length} taken</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-olive rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </GlassPanel>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 flex flex-col">
              <s.icon className={cn("h-4 w-4 mb-3", s.tone)} strokeWidth={1.75} />
              <p className="text-2xl font-display font-bold leading-none">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Task groups per fase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold tracking-tight">Taken per fase</h2>
          <span className="text-xs text-muted-foreground">{groupKeys.length} fases · {tasks.length} taken</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groupKeys.map((g) => {
            const gTasks = [...groups[g]].sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0));
            const gDone = groups[g].filter((t) => t.status === "done").length;
            const gTotal = groups[g].length;
            const gProgress = gTotal ? Math.round((gDone / gTotal) * 100) : 0;
            return (
              <div key={g} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-display font-semibold pr-2">{g}</h3>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{gDone}/{gTotal}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-olive/60 rounded-full transition-all duration-500" style={{ width: `${gProgress}%` }} />
                </div>
                <div className="space-y-0.5">
                  {gTasks.map((task) => {
                    const meta = statusMeta[task.status] || statusMeta.todo;
                    const isDone = task.status === "done";
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/[0.04] transition text-left"
                      >
                        <span className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition", isDone ? "bg-emerald-500 border-emerald-500" : "border-border/60")}>
                          {isDone ? <CheckCircle2 className="h-4 w-4 text-white" /> : <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />}
                        </span>
                        <span className={cn("text-sm flex-1 leading-snug", isDone ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</span>
                        {!isDone && <span className={cn("text-[10px] uppercase tracking-wider font-semibold shrink-0", meta.color)}>{meta.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Related: afspraken, emails, bestanden, betrokkenen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-display font-semibold">Afspraken</h3>
            <span className="text-xs text-muted-foreground ml-auto">{events.length}</span>
          </div>
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground">Geen afspraken gekoppeld.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(event.start).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-display font-semibold">Communicatie</h3>
            <span className="text-xs text-muted-foreground ml-auto">{emails.length}</span>
          </div>
          {emails.length === 0 ? (
            <p className="text-xs text-muted-foreground">Geen emails gekoppeld.</p>
          ) : (
            <div className="space-y-2">
              {emails.map((email) => (
                <div key={email.id} className="cursor-pointer" onClick={() => navigate("/email")}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{email.sender}</span>
                    {email.timestamp && <span className="text-[11px] text-muted-foreground">{new Date(email.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{email.subject}</p>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-display font-semibold">Bestanden</h3>
            <span className="text-xs text-muted-foreground ml-auto">{documents.length}</span>
          </div>
          {documents.length === 0 ? (
            <p className="text-xs text-muted-foreground">Geen bestanden gekoppeld.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 cursor-pointer hover:bg-foreground/[0.03] p-1.5 rounded-lg" onClick={() => doc.url && window.open(doc.url, "_blank")}>
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm flex-1 truncate">{doc.name || doc.filename}</span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-display font-semibold">Betrokkenen</h3>
            <span className="text-xs text-muted-foreground ml-auto">{contacts.length}</span>
          </div>
          {contacts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nog geen contacten.</p>
          ) : (
            <div className="space-y-2">
              {contacts.slice(0, 6).map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/people/${contact.id}`)}>
                  <Avatar src={contact.avatar} name={contact.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    {contact.role && <p className="text-[11px] text-muted-foreground truncate">{contact.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>

      <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={project} onSaved={load} />
    </div>
  );
}