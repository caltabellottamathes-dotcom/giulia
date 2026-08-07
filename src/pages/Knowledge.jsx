import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import { IMAGES } from "@/lib/images";
import { mockKnowledge, mockProjects } from "@/lib/mockData";
import { Search, BookOpen, Plus, Heart, Sparkles } from "lucide-react";

const categories = ["Research", "Notes", "Insights", "References", "Decisions", "Conversations", "Saved"];

export default function Knowledge() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = mockKnowledge.filter((k) => {
    const matchCat = category === "All" || k.category === category;
    const matchSearch = !search || k.title.toLowerCase().includes(search.toLowerCase()) || k.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Editorial header */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 editorial-bg" style={{ backgroundImage: `url(${IMAGES.walkingChairs})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="relative p-8 lg:p-10 max-w-2xl">
          <h1 className="text-3xl font-heading font-light tracking-tight mb-2 text-balance">
            Ontdek de Kennisbank van de Assistent
          </h1>
          <p className="text-sm text-muted-foreground mb-4">Doorzoek de database</p>
          <GlassButton variant="dark" size="pill">
            <Sparkles className="h-3.5 w-3.5" /> Ontdek
          </GlassButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Doorzoek kennis, notities, inzichten..."
          className="w-full glass-2 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-olive/30"
        />
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory("All")}
          className={cn(
            "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
            category === "All" ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
          )}
        >
          Alles
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
              category === cat ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Knowledge grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const project = mockProjects.find((p) => p.id === item.project_id);
          return (
            <GlassPanel key={item.id} level={2} className="p-5 cursor-pointer hover:scale-[1.01] transition-transform group">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge variant="muted">{item.category}</StatusBadge>
                <button className="text-muted-foreground hover:text-olive transition-colors">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-sm font-heading font-medium mb-2 group-hover:text-foreground transition-colors">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">{item.content}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/40">
                <span>{item.source}</span>
                {project && <span className="text-olive">{project.title}</span>}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Geen kennis gevonden</p>
        </GlassPanel>
      )}
    </div>
  );
}