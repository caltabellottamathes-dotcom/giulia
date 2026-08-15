import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, Empty, SectionLabel, Pill, HeroStat, RingMini } from "../../system/panels/previewParts";

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
      } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  const avgNum = items.length ? Math.round((items.reduce((s, i) => s + (i.confidence || 0), 0) / items.length) * 100) : 0;
  const avg = items.length ? avgNum + "%" : "—";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
        <HeroStat value={items.length} label="Nieuw" accent="hsl(var(--sand))" sub={`${avg} gem. vertrouwen`} />
        <div className="animate-fade-up rounded-2xl glass-card-2 p-4 flex flex-col items-center justify-center gap-1 text-ivory">
          <RingMini value={avgNum} accent="hsl(var(--olive))" size={64} />
          <span className="text-[10px] uppercase tracking-wider text-ivory/55">vertrouwen</span>
        </div>
      </div>
      <SectionLabel>Inzichten om te bekijken</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((i) => (
            <Card key={i.id} onClick={onOpen} accent={CAT_COLOR[i.category] || "hsl(var(--smoke))"}>
              <Pill accent={CAT_COLOR[i.category]}>{i.category}</Pill>
              <span className="block text-sm font-medium text-ivory mt-1.5">{i.title}</span>
              <span className="block text-xs text-ivory/50 line-clamp-2 mt-0.5">{i.content}</span>
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Geen nieuwe inzichten" />
      )}
    </div>
  );
}