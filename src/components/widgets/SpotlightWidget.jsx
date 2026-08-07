import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { ArrowUpRight } from "lucide-react";

/**
 * SpotlightWidget — bold image-led editorial tile with a rich color block.
 * Pure visual rhythm on the desktop; opens Projects.
 */
export default function SpotlightWidget() {
  const { openModule } = usePanel();

  return (
    <WidgetShell
      size="2x1"
      radius="large"
      depth={3}
      interactive
      onClick={() => openModule("projects")}
      style={{ animationDelay: "210ms" }}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* editorial image */}
        <img
          src={IMAGES.walkingChairs}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-ambient"
          style={{ filter: "saturate(1.05) contrast(1.04)" }}
        />
        {/* cobalt color block — rich, not pastel */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(108deg, hsl(var(--cobalt) / 0.86) 0%, hsl(var(--cobalt) / 0.5) 40%, hsl(var(--cobalt) / 0.12) 70%, transparent 100%)",
          }}
        />
        {/* ink vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />

        <div className="relative z-10 h-full p-6 lg:p-7 flex flex-col justify-between text-ivory">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.32em] text-ivory/70">Spotlight</p>
            <ArrowUpRight className="h-4 w-4 text-ivory/70" />
          </div>
          <div>
            <h3 className="font-display font-light text-[34px] lg:text-[44px] leading-[0.92] tracking-tight">
              Atelier
              <br />
              FW&nbsp;—&nbsp;26
            </h3>
            <p className="text-[12px] text-ivory/80 mt-3 max-w-[16rem] leading-relaxed">
              Lookbook shoot — donderdag in de studio. Giulia houdt de callender bij.
            </p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}