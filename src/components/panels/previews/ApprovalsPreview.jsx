import React from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { Card, Empty, SectionLabel, HeroStat } from "./previewParts";
import { Check, X, ArrowUpRight } from "lucide-react";

export default function ApprovalsPreview({ onOpen }) {
  const { data: items, loading, reload } = useEntityList("Approval", {
    filter: { status: "pending" },
    sort: "-created_date",
    limit: 6,
    realtime: true,
  });

  const decide = async (a, status) => {
    try { await base44.entities.Approval.update(a.id, { status }); } catch (e) {}
    reload();
  };

  return (
    <div className="space-y-4">
      <HeroStat value={items.length} label="Wacht op jou" accent="hsl(var(--olive))" sub={items[0]?.category ? `meest recent: ${items[0].category}` : "niets open"} />
      <SectionLabel>Wacht op goedkeuring</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id} onClick={onOpen} accent="hsl(var(--olive))" action={
              <>
                <button onClick={(e) => { e.stopPropagation(); decide(a, "approved"); }} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-olive text-ivory px-3 py-1.5 text-xs font-semibold hover:bg-olive/90 transition">
                  <Check className="h-3.5 w-3.5" /> Goed
                </button>
                <button onClick={(e) => { e.stopPropagation(); decide(a, "rejected"); }} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full glass-button text-ivory px-3 py-1.5 text-xs font-semibold hover:bg-white/15 transition">
                  <X className="h-3.5 w-3.5" /> Af
                </button>
              </>
            }>
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ivory">{a.title || a.action_type}</span>
                  <span className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${a.assignee === "giulia" ? "bg-steel/25 text-ivory/80" : "bg-olive/30 text-ivory"}`}>
                      {a.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}
                    </span>
                  </span>
                  <span className="block text-xs text-ivory/50 line-clamp-2 mt-1">{a.description}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ivory/40 shrink-0 mt-0.5" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty text="Niets wat op jou wacht" />
      )}
    </div>
  );
}