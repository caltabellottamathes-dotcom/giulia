import React, { useState, useEffect, useRef } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import { FileText, Trash2, Upload as UploadIcon, Loader2, Folder } from "lucide-react";
import { kindOfFile } from "@/lib/MediaViewerContext";
import { useToast } from "@/components/ui/use-toast";

/** Files — bestanden gekoppeld aan dit project. Worden opgeslagen in de
 *  FILES-bibliotheek onder "Projects/<projectId>" (folder + project_id),
 *  zodat ze hier op de projectpagina én in de bibliotheek onder het project
 *  verschijnen. */
export default function FilesSection({ project }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const all = await base44.entities.Upload.filter({ uploaded_for: "media" }, "-created_date", 500);
      setFiles((all || []).filter((u) => u.project_id === project.id));
    } catch { setFiles([]); }
  };
  useEffect(() => { load(); }, [project.id]);

  const onUpload = async (e) => {
    const list = [...(e.target.files || [])];
    e.target.value = "";
    if (!list.length) return;
    setUploading(true);
    try {
      for (const f of list) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        const kind = kindOfFile({ name: f.name, type: f.type });
        await base44.entities.Upload.create({
          file_url,
          filename: f.name,
          uploaded_for: "media",
          document_type: kind === "image" ? "image" : "other",
          note: kind,
          status: "new",
          folder: `Projects/${project.id}`,
          project_id: project.id,
        });
      }
      toast({ title: "Bestand toegevoegd", description: `Gekoppeld aan ${project.title}` });
      load();
      window.dispatchEvent(new CustomEvent("giulia:refresh"));
    } catch {
      toast({ title: "Upload mislukt", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const del = async (f) => {
    if (window.confirm("Bestand verwijderen?")) {
      await base44.entities.Upload.delete(f.id);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold">Bestanden</h2>
        <GlassButton variant="glass" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadIcon className="h-3.5 w-3.5" />}
          {uploading ? "Uploaden…" : "Uploaden"}
        </GlassButton>
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,application/pdf,.pdf" multiple className="hidden" onChange={onUpload} />
      </div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <Folder className="h-3 w-3" /> Bestanden worden automatisch in de projectmap in Files opgeslagen.
      </p>

      {files.length === 0 ? (
        <GlassPanel level={1} className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Nog geen bestanden gekoppeld aan dit project.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div key={f.id} className="group flex items-center gap-3 p-3 rounded-xl glass-1 hover:bg-foreground/[0.03] transition">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm flex-1 truncate">{f.filename || "Naamloos bestand"}</span>
              {f.file_url && <a href={f.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground">Openen</a>}
              <button onClick={() => del(f)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}