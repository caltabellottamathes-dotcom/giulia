import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";

export default function MemoryPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Memory.filter({}, "-created_date", 6);
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
        <Stat label="Herinneringen" value={items.length} accent="hsl(var(--charcoal))" />
        <Stat label="Categorieën" value={new Set(items.map((i) => i.category)).size} />
      </div>
      <SectionLabel>Wat Giulia onthoudt</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={onOpen}
              className="w-full text-left rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition"
            >
              <span className="block text-[10px] uppercase tracking-[0.18em] text-foreground/40 font-semibold mb-1">
                {m.category}
              </span>
              <span className="block text-sm text-foreground/80 line-clamp-3">{m.content}</span>
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Nog niets onthouden" />
      )}
    </div>
  );
}