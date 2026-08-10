import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { FileText } from "lucide-react";

export default function DocumentsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Upload.filter({}, "-created_date", 6);
        setItems(data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nieuw = items.filter((i) => i.status === "new");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Bestanden" value={items.length} accent="hsl(var(--charcoal))" />
        <Stat label="Nieuw" value={nieuw.length} />
      </div>
      <SectionLabel>Recente bestanden</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((u) => (
            <button
              key={u.id}
              onClick={onOpen}
              className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition"
            >
              <span className="h-8 w-8 rounded-xl glass-1 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-foreground/60" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground truncate">{u.filename || "Bestand"}</span>
                {u.note && <span className="block text-xs text-foreground/50 truncate">{u.note}</span>}
              </span>
              {u.status === "new" && <span className="h-1.5 w-1.5 rounded-full bg-sand" />}
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Geen bestanden" />
      )}
    </div>
  );
}