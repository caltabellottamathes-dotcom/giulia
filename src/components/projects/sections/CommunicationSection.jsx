import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";
import { Mail, MessageCircle } from "lucide-react";

/** Communication — emails and WhatsApp messages linked to the project. */
export default function CommunicationSection({ project }) {
  const [emails, setEmails] = useState([]);
  const [whats, setWhats] = useState([]);

  useEffect(() => {
    (async () => {
      const [e, w] = await Promise.all([
        base44.entities.Email.list(),
        base44.entities.WhatsAppMessage.list(),
      ]);
      setEmails(e.filter((x) => x.project_id === project.id));
      setWhats(w.filter((x) => x.project_id === project.id));
    })();
  }, [project.id]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-display font-semibold">E-mails</h2>
          <span className="text-xs text-muted-foreground ml-auto">{emails.length}</span>
        </div>
        <div className="space-y-1.5">
          {emails.length === 0 && <p className="text-sm text-muted-foreground">Geen e-mails gekoppeld.</p>}
          {emails.map((m) => (
            <div key={m.id} className="glass-1 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{m.sender}</span>
                {m.timestamp && <span className="text-[11px] text-muted-foreground">{new Date(m.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{m.subject}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-display font-semibold">WhatsApp</h2>
          <span className="text-xs text-muted-foreground ml-auto">{whats.length}</span>
        </div>
        <div className="space-y-1.5">
          {whats.length === 0 && <p className="text-sm text-muted-foreground">Geen WhatsApp-berichten gekoppeld.</p>}
          {whats.map((m) => (
            <div key={m.id} className="glass-1 rounded-xl p-3">
              <p className="text-sm">{m.message}</p>
              {m.timestamp && <p className="text-[11px] text-muted-foreground mt-1">{new Date(m.timestamp).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}