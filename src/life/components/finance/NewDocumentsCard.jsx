import React from "react";
import { useEntityList } from "@/hooks/useEntity";
import { FileText } from "lucide-react";

/**
 * NewDocumentsCard — witte kaart met titel "NEW DOCUMENTS" en de 3 laatst
 * toegevoegde documenten.
 */
export default function NewDocumentsCard() {
  const { data: docs } = useEntityList("Document", { sort: "-created_date", limit: 3, realtime: true });
  const list = (docs || []).slice(0, 3);

  return (
    <div
      className="w-full h-full rounded-[18px] flex flex-col p-4 overflow-hidden"
      style={{ background: "#f5f5f4", boxShadow: "0 16px 34px -18px rgba(0,0,0,0.20)" }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">New Documents</p>
      <div className="mt-3 space-y-2.5 flex-1 min-h-0 overflow-hidden">
        {list.length === 0 && <p className="text-[11px] text-foreground/40">No documents yet.</p>}
        {list.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-foreground/[0.06] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-foreground/55" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium truncate">{d.name || d.title || "Document"}</p>
              <p className="text-[9px] uppercase tracking-wide text-foreground/45">{d.document_type || d.type || "other"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}