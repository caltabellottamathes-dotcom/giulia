import React from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { useImageOverrides } from "@/lib/useImageOverrides";
import { ArrowLeft } from "lucide-react";

/**
 * PageHero — bold, editorial full-bleed header for every app page (LEVEL 03 · Space).
 * A "Terug" control sits above the hero to move back to the previous screen
 * (or home if there is no history). Large display title, iconographic badge,
 * eyebrow label and an ivory subtitle over a darkened branding photo.
 */
export const HERO_IMG = {
  email: IMAGES.focusMail,
  tasks: IMAGES.focusTodoNew,
  projects: IMAGES.focusBuild,
  agenda: IMAGES.focusHappening,
  planning: IMAGES.loungeChairs,
  whatsapp: IMAGES.focusTodo,
  knowledge: IMAGES.chairWater,
  documents: IMAGES.chairsScattered,
  people: IMAGES.focusPeople,
  approvals: IMAGES.wWaitingOnYou,
  notifications: IMAGES.feetChair,
  insights: IMAGES.wWhatIveNoticed,
  memory: IMAGES.loungeChairs,
  activity: IMAGES.topDownWalk,
  chat: IMAGES.portraitBootFace,
  voice: IMAGES.wHotline,
  timetracker: IMAGES.focusTime,
  integrations: IMAGES.sittingChairs,
  settings: IMAGES.walkingChairs,
  profile: IMAGES.portraitBootHands,
  search: IMAGES.topDownWalk,
  wantstoknow: IMAGES.wWantsToKnow,
};

export default function PageHero({ page, image, icon: Icon, eyebrow = "Space", title, subtitle, actions, showBack = true }) {
  const navigate = useNavigate();
  const { overrides } = useImageOverrides();
  const src = overrides[page] || image || HERO_IMG[page] || IMAGES.walkingChairs;
  const back = () => navigate("/");
  return (
    <>
      {/* Fixed full-bleed hero — sits behind the transparent app header,
          matching the project pages and Home. */}
      <div className="fixed top-0 left-0 right-0 z-0 h-56 lg:h-72 overflow-hidden lg:left-10 lg:right-10 lg:rounded-[24px]">
        <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/10 to-transparent" />
        {showBack && (
          <button
            onClick={back}
            className="absolute top-16 left-5 lg:left-10 z-10 inline-flex items-center gap-2 rounded-full glass-1 px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ivory/15 transition-colors"
            aria-label="Terug"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Terug
          </button>
        )}
        <div className="relative h-full flex items-end p-5 lg:p-10 pb-6 lg:pb-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-2.5">
              {Icon && (
                <span className="h-9 w-9 rounded-2xl glass-1 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-ivory" strokeWidth={1.5} />
                </span>
              )}
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/80 font-semibold">{eyebrow}</p>
            </div>
            <h1 className="text-3xl lg:text-[40px] font-display font-bold text-ivory leading-none tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-ivory/70 mt-2">{subtitle}</p>}
          </div>
        </div>
      </div>
      {/* Spacer — pushes page content below the fixed hero (hero H − header h). */}
      <div className="-mt-6 lg:-mt-8 h-[168px] lg:h-[232px]" aria-hidden />
      {actions && <div className="flex items-center justify-end gap-2 mb-5">{actions}</div>}
    </>
  );
}