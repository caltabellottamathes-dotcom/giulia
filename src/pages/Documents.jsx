import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import {
  FileText, Image as ImageIcon, FileSpreadsheet, FileType, Plus, Search,
  Star, Sparkles, Folder,
} from "lucide-react";

const categories = ["recent", "project", "shared", "favorite", "giulia"];
const categoryLabel = { recent: "Recent", project: "Projecten", shared: "Gedeeld", favorite: "Favorieten", giulia: "Giulia gegenereerd" };

const fileIcons = {
  pdf: FileText, image: ImageIcon, sheet: FileSpreadsheet,
  figma: FileType, doc: FileText, other: FileText,
};

export default function Documents() {
  const [category, setCategory] = useState("recent");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const { data: documents, loading, reload } = useEntityList("Document");
  const { data: projects } = useEntityList("Project");
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const filtered = documents.filter((d) => {
    const matchCat = d.status === category;
    const matchSearch = !search || (d.name || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const ext = file.name.split(".").pop()?.toLowerCase();
      const type = ["pdf"].includes(ext) ? "pdf" : ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? "image" : ["xlsx", "csv"].includes(ext) ? "sheet" : ["fig"].includes(ext) ? "figma" : ["doc", "docx"].includes(ext) ? "doc" : "other";
      await base44.entities.Document.create({ name: file.name, type, url: file_url, status: "recent", owner: "Jij" });
      reload();
    } catch (err) {
      /* ignore */
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Documenten</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw editoriale documentbibliotheek</p>
        </div>
        <GlassButton variant="primary" size="md" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Plus className="h-4 w-4" /> {uploading ? "Uploaden..." : "Upload document"}
        </GlassButton>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek documenten..." className="w-full glass-1 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all", category === cat ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
            {categoryLabel[cat]}
          </button>
        ))}
      </div>

      {category === "giulia" && (
        <GlassPanel level={3} className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-olive" />
            <p className="text-xs font-medium uppercase tracking-wider text-olive">Giulia gegenereerd</p>
          </div>
          <p className="text-sm text-muted-foreground">Documenten die Giulia voor je heeft samengevat, geanalyseerd of voorbereid.</p>
        </GlassPanel>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && [0, 1, 2].map((i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}
        {!loading && filtered.map((doc) => {
          const Icon = fileIcons[doc.type] || FileText;
          return (
            <GlassPanel key={doc.id} level={2} className="p-5 cursor-pointer hover:scale-[1.01] transition-transform group" >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl glass-1 flex items-center justify-center"><Icon className="h-5 w-5 text-muted-foreground" /></div>
                {doc.status === "favorite" && <Star className="h-4 w-4 text-olive fill-olive/30" />}
                {doc.status === "giulia" && <Sparkles className="h-4 w-4 text-olive" />}
              </div>
              <p className="text-sm font-medium truncate mb-1">{doc.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{doc.owner}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/40">
                <span className="uppercase">{doc.type}</span>
                {doc.project_id && projTitle(doc.project_id) && <span className="text-olive truncate ml-2">{projTitle(doc.project_id)}</span>}
              </div>
              {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="text-[10px] text-olive mt-2 inline-block hover:underline">Openen →</a>}
            </GlassPanel>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <Folder className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Geen documenten in deze categorie</p>
          <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => fileRef.current?.click()}><Plus className="h-4 w-4" /> Upload</GlassButton>
        </GlassPanel>
      )}
    </div>
  );
}