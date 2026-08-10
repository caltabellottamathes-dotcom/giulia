import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, Empty, SectionLabel, HeroStat } from "./previewParts";
import { Check, X, ArrowUpRight } from "lucide-react";

export default function ApprovalsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await base44.entities.Approval.filter({ status: "pending" }, "-created_date", 6);
      setItems(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (a, status) => {
    setItems((prev) => prev.filter((x) => x.id !== a.id));
    try {
      await base44.entities.Approval.update(a.id, { status });
    } catch (e) {
      load();
    }
  };

  return (
    <div className="space-y-4">
      <HeroStat
        value={items.length}
        label="Wacht op jou"
        accent="hsl(var(--olive))"
        sub={items[0]?.category ? `meest recent: ${items[0].category}` : "niets open"}
      />
      <SectionLabel>Wacht op goedkeuring</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((a) => (
            <Card
              key={a.id}
              onClick={onOpen}
              accent="hsl(var(--olive))"
              action={
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); decide(a, "approved"); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-olive text-ivory px-3 py-1.5 text-xs font-semibold hover:bg-olive/90 transition"
                  >
                    <Check className="h-3.5 w-3.5" /> Goed
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); decide(a, "rejected"); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-foreground/[0.08] transition"
                  >
                    <X className="h-3.5 w-3.5" /> Af
                  </button>
                </>
              }
            >
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{a.title || a.action_type}</span>
                  <span className="block text-xs text-foreground/50 line-clamp-2 mt-0.5">{a.description}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 shrink-0 mt-0.5" />
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