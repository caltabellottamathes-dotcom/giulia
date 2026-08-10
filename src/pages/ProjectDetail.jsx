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
  Calendar, Mail, FileText, Users, Briefcase, HelpCircle, PauseCircle,
} from "lucide-react";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";

// Canonical project-management statuses (Dutch)
const statusMeta = {
  klaar: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500", ring: "border-emerald-500 bg-emerald-500" },
  done: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500", ring: "border-emerald-500 bg-emerald-500" },
  completed: { label: "Klaar", color: "text-emerald-600", dot: "bg-emerald-500", ring: "border-emerald-500 bg-emerald-500" },
  actief: { label: "Actief", color: "text-olive", dot: "bg-olive", ring: "border-olive bg-olive" },
  in_progress: { label: "Actief", color: "text-olive", dot: "bg-olive", ring: "border-olive bg-olive" },
  today: { label: "Vandaag", color: "text-olive", dot: "bg-olive", ring: "border-olive bg-olive" },
  gepland: { label: "Gepland", color: "text-blue-500", dot: "bg-blue-500", ring: "border-blue-500 bg-blue-500" },
  upcoming: { label: "Gepland", color: "text-blue-500", dot: "bg-blue-500", ring: "border-blue-500 bg-blue-500" },
  wacht: { label: "Wacht op", color: "text-amber-500", dot: "bg-amber-500", ring: "border-amber-500 bg-amber-500" },
  waiting: { label: "Wacht op", color: "text-amber-500", dot: "bg-amber-500", ring: "border-amber-500 bg-amber-500" },
  te_specifieren: { label: "Te specificeren", color: "text-foreground/55", dot: "bg-foreground/30", ring: "border-foreground/40 bg-foreground/30" },
  todo: { label: "Te specificeren", color: "text-foreground/55", dot: "bg-foreground/30", ring: "border-foreground/40 bg-foreground/30" },
  gepauzeerd: { label: "Gepauzeerd", color: "text-muted-foreground", dot: "bg-muted-foreground/40", ring: "border-muted-foreground/40 bg-muted-foreground/40" },
  paused: { label: "Gepauzeerd", color: "text-muted-foreground", dot: "bg-muted-foreground/40", ring: "border-muted-foreground/40 bg-muted-foreground/40" },
  overdue: { label: "Te laat", color: "text-red-500", dot: "bg-red-500", ring: "border-red-500 bg-red-500" },
  delegated: { label: "Gedelegeerd", color: "text-purple-500", dot: "bg-purple-500", ring: "border-purple-500 bg-purple-500" },
};

const projectStatusMap = {
  planning: "Planning", in_progress: "Actief", waiting: "Wacht", completed: "Klaar", archived: "Gearchiveerd",
};

const projectStatusVariant = {
  planning: "waiting", in_progress: "active", waiting: "waiting", completed: "completed", archived: "muted",
};

const statusIcon = {
  klaar: CheckCircle2, done: CheckCircle2, completed: CheckCircle2,
  actief: Loader2, in_progress: Loader2, today: Loader2,
  gepland: Clock, upcoming: Clock,
  wacht: AlertCircle, waiting: AlertCircle,
  te_specifieren: HelpCircle, todo: HelpCircle,
  gepauzeerd: PauseCircle, paused: PauseCircle,
  overdue: AlertCircle, delegated: Users,
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
    const next = task.status === "klaar" || task.status === "done" ? "actief" : "klaar";
    await base44.entities.Task.update(task.id, { status: next });
    const allTasks = await base44.entities.Task.list();
    const projTasks = allTasks.filter((t) => t.project_id === id);
    setTasks(projTasks);
    if (projTasks.length) {
      const done = projTasks.filter((t) => t.status === "klaar" || t.status === "done").length;
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

  // Build hierarchy: ONDERDEEL → SUBONDERDEEL → taken
  const hierarchy = {};
  tasks.forEach((t) => {
    const parts = t.context ? t.context.split(" · ") : [];
    const ond = parts[0] || "Overig";
    const sub = parts[1] || ond;
    if (!hierarchy[ond]) hierarchy[ond] = {};
    if (!hierarchy[ond][sub]) hierarchy[ond][sub] = [];
    hierarchy[ond][sub].push(t);
  });
  const onderdelen = Object.keys(hierarchy);

  const isDone = (t) => t.status === "klaar" || t.status === "done" || t.status === "completed";
  const doneCount = tasks.filter(isDone).length;
  const activeCount = tasks.filter((t) => ["actief", "in_progress", "today"].includes(t.status)).length;
  const geplandCount = tasks.filter((t) => ["gepland", "upcoming"].includes(t.status)).length;
  const wachtCount = tasks.filter((t) => ["wacht", "waiting"].includes(t.status)).length;
  const specCount = tasks.filter((t) => ["te_specifieren", "todo"].includes(t.status)).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : (project.progress || 0);

  const stats = [
    { label: "Taken", value: tasks.length, icon: Briefcase, tone: "text-foreground" },
    { label: "Klaar", value: doneCount, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Actief", value: activeCount, icon: Loader2, tone: "text-olive" },
    { label: "Gepland", value: geplandCount, icon: Clock, tone: "text-blue-500" },
    { label: "Wacht", value: wachtCount, icon: AlertCircle, tone: "text-amber-500" },
    { label: "Te spec.", value: specCount, icon: HelpCircle, tone: "text-foreground/55" },
  ];

  const subStatus = (subTasks) => {
    const d = subTasks.filter(isDone).length;
    if (d === subTasks.length) return "klaar";
    const first = subTasks.find((t) => !isDone(t));
    return first ? first.status : "klaar";
  };

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
        <div className="lg:col-span-2 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 flex flex-col">
              <s.icon className={cn("h-4 w-4 mb-3", s.tone)} strokeWidth={1.75} />
              <p className="text-2xl font-display font-bold leading-none">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hierarchy: ONDERDEEL → SUBONDERDEEL → taken */}
      <div className="space-y-8">
        {onderdelen.map((ond) => {
          const ondTasks = Object.values(hierarchy[ond]).flat();
          const ondDone = ondTasks.filter(isDone).length;
          return (
            <div key={ond}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-display font-bold tracking-tight">{ond}</h2>
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-xs text-muted-foreground tabular-nums">{ondDone}/{ondTasks.length} klaar</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(hierarchy[ond]).map(([sub, subTasks]) => {
                  const d = subTasks.filter(isDone).length;
                  const st = subStatus(subTasks);
                  const meta = statusMeta[st] || statusMeta.te_specifieren;
                  const SIcon = statusIcon[st] || HelpCircle;
                  const subProgress = subTasks.length ? Math.round((d / subTasks.length) * 100) : 0;
                  return (
                    <div key={sub} className="glass rounded-2xl p-5">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="text-sm font-display font-semibold pr-1">{sub}</h3>
                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold shrink-0", meta.color)}>
                          <SIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-olive/60 rounded-full transition-all duration-500" style={{ width: `${subProgress}%` }} />
                      </div>
                      <div className="space-y-0.5">
                        {[...subTasks].sort((a, b) => isDone(a) - isDone(b)).map((task) => {
                          const done = isDone(task);
                          const tmeta = statusMeta[task.status] || statusMeta.te_specifieren;
                          return (
                            <button
                              key={task.id}
                              onClick={() => toggleTask(task)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/[0.04] transition text-left"
                            >
                              <span className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition", done ? "border-emerald-500 bg-emerald-500" : "border-border/60")}>
                                {done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <span className={cn("h-1.5 w-1.5 rounded-full", tmeta.dot)} />}
                              </span>
                              <span className={cn("text-sm flex-1 leading-snug", done ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Related: afspraken, emails, bestanden, betrokkenen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-display font-semibold">Afspraken</h3>
            <span className="text-xs text-muted-foreground ml-auto">{events.length}</span>
          </div>
          {events.length === 0 ? <p className="text-xs text-muted-foreground">Geen afspraken gekoppeld.</p> : (
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
          {emails.length === 0 ? <p className="text-xs text-muted-foreground">Geen emails gekoppeld.</p> : (
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
          {documents.length === 0 ? <p className="text-xs text-muted-foreground">Geen bestanden gekoppeld.</p> : (
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
          {contacts.length === 0 ? <p className="text-xs text-muted-foreground">Nog geen contacten.</p> : (
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