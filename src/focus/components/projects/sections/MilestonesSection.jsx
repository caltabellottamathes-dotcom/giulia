import React, { useState, useEffect } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import PanelForm from "@/system/components/glass/PanelForm";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/focus/components/projects/EmptyState";

const milestoneStatus = [
  { value: "open", label: "Open" },
  { value: "done", label: "Bereikt" },
  { value: "planning", label: "Gepland" },
  { value: "waiting", label: "Wacht" },
];

/** Milestones — distinct project moments with CRUD. */
export default function MilestonesSection({ project, themes = [] }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null); // null | "new" | milestone
  const [form, setForm] = useState({ name: "", description: "", date: "", status: "open" });

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.Milestone.list();
    setMilestones(all.filter((m) => m.project_id === project.id).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)));
    setLoading(false);
  };
  useEffect(() => { load(); }, [project.id]);

  const openNew = () => { setForm({ name: "", description: "", date: "", status: "open" }); setPanel("new"); };
  const openEdit = (m) => { setForm({ name: m.name, description: m.description || "", date: m.date ? String(m.date).slice(0, 10) : "", status: m.status || "open" }); setPanel(m); };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = { ...form, date: form.date || null, project_id: project.id };
    if (panel === "new") await base44.entities.Milestone.create(payload);
    else await base44.entities.Milestone.update(panel.id, payload);
    setPanel(null);
    load();
  };
  const del = async (m) => { if (window.confirm("Milestone verwijderen?")) { await base44.entities.Milestone.delete(m.id); load(); } };
  const toggleDone = async (m) => { await base44.entities.Milestone.update(m.id, { status: m.status === "done" ? "open" : "done" }); load(); };

  const themeMap = new Map((themes || []).map((t) => [t.id, t]));
  const groups = groupByTheme(milestones, themeMap);

  const field = "w-full bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-olive";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold">Milestones</h2>
        <GlassButton variant="glass" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Nieuwe milestone</GlassButton>
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.key}>
            {g.label && (
              <div className="flex items-center gap-2 mb-2.5">
                <span className="h-1 w-1 rounded-full bg-olive" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{g.label}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {g.items.map((m) => {
                const done = m.status === "done";
                return (
                  <div key={m.id} className="glass rounded-2xl p-5 group">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleDone(m)} className="mt-0.5 shrink-0">
                        {done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-muted-foreground/50" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className={cn("text-sm font-display font-semibold", done && "line-through text-muted-foreground")}>{m.name}</h3>
                        {m.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.description}</p>}
                        <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                          {m.date && <span>{new Date(m.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</span>}
                          <span className="uppercase tracking-wider">{milestoneStatus.find((s) => s.value === m.status)?.label || "Open"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEdit(m)} className="text-[11px] text-muted-foreground hover:text-foreground">Bewerk</button>
                        <button onClick={() => del(m)} className="text-[11px] text-muted-foreground hover:text-red-500">Verwijder</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {!loading && milestones.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="Nog geen milestones"
            hint="Markeer de belangrijke momenten in dit project — een oplevering, indiening of afspraak."
            action={<GlassButton variant="glass" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Nieuwe milestone</GlassButton>}
          />
        )}
      </div>

      <PanelForm
        open={!!panel}
        onClose={() => setPanel(null)}
        eyebrow="Milestone"
        title={panel === "new" ? "Nieuwe milestone" : "Milestone bewerken"}
        width={460}
        footer={
          <div className="flex gap-2">
            <button onClick={() => setPanel(null)} className="ml-auto px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Annuleer</button>
            <button onClick={save} className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-xl hover:bg-foreground/90 transition">Opslaan</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Naam</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} autoFocus />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Beschrijving</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={field + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Datum</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={field}>
                {milestoneStatus.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </PanelForm>
    </div>
  );
}

function groupByTheme(items, themeMap) {
  if (!items.length) return [];
  const hasThemed = items.some((i) => i.theme_id && themeMap.has(i.theme_id));
  if (!hasThemed) return [{ key: "_algemeen", label: "", items }];
  const groups = [];
  themeMap.forEach((t) => {
    const its = items.filter((i) => i.theme_id === t.id);
    if (its.length) groups.push({ key: `theme:${t.id}`, label: t.title, items: its });
  });
  const unthemed = items.filter((i) => !i.theme_id || !themeMap.has(i.theme_id));
  if (unthemed.length) groups.push({ key: "_algemeen", label: "Algemeen", items: unthemed });
  return groups;
}