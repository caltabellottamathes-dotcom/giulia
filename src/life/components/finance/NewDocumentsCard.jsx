import React from "react";
import { useEntityList } from "@/hooks/useEntity";
import { FileText } from "lucide-react";

/**
 * NewDocumentsCard — witte kaart met titel "NEW DOCUMENTS" en de 5 laatst
 * toegevoegde documenten. Klik op een document opent het in de Media Stage.
 */
export default function NewDocumentsCard() {
  const { data: docs } = useEntityList("Document", { sort: "-created_date", limit: 5, realtime: true });
  const list = (docs || []).slice(0, 5);

  const open = (d) => {
    window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "media" }));
    window.dispatchEvent(new CustomEvent("giulia:open-media", { detail: d }));
  };

  return (
    <div
      className="w-full h-full rounded-[18px] flex flex-col p-4 overflow-hidden"
      style={{ background: "#f5f5f4", boxShadow: "0 16px 34px -18px rgba(0,0,0,0.20)" }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">New Documents</p>
      <div className="mt-3 space-y-2 flex-1 min-h-0 overflow-hidden">
        {list.length === 0 && <p className="text-[11px] text-foreground/40">No documents yet.</p>}
        {list.map((d) => (
          <button
            key={d.id}
            onClick={() => open(d)}
            className="flex items-center gap-2.5 min-w-0 w-full text-left hover:bg-foreground/[0.04] rounded-lg p-1 -m-1 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-foreground/[0.06] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-foreground/55" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium truncate">{d.name || d.title || "Document"}</p>
              <p className="text-[9px] uppercase tracking-wide text-foreground/45">{d.document_type || d.type || "other"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}