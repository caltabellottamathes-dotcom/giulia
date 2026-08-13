import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronDown, Mail, MessageCircle, Calendar, Briefcase,
  AlertTriangle, Telescope, Clock, CheckSquare, FileText,
} from "lucide-react";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

const TYPE_PHOTO = {
  whatsapp: IMAGES.stilettoHead,
  email: IMAGES.portraitBoot,
  calendar: IMAGES.walkChairsBeach,
  project: IMAGES.walkChairsHigh,
  deadline: IMAGES.feetChairs,
  task: IMAGES.feetChairs,
  important: IMAGES.leanChair,
  insight: IMAGES.chairWater,
  document: IMAGES.chairsScattered,
  meeting: IMAGES.loungeChairs,
};

const TYPE_LABEL = {
  whatsapp: "WhatsApp", email: "Email", calendar: "Agenda", project: "Project",
  task: "Taak", deadline: "Deadline", important: "Belangrijk", insight: "Inzicht",
  document: "Document", meeting: "Afspraak",
};

const TYPE_ICON = {
  whatsapp: MessageCircle, email: Mail, calendar: Calendar, project: Briefcase,
  task: CheckSquare, deadline: Clock, important: AlertTriangle, insight: Telescope,
  document: FileText, meeting: Calendar,
};

const PRIORITY_LABEL = { critical: "Nu", important: "Vandaag", relevant: "Goed om te weten", later: "Later" };
const PRIORITY_ACCENT = {
  critical: "text-urgent", important: "text-olive", relevant: "text-ridge", later: "text-ivory/50",
};

function Composition({ item }) {
  switch (item.type) {
    case "whatsapp": {
      const preview = item.payload?.preview || item.context || "";
      return (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] text-ivory/70 leading-snug">{item.summary}</p>
          {preview && (
            <div className="rounded-2xl rounded-bl-md bg-ivory/8 border border-ivory/12 px-4 py-3">
              <p className="text-[13px] text-ivory/85 leading-relaxed line-clamp-4">{preview}</p>
            </div>
          )}
        </div>
      );
    }
    case "email": {
      const count = item.payload?.count || 0;
      const important = item.payload?.important || 0;
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <span className="text-[64px] leading-none font-display font-bold text-ivory">{count}</span>
            <span className="text-sm text-ivory/55 mb-2">ongelezen</span>
          </div>
          <p className="text-[15px] text-ivory/70 leading-snug">{item.summary}</p>
          <div className="flex gap-2">
            <span className={cn("rounded-full px-3 py-1 text-[11px] font-medium", important ? "bg-olive/20 text-olive" : "bg-ivory/8 text-ivory/60")}>
              {important} belangrijk
            </span>
            <span className="rounded-full px-3 py-1 text-[11px] font-medium bg-ivory/8 text-ivory/60">
              {Math.max(0, count - important)} later
            </span>
          </div>
        </div>
      );
    }
    case "calendar": {
      const [time, ...rest] = (item.title || "").split(" · ");
      const title = rest.join(" · ") || item.payload?.title || "Afspraak";
      return (
        <div className="flex flex-col gap-2">
          <span className="text-[64px] leading-none font-display font-bold text-ivory">{time || item.payload?.time || "--:--"}</span>
          <span className="text-2xl font-display font-semibold text-ivory">{title}</span>
          <p className="text-[15px] text-ivory/65 leading-snug mt-1">{item.summary}</p>
        </div>
      );
    }
    case "deadline":
    case "task": {
      const [, ...rest] = (item.summary || "").split(": ");
      const when = rest.join(": ") || item.summary;
      return (
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-display font-semibold text-ivory leading-tight">{item.title}</span>
          <span className={cn("text-[15px] font-medium", item.type === "deadline" ? "text-urgent" : "text-ivory/70")}>{when}</span>
          <p className="text-[14px] text-ivory/55 leading-snug mt-1">{item.context}</p>
        </div>
      );
    }
    case "project": {
      const progress = Math.round((item.payload?.progress || 0) * 100);
      return (
        <div className="flex flex-col gap-3">
          <span className="text-2xl font-display font-semibold text-ivory leading-tight">{item.title}</span>
          <p className="text-[15px] text-ivory/70 leading-snug">{item.summary}</p>
          <div className="h-1.5 rounded-full bg-ivory/10 overflow-hidden">
            <div className="h-full bg-olive rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      );
    }
    case "important":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-display font-semibold text-ivory leading-tight">{item.title}</span>
          <p className="text-[15px] text-ivory/70 leading-snug">{item.summary}</p>
          {item.context && <p className="text-[13px] text-ivory/50 leading-snug">{item.context}</p>}
        </div>
      );
    case "insight":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-xl font-display font-semibold text-ivory leading-tight">{item.title}</span>
          <p className="text-[15px] text-ivory/70 leading-relaxed italic">{item.summary}</p>
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-display font-semibold text-ivory leading-tight">{item.title}</span>
          <p className="text-[15px] text-ivory/70 leading-snug">{item.summary}</p>
        </div>
      );
  }
}

export default function BriefingCard({ item, onAct, expanded, onToggleExpand, interactive = true }) {
  if (!item) return null;
  const Icon = TYPE_ICON[item.type] || AlertTriangle;
  const photo = TYPE_PHOTO[item.type] || IMAGES.feetChairs;
  const accent = PRIORITY_ACCENT[item.priority] || "text-ivory/60";

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-charcoal float-shadow">
      <img src={photo} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/35" />

      <div className="relative h-full flex flex-col p-6 text-ivory">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold text-ivory/70">
            <Icon className="h-3.5 w-3.5" /> {TYPE_LABEL[item.type] || "Update"}
          </span>
          <span className={cn("text-[10px] uppercase tracking-wider font-semibold", accent)}>
            {PRIORITY_LABEL[item.priority] || item.priority}
          </span>
        </div>

        {/* Composition */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-6">
          <Composition item={item} />
        </div>

        {/* Expandable context */}
        <AnimatePresence initial={false}>
          {expanded && item.context && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="text-[13px] text-ivory/60 leading-relaxed pb-3">{item.context}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {interactive && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onAct?.(); }}
              className="flex-1 h-11 rounded-2xl bg-ivory text-charcoal font-semibold text-sm hover:bg-ivory/90 transition inline-flex items-center justify-center gap-2"
            >
              {item.suggested_action || "Actie"} <ArrowRight className="h-4 w-4" />
            </button>
            {item.context && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
                className="h-11 w-11 rounded-2xl bg-ivory/10 border border-ivory/15 text-ivory/80 hover:bg-ivory/15 transition flex items-center justify-center"
                aria-label="Details"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}