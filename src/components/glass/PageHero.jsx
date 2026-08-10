import React from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { ArrowLeft } from "lucide-react";

/**
 * PageHero — bold, editorial full-bleed header for every app page (LEVEL 03 · Space).
 * A "Terug" control sits above the hero to move back to the previous screen
 * (or home if there is no history). Large display title, iconographic badge,
 * eyebrow label and an ivory subtitle over a darkened branding photo.
 */
const HERO_IMG = {
  email: IMAGES.portraitBoot,
  tasks: IMAGES.feetChairs,
  projects: IMAGES.walkChairsHigh,
  agenda: IMAGES.walkChairsBeach,
  planning: IMAGES.loungeChairs,
  whatsapp: IMAGES.stilettoHead,
  knowledge: IMAGES.chairWater,
  documents: IMAGES.chairsScattered,
  people: IMAGES.portraitThinking,
  approvals: IMAGES.leanChair,
  insights: IMAGES.feetChair,
  memory: IMAGES.loungeChairs,
  activity: IMAGES.topDownWalk,
  chat: IMAGES.portraitBootFace,
  voice: IMAGES.portraitBootFace,
  integrations: IMAGES.sittingChairs,
  settings: IMAGES.walkingChairs,
  profile: IMAGES.portraitBootHands,
  search: IMAGES.topDownWalk,
};

export default function PageHero({ page, image, icon: Icon, eyebrow = "Space", title, subtitle, actions, showBack = true }) {
  const navigate = useNavigate();
  const src = image || HERO_IMG[page] || IMAGES.walkingChairs;
  const back = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  return (
    <>
      {showBack && (
        <button
          onClick={back}
          className="group inline-flex items-center gap-2 mb-4 text-[12px] font-medium text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Terug"
        >
          <span className="h-6 w-6 rounded-full glass-1 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          Terug
        </button>
      )}
      <div className="relative h-40 lg:h-48 overflow-hidden rounded-[24px] mb-5 float-shadow">
        <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/55 to-charcoal/25" />
        <div className="relative h-full flex items-end p-5 lg:p-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-2.5">
              {Icon && (
                <span className="h-9 w-9 rounded-2xl glass-1 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-ivory" strokeWidth={1.5} />
                </span>
              )}
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">{eyebrow}</p>
            </div>
            <h1 className="text-3xl lg:text-[40px] font-display font-bold text-ivory leading-none tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-ivory/60 mt-2">{subtitle}</p>}
          </div>
        </div>
      </div>
      {actions && <div className="flex items-center justify-end gap-2 mb-5">{actions}</div>}
    </>
  );
}