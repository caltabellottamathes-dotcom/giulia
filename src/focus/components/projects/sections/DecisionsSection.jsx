import React, { useState, useEffect } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import PanelForm from "@/system/components/glass/PanelForm";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Gavel } from "lucide-react";
import EmptyState from "@/focus/components/projects/EmptyState";

/** Decisions — historical record of why choices were made. */
export default function DecisionsSection({ project }) {
  const [decisions, setDecisions] = useState([]);
  const [panel, setPanel] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", date: "" });

  const load = async () => {
    const all = await base44.entities.Decision.list();
    setDecisions(all.filter((d) => d.project_id === project.id).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
  };
  useEffect(() => { load(); }, [project.id]);

  const openNew = () => { setForm({ title: "", description: "", date: "" }); setPanel("new"); };
  const openEdit = (d) => { setForm({ title: d.title, description: d.description || "", date: d.date ? String(d.date).slice(0, 10) : "" }); setPanel(d); };

  const save = async () => {
    if (!form.title.trim()) return;
    const payload = { ...form, date: form.date || null, project_id: project.id };
    if (panel === "new") await base44.entities.Decision.create(payload);
    else await base44.entities.Decision.update(panel.id, payload);
    setPanel(null);
    load();
  };
  const del = async (d) => { if (window.confirm("Beslissing verwijderen?")) { await base44.entities.Decision.delete(d.id); load(); } };

  const field = "w-full bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-olive";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold">Beslissingen</h2>
        <GlassButton variant="glass" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Nieuwe beslissing</GlassButton>
      </div>

      <div className="space-y-3">
        {decisions.map((d) => (
          <div key={d.id} className="glass rounded-2xl p-5 group">
            <div className="flex items-start gap-3">
              <Gavel className="h-4 w-4 text-olive mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-display font-semibold">{d.title}</h3>
                {d.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{d.description}</p>}
                {d.date && <p className="text-[11px] text-muted-foreground mt-2">Datum: {new Date(d.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</p>}
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(d)} className="text-[11px] text-muted-foreground hover:text-foreground">Bewerk</button>
                <button onClick={() => del(d)} className="text-[11px] text-muted-foreground hover:text-red-500">Verwijder</button>
              </div>
            </div>
          </div>
        ))}
        {decisions.length === 0 && (
          <EmptyState
            icon={Gavel}
            title="Nog geen beslissingen vastgelegd"
            hint="Waarom werd een keuze gemaakt? Houd de achterliggende redenen bij als projectgeheugen."
            action={<GlassButton variant="glass" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Nieuwe beslissing</GlassButton>}
          />
        )}
      </div>

      <PanelForm
        open={!!panel}
        onClose={() => setPanel(null)}
        eyebrow="Beslissing"
        title={panel === "new" ? "Nieuwe beslissing" : "Beslissing bewerken"}
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
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Titel</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} autoFocus />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Beschrijving</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={field + " resize-none"} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Datum</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} />
          </div>
        </div>
      </PanelForm>
    </div>
  );
}