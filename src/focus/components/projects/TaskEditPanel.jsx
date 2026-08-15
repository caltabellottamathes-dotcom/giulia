import React, { useState, useEffect } from "react";
import PanelForm from "@/system/components/glass/PanelForm";
import { base44 } from "@/api/base44Client";
import { taskStatusOptions } from "@/lib/projectStatus";
import { Trash2 } from "lucide-react";

const priorityOptions = [
  { value: "low", label: "Laag" },
  { value: "medium", label: "Gemiddeld" },
  { value: "high", label: "Hoog" },
];

const empty = { title: "", description: "", status: "gepland", priority: "medium", deadline: "", context: "" };

/** Panel for creating or editing a single task. */
export default function TaskEditPanel({ open, onClose, task, context, projectId, onSaved }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "gepland",
        priority: task.priority || "medium",
        deadline: task.deadline ? String(task.deadline).slice(0, 10) : "",
        context: task.context || context || "",
      });
    } else {
      setForm({ ...empty, context: context || "" });
    }
  }, [task, context, open]);

  const save = async () => {
    if (!form.title.trim()) return;
    const payload = { ...form, deadline: form.deadline || null };
    if (task) await base44.entities.Task.update(task.id, payload);
    else await base44.entities.Task.create({ ...payload, project_id: projectId });
    onSaved?.();
    onClose?.();
  };

  const del = async () => {
    if (task && window.confirm("Taak verwijderen?")) {
      await base44.entities.Task.delete(task.id);
      onSaved?.();
      onClose?.();
    }
  };

  const field = "w-full bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-olive";

  return (
    <PanelForm
      open={open}
      onClose={onClose}
      eyebrow="Taak"
      title={task ? "Taak bewerken" : "Nieuwe taak"}
      width={460}
      footer={
        <div className="flex items-center gap-2">
          {task && (
            <button onClick={del} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition">
              <Trash2 className="h-4 w-4" /> Verwijder
            </button>
          )}
          <button onClick={onClose} className="ml-auto px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Annuleer</button>
          <button onClick={save} className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-xl hover:bg-foreground/90 transition">Opslaan</button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Titel</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} autoFocus />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Context (Onderdeel · Subonderdeel)</label>
          <input
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            placeholder="01.1 — GIULIA OS · Concept & strategie"
            className={field}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={field}>
              {taskStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Prioriteit</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={field}>
              {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Deadline</label>
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={field} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Beschrijving</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={field + " resize-none"} />
        </div>
      </div>
    </PanelForm>
  );
}