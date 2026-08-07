import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import { mockTasks, mockProjects } from "@/lib/mockData";
import { Plus, Sparkles, CheckSquare, Clock, ArrowRight } from "lucide-react";

const categories = ["Today", "Upcoming", "Overdue", "Waiting", "Delegated to Giulia", "Completed"];

const statusVariantMap = {
  today: "active", upcoming: "waiting", overdue: "urgent",
  waiting: "waiting", delegated: "draft", completed: "completed",
};

const priorityVariantMap = { high: "urgent", medium: "waiting", low: "muted" };

export default function Tasks() {
  const [category, setCategory] = useState("Today");
  const [tasks, setTasks] = useState(mockTasks);

  const filteredTasks = tasks.filter((t) => t.status === category.toLowerCase().replace(" ", "_"));

  const toggleComplete = (id) => {
    setTasks(tasks.map((t) =>
      t.id === id
        ? { ...t, status: t.status === "completed" ? "today" : "completed" }
        : t
    ));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw taken, elegant beheerd</p>
        </div>
        <GlassButton variant="primary" size="md">
          <Plus className="h-4 w-4" /> Nieuwe taak
        </GlassButton>
      </div>

      {/* Giulia suggestion */}
      <GlassPanel level={3} className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-foreground/70" />
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">Giulia stelt voor:</span> Je hebt een overdue taak — "Budget goedkeuring aanvragen".
              Zal ik een herinnering sturen naar Thomas?
            </p>
            <div className="flex gap-2 mt-3">
              <GlassButton variant="primary" size="sm">Stuur herinnering</GlassButton>
              <GlassButton variant="ghost" size="sm">Negeer</GlassButton>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const count = tasks.filter((t) => t.status === cat.toLowerCase().replace(" ", "_")).length;
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
              {cat}
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

      {/* Task list */}
      <GlassPanel level={2} className="p-6">
        <div className="space-y-1">
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Geen taken in deze categorie</p>
            </div>
          )}
          {filteredTasks.map((task) => {
            const project = mockProjects.find((p) => p.id === task.project_id);
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors group"
              >
                <button
                  onClick={() => toggleComplete(task.id)}
                  className={cn(
                    "h-5 w-5 rounded-md border-2 shrink-0 transition-all flex items-center justify-center",
                    task.status === "completed"
                      ? "bg-olive border-olive"
                      : "border-border/80 hover:border-olive"
                  )}
                >
                  {task.status === "completed" && <CheckSquare className="h-3 w-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    task.status === "completed" && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  {project && (
                    <p className="text-xs text-muted-foreground mt-0.5">{project.title}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge variant={priorityVariantMap[task.priority]}>{task.priority}</StatusBadge>
                  {task.deadline && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  {task.status === "delegated" && (
                    <StatusBadge variant="draft">
                      <Sparkles className="h-2.5 w-2.5" /> Giulia
                    </StatusBadge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}