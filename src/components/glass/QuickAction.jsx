import React, { useState } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { Plus, CheckSquare, Briefcase, Calendar, Mail, MessageCircle, FileText, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Nieuwe taak", icon: CheckSquare, to: "/tasks", tone: "bg-olive text-ivory" },
  { label: "Nieuw project", icon: Briefcase, to: "/projects", tone: "bg-sand text-charcoal" },
  { label: "Nieuw event", icon: Calendar, to: "/agenda", tone: "bg-blue-grey text-charcoal" },
  { label: "Email opstellen", icon: Mail, to: "/email", tone: "bg-charcoal text-ivory" },
  { label: "Bericht sturen", icon: MessageCircle, to: "/whatsapp", tone: "bg-olive text-ivory" },
  { label: "Document", icon: FileText, to: "/documents", tone: "bg-sand text-charcoal" },
  { label: "Vraag Giulia", icon: MessageSquare, chat: true, tone: "bg-blue-grey text-charcoal" },
  { label: "Bel Giulia", icon: Phone, to: "/voice", tone: "bg-charcoal text-ivory" },
];

/**
 * QuickAction — a glowing orb FAB that opens a premium, editorial action sheet
 * (photo header + bold title + strong colored action tiles).
 */
export default function QuickAction() {
  const [open, setOpen] = useState(false);
  const { openChat } = usePanel();
  const navigate = useNavigate();

  const handle = (a) => {
    setOpen(false);
    if (a.chat) openChat();
    else navigate(a.to);
  };

  return (
    <>
      {/* Glowing orb FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 lg:bottom-7 right-5 lg:right-7 z-30 h-12 w-12 lg:h-14 lg:w-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Snelle actie"
      >
        <span className="absolute -inset-1.5 rounded-full blur-lg opacity-50 bg-gradient-to-br from-sand to-olive" />
        <span className="relative h-full w-full rounded-full bg-charcoal text-ivory flex items-center justify-center shadow-[0_18px_44px_-12px_hsl(30_10%_10%/0.5)]">
          <Plus className="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-90 transition-transform duration-500" />
        </span>
      </button>

      <FloatingPanel open={open} onClose={() => setOpen(false)} position="bottom" level={3}>
        <div className="relative overflow-hidden">
          {/* Editorial photo header */}
          <div className="relative h-20 overflow-hidden">
            <img src={IMAGES.topDownWalk} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/55 to-transparent" />
            <div className="relative h-full flex flex-col justify-center px-6 lg:px-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sand font-semibold mb-1">Snelle actie</p>
              <h2 className="text-2xl font-display font-semibold tracking-[-0.02em] text-ivory leading-none">Wat wil je doen?</h2>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => handle(a)}
                  className="group rounded-2xl bg-stone border border-charcoal/10 p-4 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition", a.tone)}>
                    <a.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <p className="text-xs font-semibold text-charcoal text-center leading-tight">{a.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </FloatingPanel>
    </>
  );
}