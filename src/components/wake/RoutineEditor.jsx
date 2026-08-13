import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2 } from "lucide-react";

export default function RoutineEditor({ steps, onReload }) {
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("routine");

  const add = async () => {
    if (!title.trim()) return;
    await base44.entities.MorningRoutineStep.create({ title: title.trim(), phase, order: steps.length, enabled: true, optional: false });
    setTitle("");
    onReload();
  };

  const toggle = async (s) => {
    await base44.entities.MorningRoutineStep.update(s.id, { enabled: s.enabled === false });
    onReload();
  };

  const remove = async (s) => {
    await base44.entities.MorningRoutineStep.delete(s.id);
    onReload();
  };

  const grouped = {
    getup: steps.filter((s) => s.phase === "getup"),
    routine: steps.filter((s) => s.phase === "routine"),
  };

  return (
    <div className="space-y-5">
      {["getup", "routine"].map((p) => (
        <div key={p}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 mb-2 font-medium">
            {p === "getup" ? "Getting up" : "Morning routine"}
          </p>
          <div className="space-y-1.5">
            {grouped[p].map((s) => (
              <div key={s.id} className="flex items-center gap-2 glass-1 rounded-xl px-3 py-2">
                <button onClick={() => toggle(s)} className={`h-4 w-4 rounded-full border shrink-0 ${s.enabled !== false ? "bg-olive border-olive" : "border-ivory/30"}`} />
                <span className={`flex-1 text-sm ${s.enabled !== false ? "text-ivory" : "text-ivory/40"}`}>{s.title}</span>
                <button onClick={() => remove(s)} className="text-ivory/40 hover:text-ivory transition shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {grouped[p].length === 0 && <p className="text-xs text-ivory/40 px-3 py-1">No steps yet.</p>}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a step…"
          className="flex-1 bg-ivory/5 border border-ivory/15 rounded-xl px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-olive/50"
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <select value={phase} onChange={(e) => setPhase(e.target.value)} className="bg-ivory/5 border border-ivory/15 rounded-xl px-2 text-sm text-ivory focus:outline-none">
          <option value="getup" className="bg-charcoal">Get up</option>
          <option value="routine" className="bg-charcoal">Routine</option>
        </select>
        <button onClick={add} className="rounded-xl bg-olive text-ivory px-3 inline-flex items-center justify-center">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}