import React from "react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import ImageViewerPanel from "@/system/panels/viewers/ImageViewerPanel";
import VideoPlayerPanel from "@/system/panels/viewers/VideoPlayerPanel";
import MusicPlayerPanel from "@/system/panels/viewers/MusicPlayerPanel";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";
import { Film } from "lucide-react";

/**
 * MediaStage — transparante stage (zelfde glas als de tab-strook) die het
 * aangeklikte bestand toont met de echte speler: afbeelding, video, audio of
 * pdf/document. Leest uit de MediaViewerContext → opent in één klik.
 */
export default function MediaStage() {
  const { media } = useMediaViewer();

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-3">
      {!media ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-ivory/70">
          <div className="h-14 w-14 rounded-2xl bg-ivory/10 border border-ivory/15 flex items-center justify-center mb-5">
            <Film className="h-6 w-6 text-ivory/70" />
          </div>
          <p className="font-display font-semibold text-xl tracking-[-0.01em]">Media</p>
          <p className="text-[13px] text-ivory/55 mt-2 max-w-[16rem] leading-relaxed">
            Klik een bestand aan om het hier te openen — beeld, video, audio of pdf.
          </p>
        </div>
      ) : media.kind === "image" ? (
        <ImageViewerPanel />
      ) : media.kind === "video" ? (
        <VideoPlayerPanel />
      ) : media.kind === "music" ? (
        <MusicPlayerPanel />
      ) : (
        <DocViewerPanel />
      )}
    </div>
  );
}