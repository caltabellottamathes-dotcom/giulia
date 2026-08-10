import React, { useState, useEffect } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import GlassButton from "@/components/glass/GlassButton";
import ImageInput from "@/components/glass/ImageInput";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Pencil, Check } from "lucide-react";

const STATUSES = [
  { v: "planning", l: "Planning" },
  { v: "in_progress", l: "In progress" },
  { v: "waiting", l: "Wachtend" },
  { v: "completed", l: "Voltooid" },
  { v: "archived", l: "Gearchiveerd" },
];

const TASK_STATUS = [
  { v: "today", l: "Vandaag" },
  { v: "upcoming", l: "Aankomend" },
  { v: "overdue", l: "Te laat" },
  { v: "waiting", l: "Wachtend" },
  { v: "completed", l: "Voltooid" },
];

const EMPTY = { title: "", description: "", category: "", status: "planning", progress: 0, deadline: "", next_milestone: "", image: "", color: "" };

/**
 * ProjectEditorPanel — large, clear side-glass editor for a project.
 * Handles both create (project=null) and edit (project=obj). After creating,
 * switches to edit mode so tasks can be added immediately.
 */
export default function ProjectEditorPanel({ open, onClose, project, onSaved }) {
  const { toast } = useToast();
  const [id, setId] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskDraft, setEditTaskDraft] = useState({});

  useEffect(() => {
    if (!open) return;
    if (project) {
      setId(project.id);
      setDraft({
        title: project.title || "", description: project.description || "",
        category: project.category || "", status: project.status || "planning",
        progress: project.progress || 0, deadline: project.deadline || "",
        next_milestone: project.next_milestone || "", image: project.image || "",
        color: project.color || "",
      });
      loadTasks(project.id);
    } else {
      setId(null);
      setDraft(EMPTY);
      setTasks([]);
    }
    setNewTask("");
    setEditTaskId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  const loadTasks = async (pid) => {
    if (!pid) { setTasks([]); return; }
    setLoadingTasks(true);
    try {
      const all = await base44.entities.Task.list();
      setTasks(all.filter((t) => t.project_id === pid));
    } catch (e) { /* ignore */ } finally { setLoadingTasks(false); }
  };

  const saveProject = async () => {
    if (!draft.title.trim()) { toast({ title: "Vul een titel in" }); return; }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        title: draft.title.trim(),
        progress: Number(draft.progress) || 0,
        deadline: draft.deadline || undefined,
      };
      let saved;
      if (id) {
        saved = await base44.entities.Project.update(id, payload);
        toast({ title: "Opgeslagen" });
      } else {
        saved = await base44.entities.Project.create({ ...payload, health: "good" });
        setId(saved.id);
        toast({ title: "Project aangemaakt" });
      }
      setDraft((d) => ({ ...d, ...saved }));
      onSaved?.(saved, id ? "update" : "create");
    } catch (e) {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const addTask = async () => {
    if (!newTask.trim() || !id) return;
    try {
      await base44.entities.Task.create({ title: newTask.trim(), project_id: id, status: "today", priority: "medium" });
      setNewTask("");
      loadTasks(id);
    } catch (e) { toast({ title: "Taak toevoegen mislukt", variant: "destructive" }); }
  };
  const startEditTask = (t) => { setEditTaskId(t.id); setEditTaskDraft({ title: t.title, priority: t.priority || "medium", status: t.status || "today", deadline: t.deadline || "" }); };
  const saveEditTask = async () => {
    if (!editTaskId) return;
    await base44.entities.Task.update(editTaskId, { ...editTaskDraft, deadline: editTaskDraft.deadline || undefined });
    setEditTaskId(null); loadTasks(id);
  };
  const delTask = async (t) => { if (!window.confirm("Taak verwijderen?")) return; await base44.entities.Task.delete(t.id); loadTasks(id); };
  const toggleTask = async (t) => { await base44.entities.Task.update(t.id, { status: t.status === "completed" ? "today" : "completed" }); loadTasks(id); };

  const isNew = !id;

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={4} width={860}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="shrink-0 px-7 lg:px-9 pt-7 lg:pt-8 pb-5 border-b border-border/40">
          <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/45 font-semibold mb-1.5">{isNew ? "Nieuw project" : "Project bewerken"}</p>
          <h2 className="text-2xl font-display font-semibold tracking-tight truncate">{draft.title || (isNew ? "Naamloos project" : "Project")}</h2>
          {draft.category && <p className="text-xs text-muted-foreground mt-1 truncate">{draft.category}</p>}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-7 lg:px-9 py-7 space-y-8">
          {/* Details */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none" placeholder="Projectnaam" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Beschrijving</label>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none min-h-[90px] resize-none" placeholder="Wat houdt dit project in?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categorie</label>
                  <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</label>
                  <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none">
                    {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                  <span>Voortgang</span><span className="text-foreground font-semibold">{draft.progress || 0}%</span>
                </label>
                <input type="range" min="0" max="100" value={draft.progress || 0} onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })} className="w-full mt-3 accent-olive" />
                <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden mt-2">
                  <div className="h-full bg-olive/70 rounded-full transition-all" style={{ width: `${draft.progress || 0}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deadline</label>
                  <input type="date" value={draft.deadline || ""} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Volgende milestone</label>
                  <input value={draft.next_milestone} onChange={(e) => setDraft({ ...draft, next_milestone: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                </div>
              </div>
              <ImageInput label="Cover-foto" value={draft.image || ""} onChange={(url) => setDraft({ ...draft, image: url })} />
            </div>
          </section>

          {/* Tasks */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50 mb-4">Taken {id ? `(${tasks.length})` : ""}</h3>
            {!id ? (
              <div className="glass-1 rounded-2xl p-5 text-center">
                <p className="text-sm text-muted-foreground">Maak eerst het project aan om taken toe te voegen.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Taak toevoegen…" className="flex-1 glass-1 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                  <GlassButton variant="primary" size="md" onClick={addTask}><Plus className="h-4 w-4" /> Toevoegen</GlassButton>
                </div>
                <div className="space-y-2 mt-3">
                  {loadingTasks && [0, 1, 2].map((i) => <div key={i} className="h-12 rounded-xl shimmer" />)}
                  {!loadingTasks && tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground px-2 py-4">Nog geen taken. Voeg de eerste toe boven.</p>
                  )}
                  {!loadingTasks && tasks.map((t) => (
                    <div key={t.id} className="rounded-2xl glass-1 p-3">
                      {editTaskId === t.id ? (
                        <div className="space-y-3">
                          <input value={editTaskDraft.title} onChange={(e) => setEditTaskDraft({ ...editTaskDraft, title: e.target.value })} className="w-full glass-1 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                          <div className="grid grid-cols-3 gap-2">
                            <select value={editTaskDraft.priority} onChange={(e) => setEditTaskDraft({ ...editTaskDraft, priority: e.target.value })} className="glass-1 rounded-lg px-2 py-2 text-xs focus:outline-none">
                              <option value="low">Laag</option><option value="medium">Gemiddeld</option><option value="high">Hoog</option>
                            </select>
                            <select value={editTaskDraft.status} onChange={(e) => setEditTaskDraft({ ...editTaskDraft, status: e.target.value })} className="glass-1 rounded-lg px-2 py-2 text-xs focus:outline-none">
                              {TASK_STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                            </select>
                            <input type="date" value={editTaskDraft.deadline || ""} onChange={(e) => setEditTaskDraft({ ...editTaskDraft, deadline: e.target.value })} className="glass-1 rounded-lg px-2 py-2 text-xs focus:outline-none" />
                          </div>
                          <div className="flex gap-2">
                            <GlassButton variant="primary" size="sm" onClick={saveEditTask}><Check className="h-3.5 w-3.5" /> Opslaan</GlassButton>
                            <GlassButton variant="ghost" size="sm" onClick={() => setEditTaskId(null)}>Annuleer</GlassButton>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleTask(t)} className={"h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center " + (t.status === "completed" ? "bg-olive border-olive" : "border-border/80 hover:border-olive")}>
                            {t.status === "completed" && <Check className="h-3 w-3 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={"text-sm font-medium " + (t.status === "completed" ? "line-through text-muted-foreground" : "")}>{t.title}</p>
                            <p className="text-[11px] text-muted-foreground capitalize">{t.priority || "medium"} · {(t.status || "today").replace(/_/g, " ")}{t.deadline ? ` · ${new Date(t.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}</p>
                          </div>
                          <button onClick={() => startEditTask(t)} className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition shrink-0"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => delTask(t)} className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-destructive transition shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-7 lg:px-9 py-5 border-t border-border/40 flex items-center gap-2">
          <GlassButton variant="primary" size="md" className="flex-1" onClick={saveProject} disabled={saving}>
            {saving ? "Opslaan…" : isNew ? "Maak project aan" : "Wijzigingen opslaan"}
          </GlassButton>
          <GlassButton variant="outline" size="md" onClick={onClose}>Sluiten</GlassButton>
        </div>
      </div>
    </FloatingPanel>
  );
}