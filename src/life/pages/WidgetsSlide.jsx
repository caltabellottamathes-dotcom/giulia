import React from "react";
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

/** WidgetsSlide — iedere widget gekopieerd in de 7 standaard maten:
 *  16:9, 5:4, 3:2, 1:1, 2:3, 4:5, 9:16. 8 widgets × 7 maten = 56 tiles. */
const RATIOS = [
  { label: "16:9", value: "16 / 9" },
  { label: "5:4", value: "5 / 4" },
  { label: "3:2", value: "3 / 2" },
  { label: "1:1", value: "1 / 1" },
  { label: "2:3", value: "2 / 3" },
  { label: "4:5", value: "4 / 5" },
  { label: "9:16", value: "9 / 16" },
];

const WIDGETS = [
  { name: "Reminders", Comp: RemindersHomeWidget },
  { name: "Things to Handle", Comp: ThingsHandleWidget },
  { name: "Things I Love", Comp: ThingsLoveWidget },
  { name: "Dinner", Comp: DinnerWidget },
  { name: "Music", Comp: MusicWidget },
  { name: "Projects", Comp: ProjectsFocusWidget },
  { name: "Agenda", Comp: AgendaFocusWidget },
  { name: "WhatsApp", Comp: WhatsAppChatFocusWidget },
];

function RatioTile({ ratio, label, children }) {
  return (
    <div className="w-[260px] sm:w-[300px] shrink-0">
      <div className="relative w-full overflow-hidden rounded-2xl border border-foreground/10 bg-warm-white shadow-[0_18px_40px_-22px_rgba(0,0,0,0.35)]" style={{ aspectRatio: ratio.value }}>
        <div className="absolute inset-0 w-full h-full overflow-hidden">{children}</div>
        <span className="absolute top-2 left-2 z-10 rounded-full bg-foreground/80 text-ivory text-[9px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5">{ratio.label}</span>
      </div>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold text-charcoal/55">{label}</p>
    </div>
  );
}

export default function WidgetsSlide() {
  return (
    <div className="relative min-h-screen px-5 lg:px-10 py-8 pb-24">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img src={IMAGES.lifeDashBg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(235,234,229,0.74), rgba(235,234,229,0.88))" }} />
      </div>

      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-charcoal/60 hover:text-charcoal transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5 text-charcoal">Widget-slide · 56 widgets</h1>
      <p className="text-sm text-charcoal/55 mt-1 mb-10">
        Iedere widget in 7 standaard maten — 16:9, 5:4, 3:2, 1:1, 2:3, 4:5, 9:16.
      </p>

      <div className="space-y-12">
        {WIDGETS.map(({ name, Comp }) => (
          <section key={name}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-xl font-display font-semibold tracking-tight text-charcoal">{name}</h2>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/40">7 maten</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {RATIOS.map((r) => (
                <RatioTile key={r.label} ratio={r} label={`${name} · ${r.label}`}>
                  <Comp />
                </RatioTile>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}