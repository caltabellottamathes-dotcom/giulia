import React, { useState } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import {
  Plus, CheckSquare, Briefcase, Calendar, Mail, MessageCircle,
  FileText, Sparkles, Phone,
} from "lucide-react";

const actions = [
  { label: "Nieuwe taak", icon: CheckSquare, key: "tasks" },
  { label: "Nieuw project", icon: Briefcase, key: "projects" },
  { label: "Nieuw event", icon: Calendar, key: "agenda" },
  { label: "Email opstellen", icon: Mail, key: "email" },
  { label: "Bericht sturen", icon: MessageCircle, key: "whatsapp" },
  { label: "Document uploaden", icon: FileText, key: "documents" },
  { label: "Vraag Giulia", icon: Sparkles, key: "chat" },
  { label: "Bel Giulia", icon: Phone, key: "voice" },
];

export default function QuickAction() {
  const [open, setOpen] = useState(false);
  const { openModule } = usePanel();

  const handleAction = (key) => {
    setOpen(false);
    openModule(key);
  };

  return (
    <>
      {/* Subtle floating button — bottom right, detached from edge */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 lg:bottom-7 lg:right-7 z-30 h-12 w-12 lg:h-14 lg:w-14 rounded-full glass-2 float-shadow flex items-center justify-center transition-all duration-300 hover:scale-105 group"
        aria-label="Snelle actie"
      >
        <Plus className="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <FloatingPanel
        open={open}
        onClose={() => setOpen(false)}
        position="bottom"
        level={3}
      >
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Snelle actie
              </p>
              <h2 className="text-lg font-heading font-light">Wat wil je doen?</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action.key)}
                className="glass-1 rounded-2xl p-4 flex flex-col items-center gap-3 hover:scale-[1.03] transition-all duration-300 group"
              >
                <div className="h-11 w-11 rounded-full glass-1 flex items-center justify-center">
                  <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <p className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </FloatingPanel>
    </>
  );
}