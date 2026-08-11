import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { Card, Empty, SectionLabel, ActionBtn, HeroStat, RingMini } from "./previewParts";
import { ArrowUpRight, Plus, Pencil } from "lucide-react";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";

const HEALTH = { good: "hsl(var(--olive))", attention: "hsl(var(--sand))", critical: "hsl(var(--destructive))" };

const PROJECT_COLORS = [
  "hsl(var(--olive))",
  "hsl(var(--sand))",
  "hsl(var(--powder))",
  "hsl(var(--steel))",
  "hsl(var(--ridge))",
  "hsl(var(--charcoal))",
];

export default function ProjectsPreview({ onOpen }) {
  const navigate = useNavigate();
  const { closeModule } = usePanel();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Project.filter({ status: { $in: ["planning", "in_progress", "waiting"] } }, "-last_activity_date", 6);
      setProjects(data || []);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const openNew = () => { setEditorProject(null); setEditorOpen(true); };
  const openEdit = (p) => { setEditorProject(p); setEditorOpen(true); };

  return (
    <div className="space-y-4">
      <button onClick={openNew} className="w-full animate-fade-up inline-flex items-center justify-center gap-2 rounded-2xl glass-card-2 px-4 py-3 text-sm font-semibold text-ivory hover:bg-white/10 transition">
        <Plus className="h-4 w-4" /> Nieuw project
      </button>
      <HeroStat value={projects.length} label="Actief" accent="hsl(var(--olive))" sub={`${projects.filter((p) => p.next_milestone).length} met open mijlpaal`} />
      <SectionLabel>Projecten die nu lopen</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : projects.length ? (
        <div className="space-y-2">
          {projects.map((p, i) => {
            const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
            return (
              <Card key={p.id} onClick={() => { navigate(`/projects/${p.id}`); closeModule(); }} accent={color} trailing={<ActionBtn icon={Pencil} label="Bewerk project" onClick={() => openEdit(p)} />}>
                <div className="flex items-center gap-3">
                  <RingMini value={p.progress} accent={color} size={48} />
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ivory truncate">{p.title}</span>
                    <span className="block text-[11px] text-ivory/50 mt-0.5">{p.progress || 0}% · {p.next_milestone || "geen mijlpaal"}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-ivory/40 shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty text="Geen actieve projecten" />
      )}
      <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={editorProject} onSaved={load} />
    </div>
  );
}