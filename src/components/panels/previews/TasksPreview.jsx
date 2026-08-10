import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { Check, ArrowUpRight } from "lucide-react";

const PRIORITY_COLOR = {
  high: "hsl(var(--destructive))",
  medium: "hsl(var(--sand))",
  low: "hsl(var(--smoke))",
};

export default function TasksPreview({ onOpen }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await base44.entities.Task.filter(
        { status: { $in: ["today", "upcoming", "overdue", "waiting", "todo", "in_progress"] } },
        "deadline",
        8
      );
      setTasks(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const complete = async (t) => {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    try {
      await base44.entities.Task.update(t.id, { status: "completed" });
    } catch (e) {
      load();
    }
  };

  const today = tasks.filter((t) => t.status === "today" || t.status === "overdue");
  const ordered = [...today, ...tasks.filter((t) => !today.includes(t))].slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Vandaag" value={today.length} accent="hsl(var(--sand))" />
        <Stat label="Open" value={tasks.length} />
      </div>
      <SectionLabel>Focus · volgorde op prioriteit</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : ordered.length ? (
        <div className="space-y-2">
          {ordered.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-2xl px-4 py-3 glass-1">
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: PRIORITY_COLOR[t.priority] || "hsl(var(--smoke))" }}
              />
              <button onClick={onOpen} className="min-w-0 flex-1 text-left group flex items-center gap-1">
                <span className="block text-sm font-medium text-foreground truncate">{t.title}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
              </button>
              <button
                onClick={() => complete(t)}
                className="h-7 w-7 rounded-full glass-1 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition"
                aria-label="Afronden"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="Niets open — alles gerond" />
      )}
    </div>
  );
}