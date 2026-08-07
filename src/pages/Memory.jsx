import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { mockMemory } from "@/lib/mockData";
import { Brain, Plus, Edit3, Trash2, Sparkles } from "lucide-react";

const categories = ["All", "User preferences", "People", "Projects", "Routines", "Important information", "Conversation-derived"];

export default function Memory() {
  const [category, setCategory] = useState("All");
  const [editing, setEditing] = useState(null);
  const [memories, setMemories] = useState(mockMemory);

  const filtered = memories.filter((m) => category === "All" || m.category === category);

  const handleDelete = (id) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">Memory</h1>
          <p className="text-sm text-muted-foreground mt-1">Wat Giulia over je onthoudt</p>
        </div>
        <GlassButton variant="primary" size="md">
          <Plus className="h-4 w-4" /> Nieuwe herinnering
        </GlassButton>
      </div>

      <GlassPanel level={3} className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
            <Brain className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Giulia onthoudt {memories.length} dingen over je.</span>{" "}
              Deze kennis wordt gebruikt om je beter te helpen. Je kunt alles bekijken, bewerken of verwijderen.
            </p>
          </div>
        </div>
      </GlassPanel>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
              category === cat ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
            )}
          >
            {cat === "All" ? "Alles" : cat}
          </button>
        ))}
      </div>

      {/* Memory list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mem) => (
          <GlassPanel key={mem.id} level={2} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-olive">{mem.category}</span>
              <div className="flex gap-1">
                <button onClick={() => setEditing(mem)} className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(mem.id)} className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-3">{mem.content}</p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/40">
              <span>Bron: {mem.source}</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>{Math.round(mem.confidence * 100)}% zeker</span>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Edit floating panel */}
      <FloatingPanel open={!!editing} onClose={() => setEditing(null)} position="right">
        {editing && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive">{editing.category}</span>
              <h2 className="text-xl font-heading font-medium mt-2">Herinnering bewerken</h2>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inhoud</label>
              <textarea
                defaultValue={editing.content}
                className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[120px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="md" className="flex-1" onClick={() => setEditing(null)}>Opslaan</GlassButton>
              <GlassButton variant="outline" size="md" onClick={() => setEditing(null)}>Annuleer</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}