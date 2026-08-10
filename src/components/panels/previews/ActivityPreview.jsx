import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, Empty, SectionLabel, HeroStat, MiniBars } from "./previewParts";
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

  const sources = new Set(items.map((i) => i.source));
  const data = [...sources].map((s) => ({
    value: Math.max(items.filter((i) => i.source === s).length, 1),
    color: SRC_COLOR[s] || "hsl(var(--smoke))",
  }));

  return (
    <div className="space-y-4">
      <HeroStat
        value={items.length}
        label="Recent"
        accent="hsl(var(--sand))"
        sub={`${sources.size} bronnen`}
        visual={items.length > 0 ? <MiniBars height={56} data={data} /> : undefined}
      />
      <SectionLabel>Laatste gebeurtenissen</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id} onClick={onOpen} accent={SRC_COLOR[a.source] || "hsl(var(--smoke))"}>
              <span className="block text-sm text-foreground/80 line-clamp-2">{a.description}</span>
              <span className="block text-[11px] text-foreground/40 mt-1">
                {a.source ? a.source + " · " : ""}{a.timestamp ? format(new Date(a.timestamp), "d MMM HH:mm") : ""}
              </span>
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Geen recente activiteit" />
      )}
    </div>
  );
}