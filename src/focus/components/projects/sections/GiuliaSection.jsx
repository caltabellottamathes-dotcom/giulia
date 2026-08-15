import React, { useState, useEffect } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import PhotoCard from "@/focus/components/projects/PhotoCard";
import EmptyState from "@/focus/components/projects/EmptyState";
import { IMAGES } from "@/lib/images";
import { base44 } from "@/api/base44Client";
import { isTaskDone, taskStatusOptions } from "@/lib/projectStatus";
import { parseTasksFromText } from "@/lib/projectEngine";
import { cn } from "@/lib/utils";
import { Bot, Plus, CheckCircle2, Circle, Clock, Send } from "lucide-react";

const QUICK = [
  "Plan een opvolgmoment deze week",
  "Maak een samenvatting van de voortgang",
  "Herinner me aan de deadline",
  "Bereid de volgende afspraak voor",
];

/** Giulia — everything Giulia did for this project + a fast way to delegate. */
export default function GiuliaSection({ project, reload }) {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [giuliaTasks, setGiuliaTasks] = useState([]);

  const load = async () => {
    const all = await base44.entities.Task.list();
    setGiuliaTasks(all.filter((t) =>
      t.project_id === project.id &&
      ((t.agent_source || "").toLowerCase().includes("giulia") || (t.context || "").toLowerCase().includes("giulia"))
    ));
  };
  useEffect(() => { load(); }, [project.id]);

  const done = giuliaTasks.filter(isTaskDone);
  const open = giuliaTasks.filter((t) => !isTaskDone(t));

  const delegate = async () => {
    const parsed = parseTasksFromText(text);
    if (!parsed.length) return;
    setAdding(true);
    try {
      await base44.entities.Task.bulkCreate(parsed.map((title) => ({
        title, project_id: project.id, status: "gepland",
        context: "Toegevoegd door Giulia · Acties", agent_source: "Giulia",
      })));
      setText("");
      load();
      if (reload) reload();
    } finally {
      setAdding(false);
    }
  };

  const setStatus = async (task, status) => {
    await base44.entities.Task.update(task.id, { status });
    load();
    if (reload) reload();
  };

  return (
    <div className="space-y-4">
      <PhotoCard src={IMAGES.giuliaConcierge} stripHeight="h-24">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-olive/15 ring-1 ring-olive/25 flex items-center justify-center -mt-8 shrink-0">
            <Bot className="h-5 w-5 text-olive" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-display font-bold leading-none">Giulia</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Delegeer werk en volg wat Giulia voor dit project doet.</p>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-2xl font-display font-bold tabular-nums leading-none">{done.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Gedaan</p>
          </div>
        </div>
      </PhotoCard>

      {/* Delegate */}
      <GlassPanel level={3} className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Send className="h-4 w-4 text-olive" />
          <h3 className="text-sm font-display font-semibold">Delegeer aan Giulia</h3>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Beschrijf wat Giulia moet oppakken. Zij splitst het in aparte taken."
          className="w-full text-sm bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-olive leading-relaxed"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {QUICK.map((q) => (
            <button key={q} onClick={() => setText(q)} className="text-[11px] glass-1 rounded-full px-3 py-1 text-muted-foreground hover:text-foreground transition">
              {q}
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <GlassButton variant="primary" size="sm" onClick={delegate} disabled={adding || !text.trim()}>
            <Plus className="h-3.5 w-3.5" /> {adding ? "Toevoegen…" : "Delegeer"}
          </GlassButton>
        </div>
      </GlassPanel>

      {/* Lopend + Gedaan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-powder" />
            <h3 className="text-sm font-display font-semibold">Lopend voor Giulia</h3>
            <span className="text-xs text-muted-foreground tabular-nums ml-auto">{open.length}</span>
          </div>
          {open.length ? (
            <div className="space-y-2">
              {open.map((t) => (
                <div key={t.id} className="group flex items-center gap-3 rounded-xl bg-foreground/[0.02] p-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-powder shrink-0" />
                  <span className="text-sm flex-1">{t.title}</span>
                  <select
                    value={t.status}
                    onChange={(e) => setStatus(t, e.target.value)}
                    className="text-[10px] uppercase tracking-wider bg-transparent border border-border/40 rounded-lg px-1.5 py-0.5 outline-none cursor-pointer shrink-0"
                  >
                    {taskStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => setStatus(t, "klaar")} className="text-[11px] text-olive hover:font-medium transition shrink-0">Klaar</button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Circle} title="Alles gedaan" hint="Geen open taken van Giulia. Delegeer nieuw werk bovenaan." />
          )}
        </GlassPanel>

        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-olive" />
            <h3 className="text-sm font-display font-semibold">Gedaan door Giulia</h3>
            <span className="text-xs text-muted-foreground tabular-nums ml-auto">{done.length}</span>
          </div>
          {done.length ? (
            <div className="space-y-2">
              {done.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl bg-foreground/[0.02] p-3">
                  <CheckCircle2 className="h-4 w-4 text-olive shrink-0" />
                  <span className="text-sm line-through text-muted-foreground flex-1">{t.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="Nog niets afgerond" hint="Gemaakte Giulia-taken verschijnen hier zodra ze klaar zijn." />
          )}
        </GlassPanel>
      </div>
    </div>
  );
}