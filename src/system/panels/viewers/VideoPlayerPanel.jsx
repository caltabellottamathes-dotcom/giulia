import React from "react";
import { Maximize2, Video } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { usePanel } from "@/lib/PanelContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

/** VideoPlayerPanel — video speelt automatisch, vult de stage op eigen
 *  verhouding (geen zwarte vulling) met afgeronde hoeken en een kleine marge.
 *  Tik → MediaFullscreenWindow (met controls). */
export default function VideoPlayerPanel() {
  const { media } = useMediaViewer();
  const { openMediaFullscreen } = usePanel();
  if (!media || media.kind !== "video") return <ViewerEmpty icon={Video} label="video" />;
  const drive = isDriveUrl(media.url);
  if (drive) {
    return (
      <div className="relative w-full h-full p-4">
        <div className="relative w-full h-full overflow-hidden rounded-[18px] shadow-[0_20px_44px_-20px_rgba(0,0,0,0.35)]">
          <iframe src={media.url} title={media.name} className="w-full h-full" allow="autoplay" />
        </div>
        <button onClick={openMediaFullscreen} className="absolute top-7 right-7 z-10 h-9 w-9 rounded-full bg-black/30 border border-white/15 backdrop-blur-md flex items-center justify-center text-ivory/90 hover:text-white hover:bg-black/45 transition" aria-label="Vergroten"><Maximize2 className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <div onClick={openMediaFullscreen} className="w-full h-full flex items-center justify-center cursor-zoom-in bg-transparent p-4" role="button" tabIndex={0} aria-label="Vergroten">
      <video src={media.url} autoPlay playsInline preload="auto" className="max-w-full max-h-full object-contain rounded-[18px] shadow-[0_20px_44px_-20px_rgba(0,0,0,0.35)]" />
    </div>
  );
}