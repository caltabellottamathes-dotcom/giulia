import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Film } from "lucide-react";
import { Image } from "@/components/ui/image";
import { IMAGES } from "@/lib/images";
import MediaStage from "@/system/panels/MediaStage";
import PlayTimeVoicePanel from "@/life/components/playtime/PlayTimeVoicePanel";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#b1bfc7";
const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";

const RELATED = [
  { label: "Mattia Chat", to: "/chat" },
  { label: "Memory", to: "/memory" },
  { label: "Approvals", to: "/approvals" },
];

/** PlayTimePage — de /playtime pagina. Eén functie: MattiaVoice. Lay-out
 *  spiegelt de Admin-pagina (heldenfoto links, glas-paneel rechts met editorial
 *  card). De zwevende Mattia voice-panel staat naast het editorial; de
 *  MediaStage schuift links in om dingen te tonen of toe te voegen. */
export default function PlayTimePage() {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [first, setFirst] = useState(true);
  useEffect(() => { const t = setTimeout(() => setFirst(false), 900); return () => clearTimeout(t); }, []);

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      {/* Hero photo — blijft open wanneer het glas-paneel opent */}
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
        <Image src={IMAGES.mattiaPlayTime} fittingType="fill" alt="" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Titel + relevante links — alleen wanneer geen stage open */}
      {!mediaOpen &&
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">LIFE → PLAYTIME</p>
          <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">Play time!</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {RELATED.map((r) =>
              <Link key={r.to} to={r.to} className="text-[11px] text-foreground/60 hover:text-foreground underline underline-offset-4 decoration-foreground/20 transition-colors">{r.label}</Link>
            )}
          </div>
        </motion.div>
      }

      {/* Glazen paneel — schuift naar links wanneer Media actief is */}
      <motion.div initial={{ x: "118%" }} animate={{ x: mediaOpen ? "-24vw" : 0 }} transition={{ duration: 0.7, ease: EASE, delay: first ? 0.15 : 0 }}
        className="absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55),-36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[15]"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
        {/* Linker glas-strook — media-toggle */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <button onClick={() => setMediaOpen((o) => !o)} title={mediaOpen ? "Media sluiten" : "Media openen"} className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mediaOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="flex flex-col gap-1 flex-1">
            <button onClick={() => setMediaOpen((o) => !o)} title="Media"
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${mediaOpen ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Film className="w-4 h-4" />
              {mediaOpen && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-white/80" />}
            </button>
          </div>
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">{mediaOpen ? "MEDIA" : "MATTIA"}</div>
        </div>

        {/* Inhoud-wrapper */}
        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          {/* MediaStage — op het glas, links */}
          <AnimatePresence>
            {mediaOpen &&
              <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
                className="absolute top-[134px] bottom-[70px] left-0 w-full lg:w-[24vw] z-10 overflow-hidden rounded-r-[20px]"
                style={{ background: "rgba(20,22,26,0.42)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 48px -20px rgba(0,0,0,0.5)" }}>
                <MediaStage />
              </motion.div>
            }
          </AnimatePresence>

          {/* Editorial card — schuift mee wanneer Media opent */}
          <motion.div animate={{ x: mediaOpen ? "24vw" : 0 }} transition={{ duration: 0.7, ease: EASE }} className="absolute inset-0 z-20">
            <div className="absolute inset-0 rounded-bl-[20px] rounded-r-none graph-paper flex overflow-hidden shadow-[-40px_8px_64px_-18px_rgba(0,0,0,0.55)]">
              {/* Editorial — links */}
              <div className="relative z-0 w-[56%] h-full flex flex-col overflow-y-auto no-scrollbar border-r" style={{ borderColor: GREY }}>
                <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">PlayTime</span> | mattia_voice_</p>
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
                  </div>

                  <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(34px, 3vw, 54px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
                    Talk to<br />yourself.<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
                  </h2>

                  <div className="ml-[80px] mt-8 space-y-2">
                    <p className="font-display font-medium tracking-[-0.05em] text-[12px]" style={{ color: BLACK }}>Bel Mattia. Denk hardop. Flirt, lach, dwaal af.</p>
                    <p className="font-body text-[12px] leading-[1.55]" style={{ color: INK }}>Dit is je speeltuin. Geen agenda, geen taken, geen optimalisatie — alleen jij en je eigen hoofd, met Mattia aan de lijn.</p>
                  </div>

                  <div className="flex-1 min-h-8" />

                  <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5" style={{ color: BLACK, fontSize: "clamp(24px, 1.9vw, 38px)" }}>
                    Bel Mattia.<br />Spreek vrij.<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: "#94925d", width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
                  </h3>

                  <div className="h-px w-full" style={{ background: "#d8dab3" }} />
                  <div className="flex items-center justify-between mt-5">
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">How it works</span> | now_</p>
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
                  </div>

                  <div className="mt-4 ml-[80px] space-y-3">
                    <p className="font-body text-[12px] leading-[1.55]" style={{ color: INK }}>1. Tik de bloem rechts om Mattia te bellen.</p>
                    <p className="font-body text-[12px] leading-[1.55]" style={{ color: INK }}>2. Upload iets (foto, doc) om het in het gesprek te delen.</p>
                    <p className="font-body text-[12px] leading-[1.55]" style={{ color: INK }}>3. Open Media om dingen te tonen of toe te voegen.</p>
                  </div>

                  <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
                    <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>No agenda. Just play.</p>
                  </div>
                </div>
              </div>

              {/* Rechts — leeg canvas waar de voice-panel bovenop zweeft */}
              <div className="relative z-10 flex-1 min-w-0 h-full" />
            </div>
          </motion.div>

          {/* Zwevende Mattia voice-panel — naast het editorial */}
          <PlayTimeVoicePanel onToggleMedia={() => setMediaOpen((o) => !o)} />
        </div>
      </motion.div>
    </div>
  );
}