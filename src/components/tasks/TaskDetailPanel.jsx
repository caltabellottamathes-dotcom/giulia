import React, { useState, useEffect } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import { base44 } from "@/api/base44Client";
import {
  Pencil, Trash2, CheckCheck, Hourglass, Bot, Clock,
  Briefcase, Sparkles, Zap, ListChecks, HelpCircle, Loader2,
} from "lucide-react";

const priorityVariantMap = { high: "urgent", medium: "waiting", low: "muted" };
const energyLabel = { deep: "Diepe focus", shallow: "Lichte focus", quick: "Snel klaar" };

/** TaskDetailPanel — volledige, leesbare weergave van één taak (L03). */
export default function TaskDetailPanel({ task, projectTitle, onClose, onEdit, onComplete, onWaiting, onDelegate, onDelete }) {
  const [explain, setExplain] = useState(null);
  const [explaining, setExplaining] = useState(false);
  useEffect(() => { setExplain(null); setExplaining(false); }, [task?.id]);
  if (!task) return null;
  const isDone = task.status === "completed";

  const legUit = async () => {
    setExplaining(true);
    try {
      const res = await base44.functions.invoke("explainTask", {
        title: task.title,
        description: task.description,
        context: task.context,
        project_title: projectTitle,
      });
      const r = res?.data ?? res;
      setExplain(r?.explanation || "Geen uitleg beschikbaar.");
    } catch {
      setExplain("Giulia kon dit nu niet uitleggen — probeer het straks nog eens.");
    } finally {
      setExplaining(false);
    }
  };

  return (
    <FloatingPanel open={!!task} onClose={onClose} position="right" level={3} width={460}>
      <div className="p-7 lg:p-8 space-y-6">
        <div className="pt-6">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {task.priority && <StatusBadge variant={priorityVariantMap[task.priority]}>{task.priority}</StatusBadge>}
            <StatusBadge variant={isDone ? "completed" : "active"}>{task.status}</StatusBadge>
            {task.delegated_to_giulia && (
              <StatusBadge variant="draft"><Sparkles className="h-2.5 w-2.5" /> Giulia</StatusBadge>
            )}
          </div>
          <h2 className={"text-2xl font-display font-semibold leading-tight" + (isDone ? " line-through text-muted-foreground" : "")}>
            {task.title}
          </h2>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {task.deadline && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
            </span>
          )}
          {projectTitle && (
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> {projectTitle}
            </span>
          )}
          {task.energy_level && (
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> {energyLabel[task.energy_level] || task.energy_level}
            </span>
          )}
          {task.estimated_duration && (
            <span className="inline-flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5" /> {task.estimated_duration} min
            </span>
          )}
        </div>

        {task.description && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Meer info</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{task.description}</p>
          </div>
        )}

        {task.context && (
          <div className="glass-1 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-olive" />
              <p className="text-xs font-medium uppercase tracking-wide text-olive">Context</p>
            </div>
            <p className="text-sm text-muted-foreground">{task.context}</p>
          </div>
        )}

        {task.subtasks?.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Subtaken
            </p>
            <ul className="space-y-1.5">
              {task.subtasks.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          {!explain ? (
            <GlassButton variant="outline" size="sm" onClick={legUit} disabled={explaining}>
              {explaining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HelpCircle className="h-3.5 w-3.5" />}
              {explaining ? "Giulia denkt na…" : "Leg uit"}
            </GlassButton>
          ) : (
            <div className="glass-1 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-olive" />
                <p className="text-xs font-medium uppercase tracking-wide text-olive">Giulia legt uit</p>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{explain}</p>
            </div>
          )}
        </div>

        {task.agent_source && (
          <p className="text-xs text-muted-foreground">Aangemaakt door: {task.agent_source}</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
          <GlassButton variant="primary" size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Bewerken</GlassButton>
          {!isDone && <GlassButton variant="outline" size="sm" onClick={onComplete}><CheckCheck className="h-3.5 w-3.5" /> Gedaan</GlassButton>}
          {task.status !== "waiting" && <GlassButton variant="outline" size="sm" onClick={onWaiting}><Hourglass className="h-3.5 w-3.5" /> Wachten</GlassButton>}
          {task.status !== "delegated" && <GlassButton variant="outline" size="sm" onClick={onDelegate}><Bot className="h-3.5 w-3.5" /> Voor Giulia</GlassButton>}
          <GlassButton variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /> Verwijder</GlassButton>
        </div>
      </div>
    </FloatingPanel>
  );
}