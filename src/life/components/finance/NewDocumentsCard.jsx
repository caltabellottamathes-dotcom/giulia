import React from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { FileText } from "lucide-react";

/**
 * NewDocumentsCard — witte kaart met titel "NEW DOCUMENTS" en de 5 laatst
 * toegevoegde documenten uit de mediatheek (Upload, note = "doc"). Klik opent
 * het bestand in de Media Stage die uitschuift.
 */
export default function NewDocumentsCard() {
  const { items, loading } = useMediaLibrary();
  const list = (items || []).filter((i) => kindOfUpload(i) === "doc").slice(0, 5);

  const open = (item) => {
    window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "media" }));
    window.dispatchEvent(new CustomEvent("giulia:open-media", { detail: { name: item.filename, url: item.file_url, type: kindOfUpload(item) } }));
  };

  return (
    <div
      className="w-full h-full rounded-[18px] flex flex-col p-4 overflow-hidden"
      style={{ background: "#f5f5f4" }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">New Documents</p>
      <div className="mt-3 space-y-2 flex-1 min-h-0 overflow-hidden">
        {loading && list.length === 0 && <p className="text-[11px] text-foreground/40">Laden…</p>}
        {!loading && list.length === 0 && <p className="text-[11px] text-foreground/40">Nog geen documenten. Upload een pdf via Media.</p>}
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
              <p className="text-[12px] font-medium truncate">{d.filename || "Document"}</p>
              <p className="text-[9px] uppercase tracking-wide text-foreground/45">pdf</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}