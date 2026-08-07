import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import { mockDocuments, mockProjects } from "@/lib/mockData";
import {
  FileText, Image, FileSpreadsheet, FileType, Plus, Search,
  Star, Sparkles, Folder, Clock,
} from "lucide-react";

const categories = ["Recent", "Projects", "Shared", "Favorites", "Giulia generated"];

const fileIcons = {
  pdf: FileText, image: Image, sheet: FileSpreadsheet,
  figma: FileType, doc: FileText, other: FileText,
};

export default function Documents() {
  const [category, setCategory] = useState("Recent");
  const [search, setSearch] = useState("");

  const filtered = mockDocuments.filter((d) => {
    const matchCat = category === "Recent" ? true : d.status === category.toLowerCase().replace(" ", "_");
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw editoriale documentbibliotheek</p>
        </div>
        <GlassButton variant="primary" size="md">
          <Plus className="h-4 w-4" /> Upload document
        </GlassButton>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek documenten..."
          className="w-full glass-1 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
        />
      </div>

      {/* Category tabs */}
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
            {cat}
          </button>
        ))}
      </div>

      {/* Giulia generated highlight */}
      {category === "Giulia generated" && (
        <GlassPanel level={3} className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-olive" />
            <p className="text-xs font-medium uppercase tracking-wider text-olive">Giulia gegenereerd</p>
          </div>
          <p className="text-sm text-muted-foreground">Documenten die Giulia voor je heeft samengevat, geanalyseerd of voorbereid.</p>
        </GlassPanel>
      )}

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((doc) => {
          const Icon = fileIcons[doc.type] || FileText;
          const project = mockProjects.find((p) => p.id === doc.project_id);
          return (
            <GlassPanel key={doc.id} level={2} className="p-5 cursor-pointer hover:scale-[1.01] transition-transform group">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl glass-1 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                {doc.status === "favorite" && <Star className="h-4 w-4 text-olive fill-olive/30" />}
                {doc.status === "giulia" && <Sparkles className="h-4 w-4 text-olive" />}
              </div>
              <p className="text-sm font-medium truncate mb-1">{doc.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{doc.owner}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/40">
                <span className="uppercase">{doc.type}</span>
                {project && <span className="text-olive truncate ml-2">{project.title}</span>}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <Folder className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Geen documenten</p>
        </GlassPanel>
      )}
    </div>
  );
}