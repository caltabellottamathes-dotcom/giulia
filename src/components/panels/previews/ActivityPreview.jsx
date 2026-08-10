import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { format } from "date-fns";

const SRC_COLOR = {
  giulia: "hsl(var(--olive))",
  email: "hsl(var(--blue-grey))",
  whatsapp: "hsl(var(--sand))",
  tasks: "hsl(var(--charcoal))",
};

export default function ActivityPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Activity.filter({}, "-timestamp", 8);
        setItems(data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Recent" value={items.length} accent="hsl(var(--sand))" />
        <Stat label="Bronnen" value={new Set(items.map((i) => i.source)).size} />
      </div>
      <SectionLabel>Laatste gebeurtenissen</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((a) => (
            <button
              key={a.id}
              onClick={onOpen}
              className="w-full text-left flex items-start gap-3 rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition"
            >
              <span
                className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                style={{ background: SRC_COLOR[a.source] || "hsl(var(--smoke))" }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-foreground/80 line-clamp-2">{a.description}</span>
                <span className="block text-[11px] text-foreground/40 mt-0.5">
                  {a.timestamp ? format(new Date(a.timestamp), "d MMM HH:mm") : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Geen recente activiteit" />
      )}
    </div>
  );
}