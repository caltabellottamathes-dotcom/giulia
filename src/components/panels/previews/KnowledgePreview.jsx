import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";

export default function KnowledgePreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Knowledge.filter({}, "-created_date", 6);
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
        <Stat label="Notities" value={items.length} accent="hsl(var(--olive))" />
        <Stat label="Categorieën" value={new Set(items.map((i) => i.category)).size} />
      </div>
      <SectionLabel>Recente kennis</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((k) => (
            <button
              key={k.id}
              onClick={onOpen}
              className="w-full text-left rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition"
            >
              <span className="block text-[10px] uppercase tracking-[0.18em] text-foreground/40 font-semibold mb-1">
                {k.category}
              </span>
              <span className="block text-sm font-medium text-foreground truncate">{k.title}</span>
              {k.content && <span className="block text-xs text-foreground/50 line-clamp-2 mt-0.5">{k.content}</span>}
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen kennis opgeslagen" />
      )}
    </div>
  );
}