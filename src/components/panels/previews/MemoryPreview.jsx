import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Card, Empty, SectionLabel, Pill } from "./previewParts";

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
        <Stat label="Categorieën" value={new Set(items.map((i) => i.category)).size} accent="hsl(var(--olive))" />
      </div>
      <SectionLabel>Wat Giulia onthoudt</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((m) => (
            <Card key={m.id} onClick={onOpen} accent="hsl(var(--charcoal))">
              {m.category && <Pill accent="hsl(var(--olive))">{m.category}</Pill>}
              <span className="block text-sm text-foreground/80 line-clamp-3 mt-1.5">{m.content}</span>
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Nog niets onthouden" />
      )}
    </div>
  );
}