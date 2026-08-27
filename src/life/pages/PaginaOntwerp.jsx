import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

// Multi-functionele stages — het paneel schuift naar links uit en toont deze.
const STAGE_TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Phone },
  { key: "doc", label: "Document", icon: FileText },
  { key: "media", label: "Media", icon: Film },
];

const STAGE_WIDTH = { chat: 480, voice: 720, doc: 720, media: 720 };

export default function PaginaOntwerp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("OVERVIEW");
  const isStage = ["chat", "voice", "doc", "media"].includes(tab);

  // Toolbar (chat/phone) routeert naar dit paneel wanneer op Pagina-Ontwerp.
  useEffect(() => {
    const h = (e) => setTab(e.detail);
    window.addEventListener("giulia:ontwerp-stage", h);
    return () => window.removeEventListener("giulia:ontwerp-stage", h);
  }, []);

  const stageContent =
    tab === "chat" ? <ChatStage />
    : tab === "voice" ? <VoiceStage />
    : tab === "doc" ? <DocStage />
    : <MediaStage />;
  const stageWidth = STAGE_WIDTH[tab] || 720;

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

      <AnimatePresence>
        {isStage ? (
          /* Multi-functioneel paneel — schuift naar LINKS uit */
          <motion.div key="stage" initial={{ x: "-118%" }} animate={{ x: 0 }} exit={{ x: "-118%" }} transition={{ duration: 0.6, ease: EASE }}
            className="absolute left-0 top-[78px] bottom-[94px] w-full glass-2 rounded-r-[32px] rounded-l-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), 36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[20] overflow-hidden"
            style={{ maxWidth: stageWidth, backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
            {/* Mini-strook — terug + stage-tabs */}
            <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[72px] mb-[24px] shrink-0 relative z-30">
              <button onClick={() => setTab("OVERVIEW")} title="Terug naar overzicht" className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1 flex-1">
                {STAGE_TABS.map((s) => (
                  <button key={s.key} onClick={() => setTab(s.key)} title={s.label}
                    className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${tab === s.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                    <s.icon className="w-4 h-4" />
                    {tab === s.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
                  </button>
                ))}
              </div>
              <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">MATTIA</div>
            </div>

            {/* Stage-inhoud */}
            <div className="relative flex-1 min-w-0 h-full">
              {stageContent}
            </div>
          </motion.div>
        ) : (
          /* Finance glazen paneel — schuift van rechts in */
          <motion.div key="finance" initial={{ x: "118%" }} animate={{ x: 0 }} exit={{ x: "118%" }} transition={{ duration: 0.7, ease: EASE }}
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

            {/* Witte-kaart wrapper — steekt boven en onder uit; per tab schuivend */}
            <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
              <AnimatePresence initial={false}>
                <OntwerpWhiteCard key={tab} tab={tab} />
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}