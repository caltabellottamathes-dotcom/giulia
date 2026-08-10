import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import Avatar from "@/components/glass/Avatar";
import { base44 } from "@/api/base44Client";
import { Mail, Calendar, FileText, AlertCircle, HelpCircle, Bot, ArrowRight } from "lucide-react";
import { isTaskDone, parseContext } from "@/lib/projectStatus";
import StatusGrid, { StatusLegend } from "@/components/projects/StatusGrid";

/** Overview — bold information-design dashboard. The whole project reads in
 *  one glance: a giant progress figure, a full-project status mosaic, the
 *  per-onderdeel breakdown, and Giulia's reading of where things stand. */
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
    activeCount > 0 ? `${activeCount} taken lopen nu actief.` : "",
    waitCount > 0 ? `${waitCount} taken wachten op vervolg.` : "",
    specCount > 0 ? `${specCount} onderdelen moeten nog worden gespecificeerd.` : "",
    project.next_milestone ? `Volgende stap: ${project.next_milestone}.` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      {/* Hero progress — giant number + full-project status mosaic */}
      <GlassPanel level={2} className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
          <div className="shrink-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Voortgang</p>
            <div className="flex items-end gap-2 leading-none">
              <span className="text-[64px] lg:text-[80px] font-display font-bold tracking-tighter tabular-nums">{progress}</span>
              <span className="text-2xl text-muted-foreground mb-2">%</span>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums mt-1">{doneCount} van {tasks.length} taken klaar</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Status van alle taken</p>
              <StatusLegend tasks={tasks} />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10px,1fr))] gap-[3px]">
              {tasks.map((t) => {
                const color = {
                  klaar: "bg-emerald-500", actief: "bg-olive", gepland: "bg-blue-500",
                  wacht: "bg-amber-500", te_specifieren: "bg-foreground/25",
                }[t.status] || "bg-foreground/15";
                return <div key={t.id} title={`${t.title} — ${t.status}`} className={cn("h-3.5 rounded-[3px] hover:scale-[1.4] hover:z-10 transition-transform cursor-default", color)} />;
              })}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Per-onderdeel breakdown */}
      <div>
        <h2 className="text-sm font-display font-semibold mb-3 px-1">Onderdelen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(onderdelen).map(([ond, ts]) => {
            const d = ts.filter(isTaskDone).length;
            const p = ts.length ? Math.round((d / ts.length) * 100) : 0;
            return (
              <button key={ond} onClick={() => onNavigate("Tasks")} className="glass rounded-2xl p-4 text-left group hover:glass-2 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium truncate pr-2">{ond}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{p}%</span>
                </div>
                <StatusGrid tasks={ts} size="sm" className="mb-2" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{d}/{ts.length} klaar</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
            );
          })}
          {Object.keys(onderdelen).length === 0 && <p className="text-sm text-muted-foreground">Nog geen onderdelen.</p>}
        </div>
      </div>

      {/* Giulia reading — bold dark card */}
      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="h-11 w-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-white" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/50 font-semibold mb-1.5">Giulia leest dit project</p>
            <p className="text-sm text-white/90 leading-relaxed">{giuliaContext}</p>
          </div>
        </div>
      </div>

      {/* Quick info + people */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={1} className="p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Snelle informatie</h3>
          <div className="space-y-1 text-sm">
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