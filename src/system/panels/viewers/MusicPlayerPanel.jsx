import React from "react";
import { Music, Download } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

export default function MusicPlayerPanel() {
  const { media } = useMediaViewer();
  if (!media || media.kind !== "music") return <ViewerEmpty icon={Music} label="muziek" />;
  const drive = isDriveUrl(media.url);
  if (drive) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl overflow-hidden bg-black/40" style={{ minHeight: "50vh" }}>
          <iframe src={media.url} title={media.name} className="w-full" style={{ height: "60vh" }} allow="autoplay" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ivory/85 truncate">{media.name}</p>
          <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-olive hover:underline shrink-0"><Download className="h-3.5 w-3.5" /> Openen</a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="h-36 w-36 rounded-3xl bg-gradient-to-br from-ivory/15 to-ivory/5 border border-white/12 flex items-center justify-center">
        <Music className="h-14 w-14 text-ivory/60" />
      </div>
      <p className="text-base text-ivory/90 truncate max-w-full">{media.name}</p>
      <audio src={media.url} controls autoPlay className="w-full max-w-md" />
      <a href={media.url} download target="_blank" rel="noreferrer" className="text-[11px] text-olive hover:underline">Downloaden</a>
    </div>
  );
}