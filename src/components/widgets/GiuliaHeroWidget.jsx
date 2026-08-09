import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { ArrowUpRight, MessageSquare } from "lucide-react";

// Plak hier de URL van de Giulia-video (9:16). Zolang deze leeg is, tonen we
// de Giulia-portretfoto als fallback.
const GIULIA_VIDEO_URL = "";

/**
 * GiuliaHeroWidget — a tall 9:16 feature tile starring Giulia. Full-bleed
 * portrait with a glass footer: live status, big display wordmark, the latest
 * Giulia insight, and a one-tap "ask" action into the chat. A cool, human
 * anchor for the dashboard.
 */
export default function GiuliaHeroWidget() {
  const { openModule } = usePanel();
  const { data: insights } = useEntityList("Insight", { sort: "-created_date", limit: 1 });
  const latest = insights?.[0];

  return (
    <WidgetShell size="tall" radius="large" glass="liquid" className="!min-h-0">
      <div className="relative h-full flex flex-col">
        {/* Portrait */}
        <div className="relative flex-1 min-h-0 overflow-hidden bg-charcoal">
          {GIULIA_VIDEO_URL ? (
            <video src={GIULIA_VIDEO_URL} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <img src={IMAGES.giuliaConcierge} alt="Giulia" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/15 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-charcoal/40 backdrop-blur px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-ivory/85 font-semibold">Actief</span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-4 pt-3 bg-charcoal/35 backdrop-blur-md border-t border-white/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-sand font-semibold mb-1">Jouw assistent</p>
          <h3 className="text-[26px] font-display font-semibold tracking-[-0.02em] text-ivory leading-none">Giulia</h3>
          {latest && <p className="text-[11px] text-ivory/60 mt-2 line-clamp-2">{latest.title}</p>}
          <button
            onClick={() => openModule("chat")}
            className="mt-3 w-full inline-flex items-center justify-between rounded-xl bg-sand text-charcoal px-3.5 py-2.5 text-xs font-semibold hover:bg-sand/90 transition"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Stel een vraag
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}