import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { Music } from "lucide-react";

export default function MusicPlayerWidget() {
  const { openModule } = usePanel();
  const { media } = useMediaViewer();
  const mine = media && media.kind === "music" ? media : null;
  return (
    <WidgetShell size="1x1" interactive onClick={() => openModule("musicplayer")}>
      <div className="p-3.5 flex flex-col h-full">
        <WidgetHeader label="Muziek" />
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2">
          <div className="h-11 w-11 rounded-xl bg-ivory/10 flex items-center justify-center"><Music className="h-5 w-5 text-ivory/60" /></div>
          {mine ? (
            <>
              <p className="text-[11px] text-ivory/85 truncate max-w-full">{mine.name}</p>
              <audio src={mine.url} controls className="w-full" style={{ height: "32px" }} />
            </>
          ) : <p className="text-[10px] text-ivory/45">Geen muziek</p>}
        </div>
      </div>
    </WidgetShell>
  );
}