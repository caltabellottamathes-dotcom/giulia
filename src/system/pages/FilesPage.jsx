import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, FolderOpen, ImageIcon, Film, Music, FileText,
  MessageSquare, Phone,
} from "lucide-react";
import FilesManager from "@/system/components/files/FilesManager";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";
import DocStage from "@/system/panels/DocStage";
import MediaStage from "@/system/panels/MediaStage";
import { IMAGES } from "@/lib/images";

const EASE = [0.16, 1, 0.3, 1];
const HERO_PHOTO = IMAGES.notebookStacked;

// Filter-tabs (soort bestand) op de glas-strook — de hoofdkaart toont de bibliotheek.
const TABS = [
  { key: "all", label: "Alles", icon: FolderOpen },
  { key: "image", label: "Foto's", icon: ImageIcon },
  { key: "video", label: "Video", icon: Film },
  { key: "music", label: "Audio", icon: Music },
  { key: "doc", label: "Docs", icon: FileText },
];

// Stages — multi-functionele schuifpanelen (chat / voice / doc / media).
const STAGE_TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Phone },
  { key: "doc", label: "Document", icon: FileText },
  { key: "media", label: "Media", icon: Film },
];

const RELATED = [
  { label: "Ingestion", to: "/ingest" },
  { label: "Knowledge", to: "/knowledge" },
  { label: "Approvals", to: "/approvals" },
  { label: "Search", to: "/search" },
];

export default function FilesPage() {
  const [tab, setTab] = useState("all");
  const [stage, setStage] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const isStage = panelOpen;
  const [first, setFirst] = useState(true);
  useEffect(() => { const t = setTimeout(() => setFirst(false), 900); return () => clearTimeout(t); }, []);

  // "Verzend naar GIULIA" vanuit FilesManager → open de chat-stage.
  const handleSendToGiulia = () => { setStage("chat"); setPanelOpen(true); };

  const stageContent =
    stage === "chat" ? <ChatStage /> :
    stage === "voice" ? <VoiceStage /> :
    stage === "doc" ? <DocStage /> :
    <MediaStage />;

  const tabTitle = "Files";

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      {/* Hero foto — blijft open wanneer het glaspaneel opent */}
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
        <img src={HERO_PHOTO} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Titel + relevante links — alleen wanneer geen stage actief is */}
      {!isStage &&
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/55 font-semibold">SYSTEM → FILES</p>
          <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">{tabTitle}</h1>
          <p className="text-[12px] text-foreground/55 max-w-[260px] mt-1">
            Jouw volledige bibliotheek — mappen, verplaatsen, hernoemen, delen met GIULIA.
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {RELATED.map((r) =>
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
        {/* Linker glas-strook — filter-tabs + stage-tabs */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <button onClick={() => setPanelOpen((o) => !o)} title={isStage ? "Paneel sluiten" : "Paneel openen"} className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isStage ? "rotate-180" : ""}`} />
          </button>
          <div className="flex flex-col gap-1 flex-1">
            {TABS.map((t) =>
              <button key={t.key} onClick={() => { setTab(t.key); setPanelOpen(false); }} title={t.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${!isStage && tab === t.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <t.icon className="w-4 h-4" />
                {!isStage && tab === t.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
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
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">{isStage ? "GIULIA" : "Files"}</div>
        </div>

        {/* Inhoud-wrapper — stage verschijnt links, witte kaart blijft staan */}
        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          {/* Stage-kolom — media/doc/chat/voice stage op het glas, links van de kaart */}
          <AnimatePresence>
            {isStage &&
              <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
                className="absolute top-[134px] bottom-[70px] left-0 w-full lg:w-[24vw] z-10 overflow-hidden rounded-l-[20px] rounded-r-none"
                style={{
                  background: "rgba(28, 30, 38, 0.26)",
                  backdropFilter: "blur(28px) saturate(1.3)",
                  WebkitBackdropFilter: "blur(28px) saturate(1.3)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 18px 48px -20px rgba(0,0,0,0.4)",
                }}>
                {stageContent}
              </motion.div>
            }
          </AnimatePresence>

          {/* Witte kaart — schuift tegen om op zijn plek te blijven staan */}
          <motion.div animate={{ x: isStage ? "24vw" : 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0 z-20">
            <AnimatePresence initial={false}>
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}
                className="h-full w-full bg-card rounded-l-[24px] overflow-hidden">
                <FilesManager onSendToGiulia={handleSendToGiulia} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}