import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/**
 * AdminVideoHero — dashboard-stijl hero voor PersonalAdmin: titel links,
 * een looping video-kaart rechts die van rechts inschuift.
 */
export default function AdminVideoHero({ videoSrc, icon: Icon, eyebrow = "Space", title, subtitle, actions, showBack = true }) {
  const navigate = useNavigate();
  const back = () => navigate("/");
  return (
    <div className="relative">
      {showBack && (
        <button
          onClick={back}
          className="inline-flex items-center gap-2 rounded-full glass-1 px-3 py-1.5 text-[12px] font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors mb-3"
          aria-label="Terug"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Terug
        </button>
      )}
      <div className="grid lg:grid-cols-2 gap-4 items-stretch">
        {/* Links — titelblok */}
        <div className="flex flex-col justify-between min-h-[200px] lg:min-h-[240px] py-2">
          <div className="flex items-center gap-2.5 mb-4">
            {Icon && (
              <span className="h-9 w-9 rounded-2xl glass-1 flex items-center justify-center">
                <Icon className="h-5 w-5 text-foreground/80" strokeWidth={1.5} />
              </span>
            )}
            <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/60 font-semibold">{eyebrow}</p>
          </div>
          <div>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground leading-[0.95] tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-foreground/65 mt-3 max-w-md">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 mt-5">{actions}</div>}
        </div>

        {/* Rechts — video-kaart, schuift van rechts in */}
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] overflow-hidden min-h-[200px] lg:min-h-[260px] shadow-[0_30px_60px -28px_rgba(0,0,0,0.35)]"
        >
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/45 via-charcoal/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}