import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Empty, SectionLabel, ActionBtn, HeroStat, RingMini } from "./previewParts";
import { FileText, Check } from "lucide-react";

export default function DocumentsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await base44.entities.Upload.filter({}, "-created_date", 6);
      setItems(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const mark = async (u) => {
    setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "processed" } : x)));
    try {
      await base44.entities.Upload.update(u.id, { status: "processed" });
    } catch (e) {
      load();
    }
  };

  const nieuw = items.filter((i) => i.status === "new");
  const nieuwPct = items.length ? Math.round((nieuw.length / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
        <HeroStat value={items.length} label="Bestanden" accent="hsl(var(--charcoal))" sub={`${nieuw.length} nieuw`} />
        <div className="animate-fade-up rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] p-4 flex flex-col items-center justify-center gap-1">
          <RingMini value={nieuwPct} accent="hsl(var(--sand))" size={64} />
          <span className="text-[10px] uppercase tracking-wider text-foreground/50">nieuw</span>
        </div>
      </div>
      <SectionLabel>Recente bestanden</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((u) => (
            <div
              key={u.id}
              className="group animate-fade-up relative flex items-center gap-3 rounded-2xl pl-4 pr-3 py-3 bg-foreground/[0.03] border border-foreground/[0.06] hover:bg-foreground/[0.06] transition-all duration-300 hover:translate-x-0.5"
            >
              <span
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: u.status === "new" ? "hsl(var(--sand))" : "hsl(var(--smoke))" }}
              />
              <button onClick={onOpen} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                <span className="h-8 w-8 rounded-xl bg-foreground/[0.05] border border-foreground/[0.08] flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-foreground/60" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground truncate">{u.filename || "Bestand"}</span>
                  {u.note && <span className="block text-xs text-foreground/50 truncate">{u.note}</span>}
                </span>
              </button>
              {u.status === "new" && <ActionBtn icon={Check} label="Markeer verwerkt" tone="olive" onClick={() => mark(u)} />}
            </div>
          ))}
        </div>
      ) : (
        <Empty text="Geen bestanden" />
      )}
    </div>
  );
}