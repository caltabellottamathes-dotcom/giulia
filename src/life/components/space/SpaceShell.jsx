import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * SpaceShell — de 'Space page'-choreografie voor één pagina.
 * Achtergrondfoto schuift rechts, glas-paneel rolt vanaf de rechterrand naar binnen
 * (stopt op 2/3), paginahoofdfoto schuift vanaf links in (zelfde formaat als paneel).
 * Witte zwevende kaart over het glas-paneel met links een glas-strook (tabs + nav).
 */
export default function SpaceShell({ bgImage, heroImage, eyebrow, title, tabs, activeTab, onTab, navInfo, recap, children, onAdd, addLabel = "Toevoegen", cardHeader }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-hidden z-[1]">
      {/* Titel + Toevoegen — op het dashboard (links), buiten het paneel */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }} className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[20] flex-col gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold mb-1">{eyebrow}</p>
          <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">{title}</h1>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="inline-flex items-center gap-1.5 self-start rounded-full bg-plum text-ivory px-5 py-2.5 text-xs font-semibold hover:bg-plum/90 transition shadow-[0_14px_34px_-14px_rgba(0,0,0,0.5)]">
            <Plus className="w-3.5 h-3.5" /> {addLabel}
          </button>
        )}
      </motion.div>

      {/* Hero photo — schuift vanaf links in,zelfde hoogte als paneel (desktop) */}
      <motion.div
        initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[18%] bottom-0 w-[34%] overflow-hidden rounded-l-none rounded-r-[24px] z-[5]"
      >
        <img src={heroImage} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Glass panel — rolt vanaf de rechterrand naar binnen, stopt op 2/3 (rechts), geen rechterhoeken */}
      <motion.div
        initial={{ x: "118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="absolute right-0 top-0 bottom-[2.5%] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -20px_0_70px_-34px_rgba(0,0,0,0.32)] flex z-[15]"
      >
        {/* Linker glas-strook — tabs + nav-info */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] shrink-0 relative z-30">
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

        {/* Witte kaart — EÉN element (editorial + header + widgets) dat als
            geheel wegschuift bij tab-wissel; de nieuwe tab-kaart schuift in.
            De slot doet de eenmalige intree; AnimatePresence swapped de kaarten. */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
          className="relative flex-1 ml-[2.5%] min-w-0"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={activeTab}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute inset-0 rounded-l-[20px] rounded-r-none bg-warm-white flex flex-col overflow-hidden shadow-[-28px_24px_64px_-22px_rgba(0,0,0,0.42)] z-10"
            >
              {/* Mobile tabs + add (desktop titel/toevoegen zitten buiten het paneel) */}
              <div className="lg:hidden flex items-center gap-2 px-5 pt-4 pb-3 overflow-x-auto no-scrollbar">
                <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
                  {tabs.map((t) => (
                    <button key={t.key} onClick={() => onTab(t.key)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeTab === t.key ? "bg-plum text-ivory" : "bg-foreground/5 text-muted-foreground"}`}>
                      <t.icon className="w-3.5 h-3.5" />{t.label}
                    </button>
                  ))}
                </div>
                {onAdd && (
                  <button onClick={onAdd} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-plum text-ivory px-3.5 py-1.5 text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" />{addLabel}
                  </button>
                )}
              </div>

              {/* Full-width editorial header */}
              {cardHeader && (
                <div className="w-full shrink-0">{cardHeader}</div>
              )}

              {/* Body — links editorial (breder), rechts widget-stapel die er iets boven zweeft */}
              <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                <div className="lg:w-[46%] xl:w-[44%] shrink-0 overflow-y-auto px-5 lg:px-7 pt-4 pb-6">
                  {recap}
                </div>
                <div className="flex-1 overflow-visible px-5 lg:px-7 py-6 space-y-4 lg:-ml-8 relative z-20">
                  {children}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}