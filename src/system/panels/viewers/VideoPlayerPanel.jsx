import React from "react";
import { Download, Video } from "lucide-react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

export default function VideoPlayerPanel() {
  const { media } = useMediaViewer();
  if (!media || media.kind !== "video") return <ViewerEmpty icon={Video} label="video" />;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <video src={media.url} controls autoPlay className="w-full max-h-[72vh]" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ivory/85 truncate">{media.name}</p>
        <a href={media.url} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-olive hover:underline shrink-0"><Download className="h-3.5 w-3.5" /> Downloaden</a>
      </div>
    </div>
  );
}