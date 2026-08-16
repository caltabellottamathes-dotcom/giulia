import React from "react";
import { Music } from "lucide-react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

export default function MusicPlayerPanel() {
  const { media } = useMediaViewer();
  if (!media || media.kind !== "music") return <ViewerEmpty icon={Music} label="muziek" />;
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