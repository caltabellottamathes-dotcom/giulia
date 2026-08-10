import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Row, Empty, SectionLabel, ActionBtn } from "./previewParts";
import { Check } from "lucide-react";

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
        <Stat label="Open" value={tasks.length} accent="hsl(var(--charcoal))" />
      </div>
      <SectionLabel>Focus · volgorde op prioriteit</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : ordered.length ? (
        <div className="space-y-2">
          {ordered.map((t) => (
            <Row
              key={t.id}
              title={t.title}
              sub={t.deadline ? `Uiterlijk ${new Date(t.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : undefined}
              onClick={onOpen}
              accent={PRIORITY_COLOR[t.priority] || "hsl(var(--smoke))"}
              action={<ActionBtn icon={Check} label="Afronden" tone="olive" onClick={() => complete(t)} />}
            />
          ))}
        </div>
      ) : (
        <Empty text="Niets open — alles gerond" />
      )}
    </div>
  );
}