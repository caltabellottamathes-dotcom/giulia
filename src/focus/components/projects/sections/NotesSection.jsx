import React, { useState, useEffect } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import PanelForm from "@/system/components/glass/PanelForm";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, StickyNote } from "lucide-react";
import EmptyState from "@/focus/components/projects/EmptyState";

/** Notes — free-form project notes (thoughts, not decisions). */
export default function NotesSection({ project }) {
  const [notes, setNotes] = useState([]);
  const [panel, setPanel] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const load = async () => {
    const all = await base44.entities.Note.list();
    setNotes(all.filter((n) => n.project_id === project.id));
  };
  useEffect(() => { load(); }, [project.id]);

  const openNew = () => { setForm({ title: "", content: "" }); setPanel("new"); };
  const openEdit = (n) => { setForm({ title: n.title, content: n.content || "" }); setPanel(n); };

  const save = async () => {
    if (!form.title.trim()) return;
    if (panel === "new") await base44.entities.Note.create({ ...form, project_id: project.id });
    else await base44.entities.Note.update(panel.id, form);
    setPanel(null);
    load();
  };
  const del = async (n) => { if (window.confirm("Notitie verwijderen?")) { await base44.entities.Note.delete(n.id); load(); } };

  const field = "w-full bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-olive";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold">Notities</h2>
        <GlassButton variant="glass" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Nieuwe notitie</GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {notes.map((n) => (
          <div key={n.id} className="glass rounded-2xl p-5 group">
            <div className="flex items-start gap-3">
              <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-display font-semibold">{n.title}</h3>
                {n.content && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">{n.content}</p>}
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(n)} className="text-[11px] text-muted-foreground hover:text-foreground">Bewerk</button>
                <button onClick={() => del(n)} className="text-[11px] text-muted-foreground hover:text-red-500">Verwijder</button>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="md:col-span-2">
            <EmptyState
              icon={StickyNote}
              title="Nog geen notities"
              hint="Vast gedachte, een open vraag of context die je niet wilt vergeten? Leg het hier vast."
              action={<GlassButton variant="glass" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Nieuwe notitie</GlassButton>}
            />
          </div>
        )}
      </div>

      <PanelForm
        open={!!panel}
        onClose={() => setPanel(null)}
        eyebrow="Notitie"
        title={panel === "new" ? "Nieuwe notitie" : "Notitie bewerken"}
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
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Inhoud</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className={field + " resize-none"} />
          </div>
        </div>
      </PanelForm>
    </div>
  );
}