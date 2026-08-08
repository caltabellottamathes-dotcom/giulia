import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import FloatingPanel from "@/components/glass/FloatingPanel";
import ChatInterface from "@/components/chat/ChatInterface";
import { IMAGES } from "@/lib/images";
import { Sparkles, Play } from "lucide-react";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";

const PILLS = ["Wat staat er vandaag?", "Openstaande taken?", "Check mijn email"];

/**
 * GiuliaWidget — the concierge anchor. Contains the live chat interface with
 * Giulia plus quick pill prompts; the intro video opens in a popup on demand.
 */
export default function GiuliaWidget() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <WidgetShell size="2x2" radius="large" glass="opaque" className="min-h-[520px]">
        <div className="p-5 lg:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <WidgetHeader icon={Sparkles} label="Giulia · concierge" />
            <button
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 border border-ivory/15 text-ivory px-3 py-1.5 text-[11px] font-semibold hover:bg-ivory/15 transition"
            >
              <Play className="h-3 w-3" /> Intro
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <img src={IMAGES.giuliaConcierge} alt="Giulia" className="h-11 w-11 rounded-full object-cover border border-ivory/20 shrink-0" />
            <div>
              <p className="text-sm font-display font-semibold text-ivory leading-none">Praat met Giulia</p>
              <p className="text-[11px] text-ivory/55 mt-1.5">Je digitale assistent — vraag me anything</p>
            </div>
          </div>

          {/* Live chat on a light inset card for readability */}
          <div className="flex-1 min-h-0 rounded-2xl bg-card border border-charcoal/10 p-2.5">
            <ChatInterface threadId="widget-concierge" suggestions={PILLS} className="h-full" />
          </div>
        </div>
      </WidgetShell>

      <FloatingPanel open={showVideo} onClose={() => setShowVideo(false)} position="center" level={4} showOverlay>
        <div className="relative aspect-video w-[min(86vw,820px)] rounded-[24px] overflow-hidden bg-charcoal">
          <video src={INTRO_VIDEO} autoPlay controls playsInline loop className="h-full w-full object-cover" />
        </div>
      </FloatingPanel>
    </>
  );
}