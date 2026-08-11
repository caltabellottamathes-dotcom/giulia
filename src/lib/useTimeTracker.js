import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useTimeTracker — shared timer + urenregistratie logic for the TimeTracker
 * widget, onderdeelpaneel and pagina. Selects a task, runs start/pauze/stop,
 * and persists a TimeEntry on stop (linked to the task's project).
 */
export function useTimeTracker() {
  const [tasks, setTasks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [accumulated, setAccumulated] = useState(0); // seconds
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    const [t, e] = await Promise.all([
      base44.entities.Task.list("title").catch(() => []),
      base44.entities.TimeEntry.list("-end_time", 200).catch(() => []),
    ]);
    setTasks(t || []);
    setEntries(e || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, [running]);

  const elapsed = accumulated + (running && startedAt ? (Date.now() - startedAt) / 1000 : 0);

  const start = useCallback(() => {
    if (!taskId) return false;
    setAccumulated(0);
    setStartedAt(Date.now());
    setRunning(true);
    setPaused(false);
    return true;
  }, [taskId]);

  const pause = useCallback(() => {
    if (running && startedAt) {
      setAccumulated((a) => a + (Date.now() - startedAt) / 1000);
      setRunning(false);
      setPaused(true);
    }
  }, [running, startedAt]);

  const resume = useCallback(() => {
    setStartedAt(Date.now());
    setRunning(true);
    setPaused(false);
  }, []);

  const stop = useCallback(async () => {
    if (!taskId) return;
    const total = accumulated + (running && startedAt ? (Date.now() - startedAt) / 1000 : 0);
    if (total > 1) {
      const task = tasks.find((t) => t.id === taskId);
      const now = new Date();
      const startTime = new Date(now.getTime() - total * 1000);
      try {
        await base44.entities.TimeEntry.create({
          task_id: taskId,
          project_id: task?.project_id || "",
          task_title: task?.title || "",
          project_title: "",
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          duration_minutes: Math.max(1, Math.round(total / 60)),
          status: "stopped",
        });
        await load();
      } catch (e) { /* ignore */ }
    }
    setRunning(false);
    setPaused(false);
    setStartedAt(null);
    setAccumulated(0);
  }, [taskId, accumulated, running, startedAt, tasks, load]);

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todayMin = entries
    .filter((e) => (e.end_time || "").slice(0, 10) === todayStr)
    .reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekMin = entries
    .filter((e) => new Date(e.end_time || e.start_time || 0) >= weekAgo)
    .reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const perProject = {};
  entries.forEach((e) => {
    if (e.project_id) perProject[e.project_id] = (perProject[e.project_id] || 0) + (e.duration_minutes || 0);
  });

  return {
    tasks, entries, taskId, setTaskId,
    running, paused, elapsed,
    start, pause, resume, stop,
    todayMin, weekMin, perProject,
  };
}

export function formatDuration(sec) {
  const s = Math.floor(sec || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function formatMinutes(min) {
  const m = Math.round(min || 0);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}u ${mm}m` : `${mm}m`;
}