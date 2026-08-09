import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { Video } from "lucide-react";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";

/**
 * GiuliaVideoWidget — a vertical (portrait) tile that plays Giulia's intro
 * video fully visible (object-contain), part of the "je dag" core group.
 */
export default function GiuliaVideoWidget() {
  return (
    <WidgetShell size="1x2" radius="large" glass="metal" className="min-h-[440px]">
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <WidgetHeader icon={Video} label="Giulia · intro" />
        </div>
        <div className="flex-1 min-h-0 px-3 pb-3">
          <div className="h-full w-full rounded-[20px] overflow-hidden bg-black flex items-center justify-center">
            <video
              src={INTRO_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}