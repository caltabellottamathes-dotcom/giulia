import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "@/components/widgets/CountUp";
import Ring from "@/components/widgets/Ring";
import {
  ArrowRight, ChevronDown, Mail, MessageCircle, Calendar, Briefcase,
  AlertTriangle, Telescope, Clock, CheckSquare, FileText, HelpCircle,
} from "lucide-react";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import QuestionInfographic from "@/components/briefing/QuestionInfographic";

// Full photo pool — rotated per card using index
export const BRIEFING_PHOTOS = [
  IMAGES.salvoSandTopDown,
  IMAGES.salvoChairStairs,
  IMAGES.salvoWalkingBeach,
  IMAGES.salvoChairsTopScattered,
  IMAGES.salvoChairSittingMany,
  IMAGES.salvoChairStacked,
  IMAGES.salvoChairWater,
  IMAGES.salvoJacketChairWater,
  IMAGES.salvoFeetPebbles,
  IMAGES.salvoFeetSitting,
  IMAGES.salvoFloating,
  IMAGES.salvoChairsCircle,
  IMAGES.salvoStandingWater,
  IMAGES.chairFogBeach,
  IMAGES.chairPebbleWater,
  IMAGES.twoChairsSandAerial,
  IMAGES.hourglassClose,
  IMAGES.salvoReadingBeach,
  IMAGES.notebookChair,
  IMAGES.walkTowardChair,
  IMAGES.bagJacket,
  IMAGES.womanFolder,
];

const TYPE_PHOTO = {
  whatsapp: IMAGES.salvoChairStairs,
  email: IMAGES.salvoReadingBeach,
  calendar: IMAGES.salvoChairsCircle,
  project: IMAGES.salvoWalkingBeach,
  deadline: IMAGES.hourglassClose,
  task: IMAGES.notebookChair,
  important: IMAGES.salvoSandTopDown,
  insight: IMAGES.salvoStandingWater,
  document: IMAGES.womanFolder,
  meeting: IMAGES.twoChairsSandAerial,
  question: IMAGES.giuliaPortrait2,
};

const TYPE_LABEL = {
  whatsapp: "WhatsApp", email: "Email", calendar: "Agenda", project: "Project",
  task: "Taak", deadline: "Deadline", important: "Belangrijk", insight: "Inzicht",
  document: "Document", meeting: "Afspraak",
};

const TYPE_ICON = {
  whatsapp: MessageCircle, email: Mail, calendar: Calendar, project: Briefcase,
  task: CheckSquare, deadline: Clock, important: AlertTriangle, insight: Telescope,
  document: FileText, meeting: Calendar, question: HelpCircle,
};

const PRIORITY_LABEL = { critical: "Nu", important: "Vandaag", relevant: "Goed om te weten", later: "Later" };

/* ── Bold infographic per type — counters, animated bars, radial dial ── */
function Infographic({ item, onAnswer }) {
  switch (item.type) {
    case "email": {
      const count = item.payload?.count || 0;
      const important = item.payload?.important || 0;
      const later = Math.max(0, count - important);
      const impPct = count ? (important / count) * 100 : 0;
      const latPct = count ? (later / count) * 100 : 0;
      return (
        <div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-[88px] leading-[0.85] font-display font-bold text-charcoal tracking-[-0.04em]">
              <CountUp value={count} duration={1100} />
            </span>
            <span className="text-sm text-charcoal/55 mb-2 font-medium">ongelezen</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-charcoal/10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${impPct}%` }} transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} className="bg-olive" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${latPct}%` }} transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} className="bg-ridge" />
          </div>
          <div className="flex gap-4 mt-2.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-olive">{important} belangrijk</span>
            <span className="text-charcoal/45">{later} later</span>
          </div>
        </div>
      );
    }
    case "whatsapp": {
      const count = item.payload?.count || 1;
      const preview = item.payload?.preview || item.context || "";
      return (
        <div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-[76px] leading-[0.85] font-display font-bold text-charcoal tracking-[-0.04em]">
              <CountUp value={count} duration={1000} />
            </span>
            <span className="text-sm text-charcoal/55 mb-2 font-medium">{count === 1 ? "bericht" : "berichten"}</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl rounded-bl-md bg-charcoal/8 border border-charcoal/10 px-4 py-3"
          >
            <p className="text-[13px] text-charcoal/80 leading-relaxed line-clamp-3">{preview}</p>
          </motion.div>
        </div>
      );
    }
    case "calendar": {
      const [time, ...rest] = (item.title || "").split(" · ");
      const title = rest.join(" · ") || item.payload?.title || "Afspraak";
      return (
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="block text-[80px] leading-[0.85] font-display font-bold text-charcoal tracking-[-0.04em]"
          >
            {time || item.payload?.time || "--:--"}
          </motion.span>
          <span className="block text-2xl font-display font-semibold text-charcoal mt-2 leading-tight">{title}</span>
          <p className="text-[14px] text-charcoal/60 mt-1">{item.summary}</p>
        </div>
      );
    }
    case "deadline":
    case "task": {
      const [, ...rest] = (item.summary || "").split(": ");
      const when = rest.join(": ") || item.summary;
      return (
        <div>
          <span className="block text-[26px] font-display font-bold text-charcoal leading-[1.05] tracking-tight">{item.title}</span>
          <span className={cn("block text-[15px] font-semibold mt-1.5 uppercase tracking-wider", item.type === "deadline" ? "text-olive" : "text-charcoal/70")}>{when}</span>
        </div>
      );
    }
    case "project": {
      const progress = Math.round((item.payload?.progress || 0) * 100);
      return (
        <div className="flex items-center gap-5">
          <Ring value={progress} max={100} size={104} stroke={11} className="text-olive">
            <span className="text-xl font-display font-bold text-charcoal"><CountUp value={progress} />%</span>
          </Ring>
          <div className="flex-1 min-w-0">
            <span className="block text-xl font-display font-bold text-charcoal leading-tight tracking-tight">{item.title}</span>
            <p className="text-[14px] text-charcoal/65 leading-snug mt-1">{item.summary}</p>
          </div>
        </div>
      );
    }
    case "insight":
      return (
        <div>
          <span className="block text-[22px] font-display font-bold text-charcoal leading-tight tracking-tight">{item.title}</span>
          <p className="text-[15px] text-charcoal/70 leading-relaxed italic mt-2">{item.summary}</p>
        </div>
      );
    case "question":
      return <QuestionInfographic item={item} onAnswer={onAnswer} />;
    case "important":
    default:
      return (
        <div>
          <span className="block text-[26px] font-display font-bold text-charcoal leading-[1.05] tracking-tight">{item.title}</span>
          <p className="text-[15px] text-charcoal/70 leading-snug mt-1.5">{item.summary}</p>
          {item.context && <p className="text-[13px] text-charcoal/50 leading-snug mt-1.5">{item.context}</p>}
        </div>
      );
  }
}

export default function BriefingCard({ item, onAct, onAnswer, expanded, onToggleExpand, interactive = true, photoIndex = 0 }) {
  if (!item) return null;
  const Icon = TYPE_ICON[item.type] || AlertTriangle;
  // Question cards always get the Giulia portrait; others rotate through the photo pool
  const photo = item.type === "question"
    ? IMAGES.giuliaPortrait2
    : (BRIEFING_PHOTOS[photoIndex % BRIEFING_PHOTOS.length] || TYPE_PHOTO[item.type] || IMAGES.feetChairs);
  const priority = item.priority || "relevant";

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-warm-white shadow-[0_32px_72px_-24px_rgba(0,0,0,0.28)]">
      {/* Full-bleed editorial photo — no overlay, full colour */}
      <motion.img
        src={photo}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Floating glass chips over the photo — type + priority */}
      <div className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-ivory/75 backdrop-blur-xl border border-white/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal">
        <Icon className="h-3.5 w-3.5" /> {TYPE_LABEL[item.type] || "Update"}
      </div>
      <div className="absolute top-5 right-5 z-20 rounded-full bg-charcoal/85 backdrop-blur-xl px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-ivory">
        {PRIORITY_LABEL[priority] || priority}
      </div>

      {/* Layered glass content panel — translucent ivory, heavy blur, overlaps photo */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.9 }}
        className="absolute inset-x-0 bottom-0 top-[40%] rounded-t-[28px] bg-ivory/80 backdrop-blur-2xl border-t border-x border-white/55 p-6 flex flex-col shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.18)]"
      >
        {/* Summary line */}
        {item.type !== "question" && (
          <p className="text-[13px] text-charcoal/60 leading-snug mb-3 line-clamp-2">{item.summary}</p>
        )}

        {/* Bold infographic */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <Infographic item={item} onAnswer={onAnswer} />
        </div>

        {/* Expandable context */}
        <AnimatePresence initial={false}>
          {expanded && item.context && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }} className="overflow-hidden"
            >
              <p className="text-[13px] text-charcoal/55 leading-relaxed pb-3">{item.context}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {interactive && item.type !== "question" && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAct?.(); }}
              className="flex-1 h-12 rounded-2xl bg-charcoal text-ivory font-bold text-sm hover:bg-charcoal/90 transition inline-flex items-center justify-center gap-2 tracking-tight"
            >
              {item.suggested_action || "Actie"} <ArrowRight className="h-4 w-4" />
            </button>
            {item.context && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
                className="h-12 w-12 rounded-2xl bg-charcoal/8 border border-charcoal/12 text-charcoal/70 hover:bg-charcoal/12 transition flex items-center justify-center"
                aria-label="Details"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}