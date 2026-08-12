import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import PanelForm from "@/components/glass/PanelForm";
import TaskAgentRunner from "@/components/tasks/TaskAgentRunner";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Plus, Sparkles, CheckSquare, Clock, Pencil, Trash2, CheckCheck, Hourglass, Bot } from "lucide-react";

const categories = ["today", "upcoming", "overdue", "waiting", "delegated", "completed"];
const categoryLabel = {
  today: "Today", upcoming: "Upcoming", overdue: "Overdue",
  waiting: "Waiting", delegated: "Delegated", completed: "Completed",
};

const priorityVariantMap = { high: "urgent", medium: "waiting", low: "muted" };

export default function Tasks() {
  const [category, setCategory] = useState("today");
  const { data: tasks, loading, reload } = useEntityList("Task", { realtime: true });
  const { data: projects } = useEntityList("Project");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editTask, setEditTask] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const projTitle = (id) => projects.find((p) => p.id === id)?.title;
  const filtered = tasks.filter((t) => t.status === category);

  // Deep-link — chat-notificaties kunnen naar /tasks?open=<id> linken.
  useEffect(() => {
    const openId = new URLSearchParams(window.location.search).get("open");
    if (!openId || !tasks.length) return;
    const t = tasks.find((x) => x.id === openId);
    if (t) {
      setCategory(t.status);
      startEdit(t);
    }
  }, [tasks]);

  const toggleComplete = async (task) => {
    await base44.entities.Task.update(task.id, {
      status: task.status === "completed" ? "today" : "completed",
    });
    reload();
  };

  const setStatus = async (task, status, extra) => {
    await base44.entities.Task.update(task.id, { status, ...(extra || {}) });
    reload();
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
    await base44.entities.Task.create({ title: newTitle.trim(), status: "today", priority: "medium" });
    setNewTitle("");
    setShowNew(false);
    reload();
  };

  const startEdit = (t) => {
    setEditTask(t);
    setEditDraft({ title: t.title, description: t.description || "", priority: t.priority || "medium", status: t.status, deadline: t.deadline || "" });
  };
  const saveEdit = async () => {
    if (!editTask) return;
    await base44.entities.Task.update(editTask.id, {
      ...editDraft,
      deadline: editDraft.deadline || undefined,
      ...(editDraft.status === "delegated" ? { delegated_to_giulia: true } : {}),
    });
    setEditTask(null);
    reload();
  };
  const delTask = async (t) => {
    await base44.entities.Task.delete(t.id);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="tasks"
        icon={CheckSquare}
        eyebrow="Werk"
        title="Taken"
        subtitle="Jouw taken, elegant beheerd"
        actions={
          <GlassButton variant="primary" size="md" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> Nieuwe taak
          </GlassButton>
        }
      />

      <TaskAgentRunner />

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const count = tasks.filter((t) => t.status === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-2",
                category === cat
                  ? "bg-foreground text-background font-medium"
                  : "glass-1 text-muted-foreground hover:text-foreground"
              )}
            >
              {categoryLabel[cat]}
              {count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px]",
                  category === cat ? "bg-background/20" : "bg-foreground/10"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <GlassPanel level={2} className="p-6">
        <div className="space-y-1">
          {loading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Geen taken in deze categorie</p>
            </div>
          )}
          {filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors group"
            >
              <button
                onClick={() => toggleComplete(task)}
                className={cn(
                  "h-5 w-5 rounded-md border-2 shrink-0 transition-all flex items-center justify-center",
                  task.status === "completed" ? "bg-olive border-olive" : "border-border/80 hover:border-olive"
                )}
              >
                {task.status === "completed" && <CheckSquare className="h-3 w-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEdit(task)}>
                <p className={cn("text-sm font-medium", task.status === "completed" && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                {task.project_id && projTitle(task.project_id) && (
                  <p className="text-xs text-muted-foreground mt-0.5">{projTitle(task.project_id)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.priority && <StatusBadge variant={priorityVariantMap[task.priority]}>{task.priority}</StatusBadge>}
                {task.deadline && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  </span>
                )}
                {task.status === "delegated" && (
                  <StatusBadge variant="draft"><Sparkles className="h-2.5 w-2.5" /> Giulia</StatusBadge>
                )}
                <button onClick={() => setStatus(task, "completed")} title="Gedaan" className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-olive opacity-0 group-hover:opacity-100 transition"><CheckCheck className="h-3.5 w-3.5" /></button>
                <button onClick={() => setStatus(task, "waiting")} title="Wachten" className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition"><Hourglass className="h-3.5 w-3.5" /></button>
                <button onClick={() => setStatus(task, "delegated", { delegated_to_giulia: true })} title="Voor Giulia" className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition"><Bot className="h-3.5 w-3.5" /></button>
                <button onClick={() => startEdit(task)} className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition" aria-label="Bewerk"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => delTask(task)} className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition" aria-label="Verwijder"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <PanelForm
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nieuwe taak"
        eyebrow="Taken"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={createTask}>Maak aan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setShowNew(false)}>Annuleer</GlassButton>
        </>}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTask()}
            className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30"
            placeholder="Wat staat er te doen?"
          />
        </div>
      </PanelForm>

      <PanelForm
        open={!!editTask}
        onClose={() => setEditTask(null)}
        title="Taak bewerken"
        eyebrow="Taken"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={saveEdit}>Opslaan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => { delTask(editTask); setEditTask(null); }}><Trash2 className="h-4 w-4" /> Verwijder</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setEditTask(null)}>Annuleer</GlassButton>
        </>}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
          <input value={editDraft.title || ""} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Meer info</label>
          <textarea value={editDraft.description || ""} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[90px] resize-none" placeholder="Extra details over deze taak" />
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => setEditDraft({ ...editDraft, status: "completed" })}><CheckCheck className="h-3.5 w-3.5" /> Gedaan</GlassButton>
          <GlassButton variant="outline" size="sm" onClick={() => setEditDraft({ ...editDraft, status: "waiting" })}><Hourglass className="h-3.5 w-3.5" /> Wachten</GlassButton>
          <GlassButton variant="outline" size="sm" onClick={() => setEditDraft({ ...editDraft, status: "delegated" })}><Bot className="h-3.5 w-3.5" /> Voor Giulia</GlassButton>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prioriteit</label>
            <select value={editDraft.priority} onChange={(e) => setEditDraft({ ...editDraft, priority: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              <option value="low">Laag</option>
              <option value="medium">Gemiddeld</option>
              <option value="high">Hoog</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</label>
            <select value={editDraft.status} onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {categories.map((c) => <option key={c} value={c}>{categoryLabel[c]}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deadline</label>
          <input type="date" value={editDraft.deadline || ""} onChange={(e) => setEditDraft({ ...editDraft, deadline: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
        </div>
      </PanelForm>
    </div>
  );
}