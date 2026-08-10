import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import { FileText, Trash2, Upload } from "lucide-react";
import { parseContext } from "@/lib/projectStatus";

/** Files — documents linked to the project, grouped by onderdeel. */
export default function FilesSection({ project, tasks }) {
  const [documents, setDocuments] = useState([]);

  const load = async () => {
    const all = await base44.entities.Document.list();
    setDocuments(all.filter((d) => d.project_id === project.id));
  };
  useEffect(() => { load(); }, [project.id]);

  const del = async (doc) => { if (window.confirm("Bestand verwijderen?")) { await base44.entities.Document.delete(doc.id); load(); } };

  const grouped = {};
  documents.forEach((d) => {
    const k = d.note || parseContext(tasks.find((t) => t.id === d.project_id)?.context)?.ond || "Algemeen";
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(d);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold">Bestanden</h2>
        <GlassButton variant="glass" size="sm" onClick={() => window.alert("Upload via de Documents-pagina om bestanden aan dit project te koppelen.")}>
          <Upload className="h-3.5 w-3.5" /> Uploaden
        </GlassButton>
      </div>

      {documents.length === 0 ? (
        <GlassPanel level={1} className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Geen bestanden gekoppeld aan dit project.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([group, docs]) => (
            <div key={group}>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{group}</p>
              <div className="space-y-1.5">
                {docs.map((doc) => (
                  <div key={doc.id} className="group flex items-center gap-3 p-3 rounded-xl glass-1 hover:bg-foreground/[0.03] transition">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate">{doc.name || doc.filename || "Naamloos bestand"}</span>
                    {doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground">Openen</a>}
                    <button onClick={() => del(doc)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}