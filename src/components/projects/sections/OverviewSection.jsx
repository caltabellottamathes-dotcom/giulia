import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import StatusBadge from "@/components/glass/StatusBadge";
import ProgressDial from "@/components/projects/ProgressDial";
import StatusDistribution from "@/components/projects/StatusDistribution";
import { base44 } from "@/api/base44Client";
import { projectStatusMeta, isTaskDone } from "@/lib/projectStatus";
import { buildBreakdown, weightedProgress, giuliaInterpret, parseTasksFromText } from "@/lib/projectEngine";
import {
  ChevronDown, Sparkles, ArrowRight, Calendar, Users, Mail, Gavel, FileText, Plus,
} from "lucide-react";

/** Overview — visual bento dashboard. Big graphic elements carry the
 *  status; text stays minimal. Understand the project in under 10s. */
export default function OverviewSection({ project, tasks, onNavigate, reload }) {
  const [emails, setEmails] = useState([]);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const [e, ev, d, c, dec] = await Promise.all([
      base44.entities.Email.list(),
      base44.entities.Event.list(),
      base44.entities.Document.list(),
      base44.entities.Contact.list(),
      base44.entities.Decision.list(),
    ]);
    setEmails(e.filter((x) => x.project_id === project.id));
    setEvents(ev.filter((x) => x.project_id === project.id));
    setDocuments(d.filter((x) => x.project_id === project.id));
    setContacts(c.filter((x) => (x.project_ids || []).includes(project.id)));
    setDecisions(dec.filter((x) => x.project_id === project.id));
  };
  useEffect(() => { load(); }, [project.id]);

  const breakdown = buildBreakdown(tasks);
  const progress = weightedProgress(tasks);
  const giulia = giuliaInterpret(project, tasks);
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;

  const today = new Date();
  const upcoming = tasks
    .filter((t) => t.deadline && new Date(t.deadline) >= today && !isTaskDone(t))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);
  const activeCount = tasks.filter((t) => ["actief", "in_progress", "today"].includes(t.status)).length;
  const blockerCount = tasks.filter((t) => ["wacht", "waiting", "te_specifieren", "todo"].includes(t.status)).length;

  const handleAdd = async () => {
    const parsed = parseTasksFromText(addText);
    if (!parsed.length) return;
    setAdding(true);
    try {
      await base44.entities.Task.bulkCreate(
        parsed.map((title) => ({ title, project_id: project.id, context: "Toegevoegd door Giulia · Acties", status: "gepland" }))
      );
      setAddText("");
      setAddOpen(false);
      if (reload) reload();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top bento: progress · distribution · Giulia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Progress hero */}
        <GlassPanel level={2} className="lg:col-span-4 p-6 flex flex-col items-center justify-center text-center">
          <ProgressDial value={progress} size={180} />
          <div className="mt-4 flex items-center gap-2">
            <StatusBadge variant={ps.variant}>{ps.label}</StatusBadge>
          </div>
          {giulia.nextStep && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-olive/12 border border-olive/25 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-olive" />
              <span className="text-[11px] font-medium text-olive">{giulia.nextStep}</span>
            </div>
          )}
        </GlassPanel>

        {/* Status distribution */}
        <GlassPanel level={2} className="lg:col-span-4 p-6 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5">Takenverdeling</p>
          <div className="flex-1 flex flex-col justify-center">
            <StatusDistribution tasks={tasks} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border/40">
            <Metric value={activeCount} label="Actief" onClick={() => onNavigate("Tasks")} />
            <Metric value={blockerCount} label="Blokkades" onClick={() => onNavigate("Tasks")} />
          </div>
        </GlassPanel>

        {/* Giulia insight + add */}
        <GlassPanel level={3} className="lg:col-span-4 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-7 w-7 rounded-xl glass-1 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-olive" />
            </span>
            <h3 className="text-sm font-display font-semibold">Giulia</h3>
          </div>
          <p className="text-sm leading-relaxed flex-1">{giulia.insight}</p>

          <div className="mt-4 pt-4 border-t border-border/40">
            {!addOpen ? (
              <button onClick={() => setAddOpen(true)} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition">
                <Plus className="h-3.5 w-3.5" /> Laat Giulia meedenken
              </button>
            ) : (
              <div>
                <textarea
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  rows={2}
                  placeholder="bv. Na de afspraak met Sarah het moodboard aanpassen en de nieuwe versie sturen"
                  className="w-full text-xs bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-olive leading-relaxed"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { setAddOpen(false); setAddText(""); }} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition">Annuleer</button>
                  <GlassButton variant="primary" size="sm" className="flex-1" onClick={handleAdd} disabled={adding || !addText.trim()}>
                    {adding ? "Toevoegen…" : "Voeg taken toe"}
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Onderdeel infographic */}
      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5">Voortgang per onderdeel</p>
        <div className="space-y-3">
          {breakdown.map((o) => {
            const open = expanded === o.name;
            return (
              <div key={o.name}>
                <button onClick={() => setExpanded(open ? null : o.name)} className="w-full group">
                  <div className="flex items-center gap-3 mb-1.5">
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
                    <span className="text-xs text-foreground/70 flex-1 text-left truncate group-hover:text-foreground transition-colors">{o.name}</span>
                    <span className="text-2xl font-display font-bold tabular-nums leading-none">{o.pct}<span className="text-sm text-muted-foreground ml-0.5">%</span></span>
                  </div>
                  <div className="h-7 rounded-lg bg-muted/70 overflow-hidden">
                    <div className="h-full bg-olive rounded-lg transition-all duration-700 flex items-center justify-end pr-2" style={{ width: `${Math.max(o.pct, 4)}%` }}>
                      {o.pct > 18 && <span className="text-[10px] text-white/90 font-medium tabular-nums">{o.done}/{o.total}</span>}
                    </div>
                  </div>
                </button>
                {open && o.subs.length > 1 && (
                  <div className="ml-6 mt-2 space-y-1.5">
                    {o.subs.map((s) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground flex-1 truncate">{s.name}</span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-olive/50 rounded-full" style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {breakdown.length === 0 && <p className="text-sm text-muted-foreground">Nog geen onderdelen — voeg taken toe op het Tasks-tabblad.</p>}
        </div>
      </GlassPanel>

      {/* Bottom bento: deadlines · people · knowledge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Deadlines */}
        <GlassPanel level={1} className="lg:col-span-5 p-5">
          <ModuleHeader icon={Calendar} label="Komende deadlines" onMore={() => onNavigate("Timeline")} />
          {upcoming.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {upcoming.map((t) => {
                const d = new Date(t.deadline);
                return (
                  <div key={t.id} className="flex items-center gap-2.5 glass-1 rounded-xl px-3 py-2.5">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-olive/15 shrink-0">
                      <span className="text-base font-display font-bold leading-none text-olive">{d.getDate()}</span>
                      <span className="text-[9px] uppercase text-olive/80 mt-0.5">{d.toLocaleDateString("nl-NL", { month: "short" })}</span>
                    </div>
                    <span className="text-xs truncate max-w-[140px]">{t.title}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-3">Geen deadlines in zicht voor de komende taken.</p>
          )}
        </GlassPanel>

        {/* People cluster */}
        <GlassPanel level={1} className="lg:col-span-3 p-5">
          <ModuleHeader icon={Users} label="Betrokkenen" onMore={() => onNavigate("People")} />
          {contacts.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex -space-x-2">
                {contacts.slice(0, 5).map((c) => (
                  <Avatar key={c.id} src={c.avatar} name={c.name} size="sm" className="ring-2 ring-background rounded-full" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{contacts.length} {contacts.length === 1 ? "persoon" : "personen"} gekoppeld</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-3">Nog niemand gekoppeld.</p>
          )}
        </GlassPanel>

        {/* Knowledge & communication */}
        <GlassPanel level={1} className="lg:col-span-4 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Kennis & communicatie</p>
          <div className="space-y-2.5">
            <MiniRow icon={Mail} label="E-mails" count={emails.length} onClick={() => onNavigate("Communication")} />
            <MiniRow icon={Gavel} label="Beslissingen" count={decisions.length} onClick={() => onNavigate("Decisions")} />
            <MiniRow icon={FileText} label="Bestanden" count={documents.length} onClick={() => onNavigate("Files")} />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function Metric({ value, label, onClick }) {
  return (
    <button onClick={onClick} className="text-left group">
      <p className="text-3xl font-display font-bold tabular-nums leading-none group-hover:text-olive transition-colors">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</p>
    </button>
  );
}

function ModuleHeader({ icon: Icon, label, onMore }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.7} />
        <h3 className="text-xs uppercase tracking-[0.18em] font-semibold">{label}</h3>
      </div>
      <button onClick={onMore} className="text-[11px] text-muted-foreground hover:text-foreground transition flex items-center gap-1">
        Meer <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function MiniRow({ icon: Icon, label, count, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 p-1 rounded-lg hover:bg-foreground/[0.03] transition text-left">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.7} />
      <span className="text-sm flex-1">{label}</span>
      <span className="text-base font-display font-bold tabular-nums">{count}</span>
    </button>
  );
}