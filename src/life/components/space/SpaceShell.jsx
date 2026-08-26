import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * SpaceShell — de 'Space page'-choreografie voor één pagina.
 * Achtergrondfoto schuift rechts, glas-paneel rolt vanaf de rechterrand naar binnen
 * (stopt op 2/3), paginahoofdfoto schuift vanaf links in (zelfde formaat als paneel).
 * Witte zwevende kaart over het glas-paneel met links een glas-strook (tabs + nav).
 */
export default function SpaceShell({ bgImage, heroImage, eyebrow, title, tabs, activeTab, onTab, navInfo, recap, children, onAdd, addLabel = "Toevoegen" }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-hidden bg-warm-white z-[1]">
      {/* Achtergrond — wit */}
      <div className="absolute inset-0 bg-warm-white" />

      {/* Hero photo — schuift vanaf links in,zelfde hoogte als paneel (desktop) */}
      <motion.div
        initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[16%] h-[68%] w-[34%] overflow-hidden rounded-[24px] shadow-[0_30px_70px_-28px_rgba(0,0,0,0.45)] z-[5]"
      >
        <img src={heroImage} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-charcoal/10" />
      </motion.div>

      {/* Glass panel — rolt vanaf de rechterrand naar binnen, stopt op 2/3 (rechts), geen rechterhoeken */}
      <motion.div
        initial={{ x: "118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="absolute right-0 top-0 bottom-0 w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_40px_90px_-30px_rgba(0,0,0,0.4)] flex z-[15]"
      >
        {/* Linker glas-strook — tabs + nav-info */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] shrink-0 border-r border-foreground/10">
          <button onClick={() => navigate("/")} title="Terug naar dashboard" className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col gap-1.5 flex-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => onTab(t.key)} title={t.label} className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${activeTab === t.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <t.icon className="w-4 h-4" />
                {activeTab === t.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            ))}
          </div>
          <div className="text-[8px] uppercase tracking-[0.22em] text-foreground/40 [writing-mode:vertical-rl] rotate-180">{navInfo}</div>
        </div>

        {/* Witte zwevende kaart — laat linker glas-strook zichtbaar */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
          className="relative flex-1 rounded-none bg-warm-white flex flex-col overflow-hidden border-l border-foreground/8 shadow-[-10px_0_30px_-20px_rgba(0,0,0,0.18)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 lg:px-7 py-4 border-b border-foreground/8">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">{eyebrow}</p>
              <h1 className="text-2xl lg:text-[28px] font-display font-semibold tracking-[-0.02em] text-foreground truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="lg:hidden flex gap-1 overflow-x-auto max-w-[44vw] no-scrollbar pb-1">
                {tabs.map((t) => (
                  <button key={t.key} onClick={() => onTab(t.key)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeTab === t.key ? "bg-charcoal text-ivory" : "bg-foreground/5 text-muted-foreground"}`}>
                    <t.icon className="w-3.5 h-3.5" />{t.label}
                  </button>
                ))}
              </div>
              {onAdd && (
                <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-4 py-2 text-xs font-semibold hover:bg-charcoal/90 transition shrink-0">
                  <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{addLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* Body — links recap, rechts widget-stapel */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <div className="lg:w-[42%] xl:w-[40%] shrink-0 lg:border-r border-foreground/8 overflow-y-auto px-5 lg:px-7 py-6">
              {recap}
            </div>
            <div className="flex-1 overflow-y-auto px-5 lg:px-7 py-6 space-y-4">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}