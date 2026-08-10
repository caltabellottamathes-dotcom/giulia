import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";

/** Activity — chronological project history. */
export default function ActivitySection({ project }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.Activity.list("-timestamp", 100);
      setItems(all);
    })();
  }, [project.id]);

  return (
    <GlassPanel level={2} className="p-6">
      <h2 className="text-sm font-display font-semibold mb-4">Activiteit</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="flex gap-3 items-start">
            <div className="h-1.5 w-1.5 rounded-full bg-olive mt-2 shrink-0" />
            <div>
              <p className="text-sm">{a.description}</p>
              <p className="text-[11px] text-muted-foreground">
                {a.timestamp ? new Date(a.timestamp).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                {a.source ? ` · ${a.source}` : ""}
              </p>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nog geen activiteit geregistreerd.</p>}
      </div>
    </GlassPanel>
  );
}