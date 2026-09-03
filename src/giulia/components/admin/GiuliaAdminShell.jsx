import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Activity as ActivityIcon, Brain, Lightbulb, Sparkles, Bot, HelpCircle, MessageSquare, Phone, FileText, Film } from "lucide-react";
import { Image } from "@/components/ui/image";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";
import DocStage from "@/system/panels/DocStage";
import MediaStage from "@/system/panels/MediaStage";
import EditorialCard from "./EditorialCard";

const EASE = [0.16, 1, 0.3, 1];

/** De Giulia-pagina's in de rail — zelfde systeem als de Admin-tabs. */
export const GIULIA_PAGES = [
  { key: "approvals", label: "Approvals", to: "/approvals", icon: BadgeCheck },
  { key: "activity", label: "Activity", to: "/activity", icon: ActivityIcon },
  { key: "memory", label: "Memory", to: "/memory", icon: Brain },
  { key: "insights", label: "Insights", to: "/insights", icon: Lightbulb },
  { key: "updates", label: "Meanwhile", to: "/updates", icon: Sparkles },
  { key: "agents", label: "Agents", to: "/agents", icon: Bot },
  { key: "wants-to-know", label: "Wants to know", to: "/wants-to-know", icon: HelpCircle },
];

const STAGE_TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Phone },
  { key: "doc", label: "Document", icon: FileText },
  { key: "media", label: "Media", icon: Film }];

/**
 * GiuliaAdminShell — exact het Admin LIFE-pagina-ontwerp (hero links, titel-
 * blok, glazen paneel met icon-rail + stage-kolom, witte graph-paper kaart).
 * `card` bevat de editorial-kolom (title1/title2/metaLine/items…), `children`
 * is de functionele inhoud rechts in de witte kaart.
 */
export default function GiuliaAdminShell({ pageKey, eyebrow, title, related = [], hero, card, children }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("chat");
  const [panelOpen, setPanelOpen] = useState(false);
  const isStage = panelOpen;
  const [first, setFirst] = useState(true);
  useEffect(() => { const t = setTimeout(() => setFirst(false), 900); return () => clearTimeout(t); }, []);

  // Toolbar (chat/phone) routeert naar de stage-kolom.
  useEffect(() => {
    const h = (e) => { setStage(e.detail); setPanelOpen(true); };
    window.addEventListener("giulia:ontwerp-stage", h);
    return () => window.removeEventListener("giulia:ontwerp-stage", h);
  }, []);

  const stageContent =
    stage === "chat" ? <ChatStage /> :
    stage === "voice" ? <VoiceStage /> :
    stage === "doc" ? <DocStage /> : <MediaStage />;

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      {/* Hero photo — blijft open wanneer het glaspaneel opent */}
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
      className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5] bg-charcoal">
        {hero && <Image src={hero} alt="" className="h-full w-full block" fittingType="fill" />}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Titel + relevante links — alleen zonder actieve stage */}
      {!isStage &&
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
      className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">{eyebrow}</p>
        <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">{title}</h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          <Link to="/" className="text-[11px] text-foreground/60 hover:text-foreground underline underline-offset-4 decoration-foreground/20 transition-colors">Dashboard</Link>
          {related.map((r) =>
            <Link key={r.to} to={r.to} className="text-[11px] text-foreground/60 hover:text-foreground underline underline-offset-4 decoration-foreground/20 transition-colors">
              {r.label}
            </Link>
          )}
        </div>
      </motion.div>
      }

      {/* Glazen paneel — schuift naar links wanneer een stage actief is */}
      <motion.div initial={{ x: "118%" }} animate={{ x: isStage ? "-24vw" : 0 }} transition={{ duration: 0.7, ease: EASE, delay: first ? 0.15 : 0 }}
      className="absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[15]"
      style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
        {/* Linker glas-strook — pagina-nav + stages */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <button onClick={() => setPanelOpen((o) => !o)} title={isStage ? "Paneel sluiten" : "Paneel openen"} className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isStage ? "rotate-180" : ""}`} />
          </button>
          <div className="flex flex-col gap-1 flex-1">
            {GIULIA_PAGES.map((p) =>
              <button key={p.key} onClick={() => navigate(p.to)} title={p.label}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${!isStage && p.key === pageKey ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <p.icon className="w-4 h-4" />
                {!isStage && p.key === pageKey && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            )}
            <div className="h-px w-6 bg-foreground/15 my-2 mx-auto" />
            {STAGE_TABS.map((s) =>
              <button key={s.key} onClick={() => { setStage(s.key); setPanelOpen(true); }} title={s.label}
              className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${isStage && stage === s.key ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <s.icon className="w-4 h-4" />
                {isStage && stage === s.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-white/80" />}
              </button>
            )}
          </div>
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">{isStage ? "MATTIA" : "GIULIA · GIULIA"}</div>
        </div>

        {/* Inhoud-wrapper — stage verschijnt links, witte kaart schuift mee */}
        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          <AnimatePresence>
            {isStage &&
            <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
            className="absolute top-[134px] bottom-[70px] left-0 w-full lg:w-[24vw] z-10 overflow-hidden rounded-l-[20px] rounded-r-none"
            style={{ background: "rgba(20, 28, 33, 0.22)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(177,190,198,0.18)", boxShadow: "0 18px 48px -20px rgba(0,0,0,0.36)" }}>
              {stageContent}
            </motion.div>
            }
          </AnimatePresence>

          <motion.div animate={{ x: isStage ? "24vw" : 0 }} transition={{ duration: 0.7, ease: EASE }}
          className="absolute inset-0 z-20">
            <EditorialCard {...(card || {})}>{children}</EditorialCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}