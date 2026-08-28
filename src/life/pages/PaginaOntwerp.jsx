import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CircleDot, Wallet, ListChecks, Banknote, LineChart, HeartPulse, FileText, MessageSquare, Phone, Film } from "lucide-react";
import OntwerpWhiteCard from "./PaginaOntwerpCard";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";
import DocStage from "@/system/panels/DocStage";
import MediaStage from "@/system/panels/MediaStage";

const EASE = [0.16, 1, 0.3, 1];
const HERO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: CircleDot },
  { key: "PORTEFEUILLES", label: "Portefeuilles", icon: Wallet },
  { key: "LASTEN", label: "Lasten", icon: ListChecks },
  { key: "INKOMEN", label: "Inkomen", icon: Banknote },
  { key: "FORECAST", label: "Forecast", icon: LineChart },
  { key: "HEALTHY_MONEY", label: "Healthy Money", icon: HeartPulse },
  { key: "DOCUMENTEN", label: "Documenten", icon: FileText },
];

// Multi-functionele stages — het glaspaneel schuift links onder de kaart vandaan.
const STAGE_TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Phone },
  { key: "doc", label: "Document", icon: FileText },
  { key: "media", label: "Media", icon: Film },
];

export default function PaginaOntwerp() {
  const [tab, setTab] = useState("OVERVIEW");
  const [stage, setStage] = useState(null); // null | "chat" | "voice" | "doc" | "media"
  const isStage = stage !== null;
  const [closed, setClosed] = useState(false);

  // Toolbar (chat/phone) routeert naar dit paneel wanneer op Pagina-Ontwerp.
  useEffect(() => {
    const h = (e) => setStage(e.detail);
    window.addEventListener("giulia:ontwerp-stage", h);
    return () => window.removeEventListener("giulia:ontwerp-stage", h);
  }, []);

  const stageContent =
    stage === "chat" ? <ChatStage />
    : stage === "voice" ? <VoiceStage />
    : stage === "doc" ? <DocStage />
    : <MediaStage />;

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      {/* Hero photo — alleen in finance-modus */}
      {!isStage && (
        <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
          className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
          <img src={HERO} alt="" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
        </motion.div>
      )}

      {/* Titel — alleen in finance-modus */}
      {!isStage && (
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">LIFE → ONTWERP</p>
          <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">Pagina-Ontwerp</h1>
        </motion.div>
      )}

      {/* Glazen paneel — schuift naar links wanneer een stage actief is */}
      <motion.div initial={{ x: "118%" }} animate={{ x: closed ? "100%" : (isStage ? "-24vw" : 0) }} transition={{ duration: 0.7, ease: EASE }}
        className="absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[15]"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
        {/* Linker glas-strook — tabs */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <motion.button onClick={() => setClosed(c => !c)} title={closed ? "Paneel openen" : "Paneel sluiten"}
            animate={{ x: closed ? -80 : 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70 shrink-0">
            <motion.span animate={{ rotate: closed ? 0 : 180 }} transition={{ duration: 0.5, ease: EASE }} className="inline-flex">
              <ArrowLeft className="w-4 h-4" />
            </motion.span>
          </motion.button>
          <div className="flex flex-col gap-1 flex-1">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setStage(null); }} title={t.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${!isStage && tab === t.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <t.icon className="w-4 h-4" />
                {!isStage && tab === t.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            ))}
            <div className="h-px w-6 bg-foreground/15 my-2 mx-auto" />
            {STAGE_TABS.map((s) => (
              <button key={s.key} onClick={() => setStage(s.key)} title={s.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${isStage && stage === s.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <s.icon className="w-4 h-4" />
                {isStage && stage === s.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            ))}
          </div>
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">{isStage ? "MATTIA" : "LIFE · ONTWERP"}</div>
        </div>

        {/* Inhoud-wrapper — stage verschijnt links, witte kaart blijft staan */}
        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          {/* Stage-kolom — op het glas, links van de witte kaart */}
          <AnimatePresence>
            {isStage && (
              <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
                className="absolute top-[134px] bottom-[70px] left-0 w-full lg:w-[24vw] z-10 overflow-hidden">
                <button onClick={() => setStage(null)} className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Terug">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {stageContent}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Witte kaart — schuift tegen om op zijn plek te blijven staan */}
          <motion.div animate={{ x: isStage ? "24vw" : 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0 z-20">
            <AnimatePresence initial={false}>
              <OntwerpWhiteCard key={tab} tab={tab} />
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}