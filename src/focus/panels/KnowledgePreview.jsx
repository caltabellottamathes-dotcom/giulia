import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, Empty, SectionLabel, Pill, HeroStat } from "../../system/panels/previewParts";

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
      <HeroStat
        value={items.length}
        label="Notities"
        accent="hsl(var(--olive))"
        sub={`${new Set(items.map((i) => i.category)).size} categorieën`}
      />
      <SectionLabel>Recente kennis</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((k) => (
            <Card key={k.id} onClick={onOpen} accent="hsl(var(--olive))">
              {k.category && <Pill accent="hsl(var(--olive))">{k.category}</Pill>}
              <span className="block text-sm font-medium text-foreground mt-1.5 truncate">{k.title}</span>
              {k.content && <span className="block text-xs text-foreground/50 line-clamp-2 mt-0.5">{k.content}</span>}
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen kennis opgeslagen" />
      )}
    </div>
  );
}