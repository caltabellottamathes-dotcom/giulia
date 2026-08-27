import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CircleDot, Wallet, ListChecks, Banknote, LineChart, HeartPulse, FileText, MessageSquare, Phone } from "lucide-react";
import OntwerpWhiteCard from "./PaginaOntwerpCard";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";

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

const STAGE_TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Phone },
];

export default function PaginaOntwerp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("OVERVIEW");
  const isStage = tab === "chat" || tab === "voice";
  useEffect(() => {
    const h = (e) => setTab(e.detail);
    window.addEventListener("giulia:ontwerp-stage", h);
    return () => window.removeEventListener("giulia:ontwerp-stage", h);
  }, []);
  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      {/* Hero photo — links, vast aan de bodem */}
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
        <img src={HERO} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Titel — achtergrondlaag (z-[2]), zodat witte kaart + schaduw erboven liggen */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">LIFE → ONTWERP</p>
        <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">Pagina-Ontwerp</h1>
      </motion.div>

      {/* Glazen paneel — korter: top blijft, bottom los van de bodem, eindigt op "The rest can wait." hoogte */}
      <motion.div initial={{ x: "118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[15]"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
        {/* Linker glas-strook — tabs */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <button onClick={() => navigate("/")} title="Terug naar dashboard" className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col gap-1 flex-1">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} title={t.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${tab === t.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <t.icon className="w-4 h-4" />
                {tab === t.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            ))}
            <div className="h-px w-6 bg-foreground/15 my-2 mx-auto" />
            {STAGE_TABS.map((s) => (
              <button key={s.key} onClick={() => setTab(s.key)} title={s.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${tab === s.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <s.icon className="w-4 h-4" />
                {tab === s.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            ))}
          </div>
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">LIFE · ONTWERP</div>
        </div>

        {/* Witte-kaart wrapper — steekt 56px boven en 70px onder het paneel uit (zweeft); per tab schuivend */}
        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          {isStage ? (
            <motion.div key={tab} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-0 overflow-hidden rounded-bl-[20px]">
              <button onClick={() => setTab("OVERVIEW")} className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Terug">
                <ArrowLeft className="h-4 w-4" />
              </button>
              {tab === "chat" ? <ChatStage /> : <VoiceStage />}
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              <OntwerpWhiteCard key={tab} tab={tab} />
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}