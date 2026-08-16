import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { Image as ImageIcon } from "lucide-react";

export default function ImageViewerWidget() {
  const { openModule } = usePanel();
  const { media } = useMediaViewer();
  const mine = media && media.kind === "image" ? media : null;
  return (
    <WidgetShell size="1x1" interactive onClick={() => openModule("imageviewer")}>
      <div className="p-3.5 flex flex-col h-full">
        <WidgetHeader label="Afbeeldingen" />
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden flex items-center justify-center bg-black/25">
          {mine ? <img src={mine.url} alt={mine.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-7 w-7 text-ivory/30" />}
        </div>
        {mine && <p className="mt-2 text-[10px] text-ivory/70 truncate">{mine.name}</p>}
      </div>
    </WidgetShell>
  );
}