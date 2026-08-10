import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { ArrowUpRight } from "lucide-react";

const HEALTH = {
  good: "hsl(var(--olive))",
  attention: "hsl(var(--sand))",
  critical: "hsl(var(--destructive))",
};

export default function ProjectsPreview({ onOpen }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  return (
    <div className="space-y-4">
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
            <button
              key={p.id}
              onClick={onOpen}
              className="w-full text-left rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition group"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: HEALTH[p.health] || "hsl(var(--smoke))" }}
                />
                <span className="text-sm font-medium text-foreground truncate flex-1">{p.title}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
              </div>
              <div className="mt-2 h-1 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.progress || 0}%`, background: "hsl(var(--olive))" }}
                />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Geen actieve projecten" />
      )}
    </div>
  );
}