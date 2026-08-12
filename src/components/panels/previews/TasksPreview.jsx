import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Row, Empty, SectionLabel, ActionBtn, HeroStat, MiniBars } from "./previewParts";
import { Check, Hourglass, Bot, Trash2 } from "lucide-react";

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
    const unsub = base44.entities.Task?.subscribe?.((ev) => { if (ev?.type) load(); });
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, []);

  const setStatus = async (t, status, extra) => {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    try {
      await base44.entities.Task.update(t.id, { status, ...(extra || {}) });
    } catch (e) {
      load();
    }
  };
  const complete = (t) => setStatus(t, "completed");
  const remove = async (t) => {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    try { await base44.entities.Task.delete(t.id); } catch (e) { load(); }
  };

  const today = tasks.filter((t) => t.status === "today" || t.status === "overdue");
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const upcoming = tasks.filter((t) => t.status === "upcoming").length;
  const waiting = tasks.filter((t) => t.status === "waiting").length;
  const ordered = [...today, ...tasks.filter((t) => !today.includes(t))].slice(0, 6);

  return (
    <div className="space-y-4">
      <HeroStat
        value={today.length}
        label="Focus vandaag"
        accent="hsl(var(--sand))"
        sub={`${tasks.length} open · ${overdue} te laat · ${waiting} wacht`}
        visual={
          <MiniBars
            height={56}
            data={[
              { value: Math.max(overdue, 1), color: "hsl(var(--destructive))" },
              { value: Math.max(today.length - overdue, 1), color: "hsl(var(--sand))" },
              { value: Math.max(upcoming, 1), color: "hsl(var(--blue-grey))" },
              { value: Math.max(waiting, 1), color: "hsl(var(--smoke))" },
            ]}
          />
        }
      />
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
              action={
                <div className="flex items-center gap-1">
                  <ActionBtn icon={Check} label="Afronden" tone="olive" onClick={() => complete(t)} />
                  <ActionBtn icon={Hourglass} label="Wachten" onClick={() => setStatus(t, "waiting")} />
                  <ActionBtn icon={Bot} label="Voor Giulia" onClick={() => setStatus(t, "delegated", { delegated_to_giulia: true })} />
                  <ActionBtn icon={Trash2} label="Verwijder" onClick={() => remove(t)} />
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <Empty text="Niets open — alles gerond" />
      )}
    </div>
  );
}