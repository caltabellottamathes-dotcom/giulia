import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid, ListChecks, Milestone, Gavel, FileText, StickyNote, Sparkles, MessageSquare, Phone, Film } from "lucide-react";
import ProjectDetailCard from "@/focus/components/projects/ProjectDetailCard";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";
import DocStage from "@/system/panels/DocStage";
import MediaStage from "@/system/panels/MediaStage";
import ProjectEditorPanel from "@/focus/components/projects/ProjectEditorPanel";
import MattiaSlideOver from "@/giulia/panels/MattiaSlideOver";

const EASE = [0.16, 1, 0.3, 1];
const HERO_VIDEO = "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/cbb9adc9f_Mattia_into.mp4";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: LayoutGrid },
  { key: "TASKS", label: "Taken", icon: ListChecks },
  { key: "MILESTONES", label: "Milestones", icon: Milestone },
  { key: "DECISIONS", label: "Beslissingen", icon: Gavel },
  { key: "FILES", label: "Bestanden", icon: FileText },
  { key: "NOTES", label: "Notities", icon: StickyNote },
  { key: "GIULIA", label: "Giulia", icon: Sparkles },
];

const STAGE_TABS = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "voice", label: "Voice", icon: Phone },
  { key: "doc", label: "Document", icon: FileText },
  { key: "media", label: "Media", icon: Film },
];

export default function ProjectsStudioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("OVERVIEW");
  const [stage, setStage] = useState("chat");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [mattiaOpen, setMattiaOpen] = useState(false);
  const isStage = panelOpen;
  const [first, setFirst] = useState(true);
  useEffect(() => { const t = setTimeout(() => setFirst(false), 900); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const h = (e) => { setStage(e.detail); setPanelOpen(true); };
    window.addEventListener("giulia:ontwerp-stage", h);
    return () => window.removeEventListener("giulia:ontwerp-stage", h);
  }, []);

  useEffect(() => {
    const h = (e) => { setEditorProject(e.detail || null); setEditorOpen(true); };
    window.addEventListener("giulia:open-project-editor", h);
    return () => window.removeEventListener("giulia:open-project-editor", h);
  }, []);

  const stageContent =
    stage === "chat" ? <ChatStage /> :
    stage === "voice" ? <VoiceStage /> :
    stage === "doc" ? <DocStage /> :
    <MediaStage />;

  const tabTitle = TABS.find((t) => t.key === tab)?.label || "Project";

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
        <video src={HERO_VIDEO} autoPlay loop muted playsInline className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {!isStage &&
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
          <Link to="/projects-studio" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="h-3.5 w-3.5" /> Focus → Projects
          </Link>
          <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">{tabTitle}</h1>
        </motion.div>
      }

      <motion.div initial={{ x: "118%" }} animate={{ x: isStage ? "-24vw" : 0 }} transition={{ duration: 0.7, ease: EASE, delay: first ? 0.15 : 0 }}
        className="absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[15]"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <button onClick={() => navigate("/projects-studio")} title="Terug naar projecten" className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className="w-4 h-4" />
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
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">{isStage ? "MATTIA" : "GIULIA · PROJECT"}</div>
        </div>

        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          <AnimatePresence>
            {isStage &&
              <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
                className="absolute top-[134px] bottom-[70px] left-0 w-full lg:w-[24vw] z-10 overflow-hidden rounded-r-[20px]"
                style={{ background: "rgba(20,22,26,0.42)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 48px -20px rgba(0,0,0,0.5)" }}>
                {stageContent}
              </motion.div>
            }
          </AnimatePresence>

          <motion.div animate={{ x: isStage ? "24vw" : 0 }} transition={{ duration: 0.7, ease: EASE }} className="absolute inset-0 z-20">
            <AnimatePresence initial={false}>
              <ProjectDetailCard key={tab} id={id} tab={tab} onNavigate={setTab} onEditProject={(p) => { setEditorProject(p); setEditorOpen(true); }} enterDelay={first ? 0.6 : 0} />
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={editorProject} onSaved={() => window.dispatchEvent(new CustomEvent("giulia:projects-reload"))} />
      <MattiaSlideOver open={mattiaOpen} onClose={() => setMattiaOpen(false)} />
    </div>
  );
}