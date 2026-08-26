import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RemindersHomeWidget from "@/life/widgets/new/RemindersHomeWidget";
import ThingsHandleWidget from "@/life/widgets/new/ThingsHandleWidget";
import ThingsLoveWidget from "@/life/widgets/new/ThingsLoveWidget";
import DinnerWidget from "@/life/widgets/new/DinnerWidget";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import ProjectsFocusWidget from "@/focus/widgets/new/ProjectsFocusWidget";
import AgendaFocusWidget from "@/focus/widgets/new/AgendaFocusWidget";
import WhatsAppChatFocusWidget from "@/focus/widgets/new/WhatsAppChatFocusWidget";
import { IMAGES } from "@/lib/images";
import MasonryGrid from "@/system/widgets/MasonryGrid";

/** WidgetsSlide — kopie van /widgets-life (zonder 01 SOCIAL LIFE + 06 HOW I'M
 *  DOING), met 03 WHAT I'M BUILDING, 07 WHAT'S HAPPENING en 02 WHO'S TEXTING uit
 *  /widgets-focus. Widgets renderen op exact dezelfde maat als het dashboard:
 *  25-koloms grid, scale 0.8, fitHeight, WIDGET_SPAN-verhoudingen. */
export default function WidgetsSlide() {
  const [fitH, setFitH] = useState(0);
  useEffect(() => {
    const calc = () => setFitH(window.innerHeight - 180);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <div className="relative min-h-screen px-5 lg:px-10 py-8 pb-24">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img src={IMAGES.lifeDashBg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(235,234,229,0.74), rgba(235,234,229,0.88))" }} />
      </div>

      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-charcoal/60 hover:text-charcoal transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5 text-charcoal">Widget-slide</h1>
      <p className="text-sm text-charcoal/55 mt-1 mb-8">
        LIFE-widget-skelet met Focus-toevoegingen — ridge-sky, pistase, beton, urgent.
      </p>

      <MasonryGrid
        className="max-w-[1280px] xl:max-w-[1500px] min-h-[52vh]"
        gap={24}
        spans={[10, 5, 10, 10, 5, 10, 10, 10]}
        scale={0.8}
        columnTiers={[[0, 1], [640, 6], [1024, 12], [1280, 25]]}
        fitHeight={fitH}
      >
        <RemindersHomeWidget />
        <ThingsHandleWidget />
        <ThingsLoveWidget />
        <DinnerWidget />
        <MusicWidget />
        <ProjectsFocusWidget />
        <AgendaFocusWidget />
        <WhatsAppChatFocusWidget />
      </MasonryGrid>
    </div>
  );
}