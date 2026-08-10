import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Card, Empty, SectionLabel, Pill } from "./previewParts";

const CAT_COLOR = {
  Opportunity: "hsl(var(--olive))",
  Risk: "hsl(var(--destructive))",
  Suggestion: "hsl(var(--sand))",
  "Follow-up": "hsl(var(--blue-grey))",
};

export default function InsightsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Insight.filter({ status: "new" }, "-created_date", 6);
        setItems(data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const avg = items.length
    ? Math.round((items.reduce((s, i) => s + (i.confidence || 0), 0) / items.length) * 100) + "%"
    : "—";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Nieuw" value={items.length} accent="hsl(var(--sand))" />
        <Stat label="Gem. vertrouwen" value={avg} accent="hsl(var(--olive))" />
      </div>
      <SectionLabel>Inzichten om te bekijken</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((i) => (
            <Card key={i.id} onClick={onOpen} accent={CAT_COLOR[i.category] || "hsl(var(--smoke))"}>
              <Pill accent={CAT_COLOR[i.category]}>{i.category}</Pill>
              <span className="block text-sm font-medium text-foreground mt-1.5">{i.title}</span>
              <span className="block text-xs text-foreground/50 line-clamp-2 mt-0.5">{i.content}</span>
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Geen nieuwe inzichten" />
      )}
    </div>
  );
}