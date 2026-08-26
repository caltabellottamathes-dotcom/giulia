import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * SpaceShell (ManagePanel) — de 'Space page'-choreografie.
 * Witte achtergrond. De paginahoofdfoto rolt vanaf links in (rotateY + schuif).
 * Het ManagePanel schuift vanaf de rechterrand naar binnen — flush rechts,
 * zelfde formaat/hoogte als het ModulePanel (760px), rechte rechterhoeken,
 * glas dat zweeft over de foto heen. De witte inhoudskaart glijdt daarna mee in.
 */
export default function SpaceShell({ heroImage, eyebrow, title, tabs, activeTab, onTab, recap, children, onAdd, addLabel = "Toevoegen" }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-hidden bg-warm-white z-[1]" style={{ perspective: 1800 }}>
      {/* Hero photo — rolt vanaf links in, vervaagt naar wit rechts onder het paneel */}
      <motion.div
        initial={{ x: "6%", rotateY: 68, opacity: 0 }}
        animate={{ x: "0%", rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{ transformOrigin: "left center" }}
        className="absolute inset-0"
      >
        <img src={heroImage} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warm-white/0 to-warm-white" />
      </motion.div>

      {/* ManagePanel — flush rechts, 760px, volledige hoogte, rechte rechterhoeken, zweeft over de foto */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ duration: 0.78, ease: EASE }}
        className="absolute right-0 top-0 bottom-0 w-full lg:w-[760px] glass-3 rounded-l-[28px] rounded-r-none float-shadow flex flex-col overflow-hidden"
      >
        <div className="h-[3px] w-full shrink-0 bg-olive/60" />

        {/* Header — glijdt mee in met het paneel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.4 }}
          className="px-6 lg:px-8 pt-6 pb-4 shrink-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">{eyebrow}</p>
              <h1 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigate("/")} title="Terug naar dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-full glass-button text-ivory/80 hover:text-ivory transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              {onAdd && (
                <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition">
                  <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">{addLabel}</span>
                </button>
              )}
            </div>
          </div>
          {/* Tabs — body-navigatie */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => onTab(t.key)} className={`text-[12px] font-medium tracking-[0.04em] transition-colors ${activeTab === t.key ? "text-ivory underline underline-offset-[6px] decoration-ivory/60" : "text-ivory/45 hover:text-ivory/80"}`}>{t.label}</button>
            ))}
          </div>
        </motion.div>

        <div className="mx-6 lg:mx-8 h-px bg-white/10 shrink-0" />

        {/* Witte inhoudskaart — glijdt mee in, zweeft in het glas over de foto */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.62, ease: EASE, delay: 0.5 }}
          className="flex-1 min-h-0 m-4 rounded-[20px] bg-warm-white float-shadow flex flex-col overflow-hidden border border-foreground/8"
        >
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <div className="lg:w-[42%] xl:w-[40%] shrink-0 lg:border-r border-foreground/8 overflow-y-auto px-5 lg:px-7 py-6">{recap}</div>
            <div className="flex-1 overflow-y-auto px-5 lg:px-7 py-6 space-y-4">{children}</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}