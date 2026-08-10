import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import Avatar from "@/components/glass/Avatar";
import { base44 } from "@/api/base44Client";
import { Mail, Calendar, FileText, AlertCircle, HelpCircle } from "lucide-react";
import { isTaskDone, parseContext } from "@/lib/projectStatus";

/** Overview — the project dashboard: progress, onderdeel breakdown, Giulia context, sidebar. */
export default function OverviewSection({ project, tasks, onNavigate }) {
  const [emails, setEmails] = useState([]);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    (async () => {
      const [e, ev, d, c] = await Promise.all([
        base44.entities.Email.list(),
        base44.entities.Event.list(),
        base44.entities.Document.list(),
        base44.entities.Contact.list(),
      ]);
      setEmails(e.filter((x) => x.project_id === project.id));
      setEvents(ev.filter((x) => x.project_id === project.id));
      setDocuments(d.filter((x) => x.project_id === project.id));
      setContacts(c);
    })();
  }, [project.id]);

  const onderdelen = {};
  tasks.forEach((t) => {
    const { ond } = parseContext(t.context);
    if (!onderdelen[ond]) onderdelen[ond] = [];
    onderdelen[ond].push(t);
  });

  const doneCount = tasks.filter(isTaskDone).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const activeCount = tasks.filter((t) => ["actief", "in_progress", "today"].includes(t.status)).length;
  const waitCount = tasks.filter((t) => ["wacht", "waiting"].includes(t.status)).length;
  const specCount = tasks.filter((t) => ["te_specifieren", "todo"].includes(t.status)).length;

  const giuliaContext = [
    `${project.title} staat op ${progress}% — ${doneCount} van ${tasks.length} taken klaar.`,
    activeCount > 0 ? `${activeCount} taken zijn momenteel actief.` : "",
    waitCount > 0 ? `${waitCount} taken wachten op vervolg.` : "",
    specCount > 0 ? `${specCount} onderdelen moeten nog worden gespecificeerd.` : "",
    project.next_milestone ? `Volgende stap: ${project.next_milestone}.` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <GlassPanel level={2} className="p-6">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Projectvoortgang</p>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-5xl font-display font-bold leading-none">{progress}</span>
            <span className="text-xl text-muted-foreground mb-0.5">%</span>
            <span className="text-xs text-muted-foreground ml-auto mb-1.5">{doneCount}/{tasks.length} taken</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
            <div className="h-full bg-olive rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-3">
            {Object.entries(onderdelen).map(([ond, ts]) => {
              const d = ts.filter(isTaskDone).length;
              const p = ts.length ? Math.round((d / ts.length) * 100) : 0;
              return (
                <div key={ond}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{ond}</span>
                    <span className="tabular-nums">{p}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-olive/70 rounded-full transition-all duration-500" style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(onderdelen).length === 0 && <p className="text-sm text-muted-foreground">Nog geen onderdelen.</p>}
          </div>
        </GlassPanel>
      </div>

      <div className="space-y-4">
        <GlassPanel level={3} className="p-5">
          <h3 className="text-sm font-display font-semibold mb-2">Giulia context</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{giuliaContext}</p>
        </GlassPanel>

        <GlassPanel level={1} className="p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Snelle informatie</h3>
          <div className="space-y-1.5 text-sm">
            <button onClick={() => onNavigate("Communication")} className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-foreground/[0.03] transition">
              <Mail className="h-4 w-4 text-muted-foreground" /> <span className="flex-1 text-left">E-mails</span>
              <span className="text-xs text-muted-foreground tabular-nums">{emails.length}</span>
            </button>
            <button onClick={() => onNavigate("Timeline")} className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-foreground/[0.03] transition">
              <Calendar className="h-4 w-4 text-muted-foreground" /> <span className="flex-1 text-left">Afspraken</span>
              <span className="text-xs text-muted-foreground tabular-nums">{events.length}</span>
            </button>
            <button onClick={() => onNavigate("Files")} className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-foreground/[0.03] transition">
              <FileText className="h-4 w-4 text-muted-foreground" /> <span className="flex-1 text-left">Bestanden</span>
              <span className="text-xs text-muted-foreground tabular-nums">{documents.length}</span>
            </button>
            <div className="flex items-center gap-2 p-1.5"><AlertCircle className="h-4 w-4 text-amber-500" /><span className="flex-1">Wachtend</span><span className="text-xs tabular-nums">{waitCount}</span></div>
            <div className="flex items-center gap-2 p-1.5"><HelpCircle className="h-4 w-4 text-muted-foreground" /><span className="flex-1">Te specificeren</span><span className="text-xs tabular-nums">{specCount}</span></div>
          </div>
        </GlassPanel>

        <GlassPanel level={1} className="p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Betrokkenen</h3>
          <div className="space-y-2">
            {contacts.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("People")}>
                <Avatar src={c.avatar} name={c.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  {c.role && <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>}
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-xs text-muted-foreground">Nog geen contacten.</p>}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}