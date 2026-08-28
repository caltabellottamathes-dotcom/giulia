import React from "react";
import { Maximize2, Download, FileText } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { usePanel } from "@/lib/PanelContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

/** DocViewerPanel — pdf vult de volle stage (wit, geen zwarte vulling). Tik op
 *  de vergrootknop → MediaFullscreenWindow. Andere docs tonen een icoon. */
export default function DocViewerPanel() {
  const { media } = useMediaViewer();
  const { openMediaFullscreen } = usePanel();
  if (!media || media.kind !== "doc") return <ViewerEmpty icon={FileText} label="document" />;
  const drive = isDriveUrl(media.url);
  const isPdf = media.type === "pdf" || /\.pdf$/i.test(media.name || media.url || "");

  if (drive || isPdf) {
    return (
      <div className="relative w-full h-full">
        <iframe src={media.url} title={media.name} className="w-full h-full bg-white" />
        <button onClick={openMediaFullscreen} className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-black/30 border border-white/15 backdrop-blur-md flex items-center justify-center text-ivory/90 hover:text-white hover:bg-black/45 transition" aria-label="Vergroten"><Maximize2 className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="h-16 w-16 rounded-2xl bg-ivory/8 flex items-center justify-center"><FileText className="h-8 w-8 text-ivory/55" /></div>
      <p className="text-sm text-ivory/85">{media.name}</p>
      <div className="flex items-center gap-4">
        <a href={media.url} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-olive hover:underline"><Download className="h-3.5 w-3.5" /> Downloaden</a>
        <button onClick={openMediaFullscreen} className="inline-flex items-center gap-1.5 text-[12px] text-olive hover:underline"><Maximize2 className="h-3.5 w-3.5" /> Vergroten</button>
      </div>
    </div>
  );
}