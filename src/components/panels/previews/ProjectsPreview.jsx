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
      <button
        onClick={openNew}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl glass-1 px-4 py-3 text-sm font-semibold text-ivory hover:bg-foreground/5 transition"
      >
        <Plus className="h-4 w-4" /> Nieuw project
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Actief" value={projects.length} accent="hsl(var(--olive))" />
        <Stat label="Mijlpaal open" value={projects.filter((p) => p.next_milestone).length} />
      </div>

      <SectionLabel>Projecten die nu lopen</SectionLabel>

      {loading ? (
        <Empty text="Laden…" />
      ) : projects.length ? (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-2xl glass-1 pr-2 hover:bg-foreground/5 transition">
              <button onClick={onOpen} className="flex-1 text-left px-4 py-3 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: HEALTH[p.health] || "hsl(var(--smoke))" }} />
                  <span className="text-sm font-medium text-foreground truncate flex-1">{p.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 shrink-0" />
                </div>
                <div className="mt-2 h-1 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.progress || 0}%`, background: "hsl(var(--olive))" }} />
                </div>
              </button>
              <button
                onClick={(e) => openEdit(p, e)}
                className="h-8 w-8 shrink-0 rounded-full glass-1 flex items-center justify-center text-foreground/60 hover:text-foreground transition"
                aria-label="Bewerk project"
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