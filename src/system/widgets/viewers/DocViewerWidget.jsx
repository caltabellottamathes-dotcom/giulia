import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { FileText } from "lucide-react";

export default function DocViewerWidget() {
  const { openModule } = usePanel();
  const { media } = useMediaViewer();
  const mine = media && media.kind === "doc" ? media : null;
  return (
    <WidgetShell size="1x1" interactive onClick={() => openModule("docviewer")}>
      <div className="p-3.5 flex flex-col h-full">
        <WidgetHeader label="Document" />
        <div className="flex-1 min-h-0 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-ivory/10 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-ivory/60" /></div>
          <div className="min-w-0">
            <p className="text-[11px] text-ivory/85 truncate">{mine ? mine.name : "Geen document"}</p>
            <p className="text-[10px] text-ivory/45 uppercase">{mine ? (mine.type || "doc") : "—"}</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}