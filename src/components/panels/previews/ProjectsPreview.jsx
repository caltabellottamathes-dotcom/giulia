import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { ArrowUpRight, Plus, Pencil } from "lucide-react";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";

const HEALTH = {
  good: "hsl(var(--olive))",
  attention: "hsl(var(--sand))",
  critical: "hsl(var(--destructive))",
};

export default function ProjectsPreview({ onOpen }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Project.filter(
        { status: { $in: ["planning", "in_progress", "waiting"] } },
        "-last_activity_date",
        6
      );
      setProjects(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditorProject(null); setEditorOpen(true); };
  const openEdit = (p, e) => { e.stopPropagation(); setEditorProject(p); setEditorOpen(true); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Actief" value={projects.length} accent="hsl(var(--olive))" />
        <Stat label="Mijlpaal open" value={projects.filter((p) => p.next_milestone).length} />
      </div>

      <div className="flex items-center justify-between">
        <SectionLabel>Projecten die nu lopen</SectionLabel>
        <button onClick={openNew} className="inline-flex items-center gap-1 text-[11px] font-semibold text-olive hover:underline">
          <Plus className="h-3.5 w-3.5" /> Nieuw
        </button>
      </div>

      {loading ? (
        <Empty text="Laden…" />
      ) : projects.length ? (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="relative group">
              <button
                onClick={onOpen}
                className="w-full text-left rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: HEALTH[p.health] || "hsl(var(--smoke))" }} />
                  <span className="text-sm font-medium text-foreground truncate flex-1">{p.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
                </div>
                <div className="mt-2 h-1 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.progress || 0}%`, background: "hsl(var(--olive))" }} />
                </div>
              </button>
              <button
                onClick={(e) => openEdit(p, e)}
                className="absolute top-2 right-9 h-7 w-7 rounded-full glass-1 flex items-center justify-center text-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition"
                aria-label="Bewerk"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="Geen actieve projecten" />
      )}

      <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={editorProject} onSaved={load} />
    </div>
  );
}