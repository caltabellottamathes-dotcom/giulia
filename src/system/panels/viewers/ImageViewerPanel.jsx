import React from "react";
import { Maximize2, Image as ImageIcon } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { usePanel } from "@/lib/PanelContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

/** ImageViewerPanel — beeld vult de volle stage (geen zwarte vulling), op de
 *  eigen verhouding. Tik → MediaFullscreenWindow (groot, schuift rechts in). */
export default function ImageViewerPanel() {
  const { media } = useMediaViewer();
  const { openMediaFullscreen } = usePanel();
  if (!media || media.kind !== "image") return <ViewerEmpty icon={ImageIcon} label="afbeelding" />;
  const drive = isDriveUrl(media.url);
  if (drive) {
    return (
      <div className="relative w-full h-full">
        <iframe src={media.url} title={media.name} className="w-full h-full" />
        <button onClick={openMediaFullscreen} className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-black/30 border border-white/15 backdrop-blur-md flex items-center justify-center text-ivory/90 hover:text-white hover:bg-black/45 transition" aria-label="Vergroten"><Maximize2 className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <div onClick={openMediaFullscreen} className="w-full h-full flex items-center justify-center cursor-zoom-in" role="button" tabIndex={0} aria-label="Vergroten">
      <img src={media.url} alt={media.name} className="max-w-full max-h-full object-contain" />
    </div>
  );
}