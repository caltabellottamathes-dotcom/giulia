import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import PageHero from "@/components/glass/PageHero";
import { IMAGES } from "@/lib/images";
import { useEntityList } from "@/hooks/useEntity";
import { Search, BookOpen } from "lucide-react";

const categories = ["Research", "Notes", "Insights", "References", "Decisions", "Conversations", "Saved"];

export default function Knowledge() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: items, loading } = useEntityList("Knowledge");
  const { data: projects } = useEntityList("Project");
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const filtered = items.filter((k) => {
    const matchCat = category === "All" || k.category === category;
    const matchSearch = !search || (k.title || "").toLowerCase().includes(search.toLowerCase()) || (k.content || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="knowledge"
        icon={BookOpen}
        eyebrow="Kennis"
        title="Kennisbank"
        subtitle="Doorzoek de database"
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
          <GlassPanel key={item.id} level={2} className="p-5 group">
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
        </GlassPanel>
      )}
    </div>
  );
}