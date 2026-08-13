import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Row, Empty, SectionLabel, ActionBtn, HeroStat, MiniBars, RingMini } from "./previewParts";
import { Check, Hourglass, Bot, Trash2, Plus } from "lucide-react";

const PRIORITY_COLOR = {
  high: "hsl(var(--destructive))",
  medium: "hsl(var(--sand))",
  low: "hsl(var(--smoke))",
};

const CATS = [
  { key: "focus", label: "Focus" },
  { key: "today", label: "Vandaag" },
  { key: "upcoming", label: "Later" },
  { key: "overdue", label: "Te laat" },
  { key: "waiting", label: "Wacht" },
  { key: "delegated", label: "Giulia" },
];

export default function TasksPreview({ onOpen }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("focus");
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    try {
      const data = await base44.entities.Task.filter(
        { status: { $in: ["today", "upcoming", "overdue", "waiting", "delegated", "todo", "in_progress"] } },
        "deadline",
        50
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
  const quickAdd = async () => {
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle("");
    try {
      const t = await base44.entities.Task.create({ title, status: "today", priority: "medium" });
      setTasks((prev) => [t, ...prev]);
    } catch (e) { /* ignore */ }
  };

  const today = tasks.filter((t) => t.status === "today");
  const overdue = tasks.filter((t) => t.status === "overdue");
  const upcoming = tasks.filter((t) => t.status === "upcoming");
  const waiting = tasks.filter((t) => t.status === "waiting");
  const delegated = tasks.filter((t) => t.status === "delegated");
  const focus = [...overdue, ...today];

  const byCat = {
    focus, today, upcoming, overdue, waiting, delegated,
  };
  const visible = (byCat[cat] || []).slice(0, 8);
  const doneToday = 0; // completed tasks are filtered out of the query — placeholder ring shows open-load instead
  const openLoad = Math.min(100, tasks.length ? Math.round((focus.length / Math.max(tasks.length, 1)) * 100) : 0);

  return (
    <div className="space-y-4">
      <HeroStat
        value={focus.length}
        label="Focus vandaag"
        accent="hsl(var(--sand))"
        sub={`${tasks.length} open in totaal · ${overdue.length} te laat · ${waiting.length} wacht`}
        visual={
          <div className="flex items-center gap-4">
            <MiniBars
              height={56}
              data={[
                { value: Math.max(overdue.length, 1), color: "hsl(var(--destructive))" },
                { value: Math.max(today.length, 1), color: "hsl(var(--sand))" },
                { value: Math.max(upcoming.length, 1), color: "hsl(var(--blue-grey))" },
                { value: Math.max(waiting.length, 1), color: "hsl(var(--smoke))" },
              ]}
            />
            <RingMini value={openLoad} accent="hsl(var(--sand))" size={56} />
          </div>
        }
      />

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATS.map((c) => {
          const count = byCat[c.key]?.length || 0;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition ${cat === c.key ? "bg-ivory text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`}
            >
              {c.label}{count > 0 ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && quickAdd()}
          placeholder="Snel een taak toevoegen…"
          className="flex-1 rounded-xl glass-card-2 px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
        />
        <ActionBtn icon={Plus} label="Toevoegen" tone="olive" onClick={quickAdd} />
      </div>

      <SectionLabel>{CATS.find((c) => c.key === cat)?.label}</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : visible.length ? (
        <div className="space-y-2">
          {visible.map((t) => (
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
        <Empty text="Niets in deze categorie" />
      )}
    </div>
  );
}