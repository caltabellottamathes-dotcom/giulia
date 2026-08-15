import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Brain, Plus, Edit3, Trash2, Sparkles } from "lucide-react";

const categories = ["All", "User preferences", "People", "Projects", "Routines", "Important information", "Conversation-derived"];

export default function Memory() {
  const [category, setCategory] = useState("All");
  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newMem, setNewMem] = useState({ content: "", category: "User preferences" });

  const { data: memories, loading, reload } = useEntityList("Memory");

  const filtered = memories.filter((m) => category === "All" || m.category === category);

  const saveEdit = async () => {
    if (!editing) return;
    await base44.entities.Memory.update(editing.id, { content: editContent });
    setEditing(null);
    reload();
  };

  const remove = async (id) => {
    await base44.entities.Memory.delete(id);
    reload();
  };

  const create = async () => {
    if (!newMem.content.trim()) return;
    await base44.entities.Memory.create({ content: newMem.content.trim(), category: newMem.category });
    setNewMem({ content: "", category: "User preferences" });
    setShowNew(false);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="memory"
        icon={Brain}
        eyebrow="Giulia"
        title="Geheugen"
        subtitle="Wat Giulia over je onthoudt"
        actions={
          <GlassButton variant="primary" size="md" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> Nieuwe herinnering
          </GlassButton>
        }
      />

      <GlassPanel level={3} className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
            <Brain className="h-4 w-4 text-foreground/70" />
          </div>
          <p className="text-sm">
            <span className="font-semibold">Giulia onthoudt {memories.length} dingen over je.</span> Deze kennis wordt gebruikt om je beter te helpen. Je kunt alles bekijken, bewerken of verwijderen.
          </p>
        </div>
      </GlassPanel>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all", category === cat ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
            {cat === "All" ? "Alles" : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && [0, 1].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        {!loading && filtered.map((mem) => (
          <GlassPanel key={mem.id} level={2} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-olive">{mem.category}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(mem); setEditContent(mem.content); }} className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(mem.id)} className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-3">{mem.content}</p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/40">
              <span>Bron: {mem.source || "—"}</span>
              <div className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /><span>{Math.round((mem.confidence || 0.5) * 100)}% zeker</span></div>
            </div>
          </GlassPanel>
        ))}
      </div>

      <FloatingPanel open={!!editing} onClose={() => setEditing(null)} position="right">
        {editing && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive">{editing.category}</span>
              <h2 className="text-xl font-display font-semibold mt-2">Herinnering bewerken</h2>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inhoud</label>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[120px] resize-none" />
            </div>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="md" className="flex-1" onClick={saveEdit}>Opslaan</GlassButton>
              <GlassButton variant="outline" size="md" onClick={() => setEditing(null)}>Annuleer</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>

      <FloatingPanel open={showNew} onClose={() => setShowNew(false)} position="right">
        <div className="space-y-5">
          <h2 className="text-xl font-display font-semibold">Nieuwe herinnering</h2>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categorie</label>
            <select value={newMem.category} onChange={(e) => setNewMem({ ...newMem, category: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inhoud</label>
            <textarea value={newMem.content} onChange={(e) => setNewMem({ ...newMem, content: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[120px] resize-none" placeholder="Wat moet Giulia onthouden?" />
          </div>
          <div className="flex gap-2">
            <GlassButton variant="primary" size="md" className="flex-1" onClick={create}>Opslaan</GlassButton>
            <GlassButton variant="outline" size="md" onClick={() => setShowNew(false)}>Annuleer</GlassButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}