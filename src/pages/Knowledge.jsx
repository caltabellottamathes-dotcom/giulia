import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import PanelForm from "@/components/glass/PanelForm";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Search, BookOpen, Plus, Pencil, Trash2 } from "lucide-react";

const categories = ["Research", "Notes", "Insights", "References", "Decisions", "Conversations", "Saved"];
const empty = { title: "", content: "", category: "Notes", source: "", project_id: "" };

function Fields({ d, set, projects }) {
  return (
    <>
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
        <input value={d.title || ""} onChange={(e) => set({ ...d, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categorie</label>
          <select value={d.category} onChange={(e) => set({ ...d, category: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bron</label>
          <input value={d.source || ""} onChange={(e) => set({ ...d, source: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project</label>
        <select value={d.project_id || ""} onChange={(e) => set({ ...d, project_id: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
          <option value="">— geen —</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inhoud</label>
        <textarea value={d.content || ""} onChange={(e) => set({ ...d, content: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[120px] resize-none" />
      </div>
    </>
  );
}

export default function Knowledge() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(empty);
  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const { data: items, loading, reload } = useEntityList("Knowledge");
  const { data: projects } = useEntityList("Project");
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const filtered = items.filter((k) => {
    const matchCat = category === "All" || k.category === category;
    const matchSearch = !search || (k.title || "").toLowerCase().includes(search.toLowerCase()) || (k.content || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const create = async () => {
    if (!draft.title.trim()) return;
    await base44.entities.Knowledge.create({ ...draft, title: draft.title.trim(), project_id: draft.project_id || undefined });
    setDraft(empty); setShowNew(false); reload();
  };
  const startEdit = (k) => { setEditItem(k); setEditDraft({ title: k.title, content: k.content, category: k.category || "Notes", source: k.source || "", project_id: k.project_id || "" }); };
  const saveEdit = async () => {
    if (!editItem) return;
    await base44.entities.Knowledge.update(editItem.id, { ...editDraft, project_id: editDraft.project_id || undefined });
    setEditItem(null); reload();
  };
  const del = async (k) => { if (!window.confirm("Verwijderen?")) return; await base44.entities.Knowledge.delete(k.id); reload(); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="knowledge"
        icon={BookOpen}
        eyebrow="Kennis"
        title="Kennisbank"
        subtitle="Doorzoek de database"
        actions={<GlassButton variant="primary" size="md" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Nieuwe kennis</GlassButton>}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Doorzoek kennis, notities, inzichten..."
          className="w-full glass-2 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-olive/30"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button onClick={() => setCategory("All")} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all", category === "All" ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>Alles</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all", category === cat ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && [0, 1, 2].map((i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}
        {!loading && filtered.map((item) => (
          <GlassPanel key={item.id} level={2} className="p-5 group relative">
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
              <button onClick={() => startEdit(item)} className="h-7 w-7 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition" aria-label="Bewerk"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => del(item)} className="h-7 w-7 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition" aria-label="Verwijder"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex items-start justify-between mb-3">
              <StatusBadge variant="muted">{item.category}</StatusBadge>
            </div>
            <h3 className="text-sm font-display font-semibold mb-2 group-hover:text-foreground transition-colors">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">{item.content}</p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/40">
              <span>{item.source}</span>
              {item.project_id && projTitle(item.project_id) && <span className="text-olive">{projTitle(item.project_id)}</span>}
            </div>
          </GlassPanel>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Geen kennis gevonden</p>
          <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Voeg toe</GlassButton>
        </GlassPanel>
      )}

      <PanelForm
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nieuwe kennis"
        eyebrow="Kennisbank"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={create}>Maak aan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setShowNew(false)}>Annuleer</GlassButton>
        </>}
      >
        <Fields d={draft} set={setDraft} projects={projects} />
      </PanelForm>

      <PanelForm
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Kennis bewerken"
        eyebrow="Kennisbank"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={saveEdit}>Opslaan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setEditItem(null)}>Annuleer</GlassButton>
        </>}
      >
        <Fields d={editDraft} set={setEditDraft} projects={projects} />
      </PanelForm>
    </div>
  );
}