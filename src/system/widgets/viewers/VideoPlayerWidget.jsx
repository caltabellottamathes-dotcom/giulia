import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { Video, Play } from "lucide-react";

export default function VideoPlayerWidget() {
  const { openModule } = usePanel();
  const { media } = useMediaViewer();
  const mine = media && media.kind === "video" ? media : null;
  return (
    <WidgetShell size="1x1" interactive onClick={() => openModule("videoplayer")}>
      <div className="p-3.5 flex flex-col h-full">
        <WidgetHeader label="Video" />
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden flex items-center justify-center bg-black/25 relative">
          {mine ? (
            <>
              <video src={mine.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-9 w-9 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center"><Play className="h-4 w-4 translate-x-0.5" /></span>
              </span>
            </>
          ) : <Video className="h-7 w-7 text-ivory/30" />}
        </div>
        {mine && <p className="mt-2 text-[10px] text-ivory/70 truncate">{mine.name}</p>}
      </div>
    </WidgetShell>
  );
}