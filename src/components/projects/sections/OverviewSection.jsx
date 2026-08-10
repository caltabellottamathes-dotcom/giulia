import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import StatusBadge from "@/components/glass/StatusBadge";
import ProgressDial from "@/components/projects/ProgressDial";
import { base44 } from "@/api/base44Client";
import { projectStatusMeta, isTaskDone } from "@/lib/projectStatus";
import { buildBreakdown, weightedProgress, giuliaInterpret, parseTasksFromText } from "@/lib/projectEngine";
import {
  ChevronDown, Sparkles, ArrowRight, Calendar, AlertCircle, Users,
  Activity as ActivityIcon, Mail, Gavel, FileText, Clock, Plus,
} from "lucide-react";

/** Overview — the central project dashboard. Understand the project in 10s:
 *  progress dial, nested onderdeel breakdown, Giulia interpretation, and a
 *  grid of quick-glance modules with designed empty defaults. */
export default function OverviewSection({ project, tasks, onNavigate, reload }) {
  const [emails, setEmails] = useState([]);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [addText, setAddText] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const [e, ev, d, c, dec, act] = await Promise.all([
      base44.entities.Email.list(),
      base44.entities.Event.list(),
      base44.entities.Document.list(),
      base44.entities.Contact.list(),
      base44.entities.Decision.list(),
      base44.entities.Activity.list("-timestamp", 5),
    ]);
    setEmails(e.filter((x) => x.project_id === project.id));
    setEvents(ev.filter((x) => x.project_id === project.id));
    setDocuments(d.filter((x) => x.project_id === project.id));
    setContacts(c.filter((x) => (x.project_ids || []).includes(project.id)));
    setDecisions(dec.filter((x) => x.project_id === project.id));
    setActivity(act);
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
    .slice(0, 3);
  const nextActions = tasks.filter((t) => ["actief", "in_progress", "today"].includes(t.status)).slice(0, 4);
  const blockers = tasks.filter((t) => ["wacht", "waiting", "te_specifieren", "todo"].includes(t.status)).slice(0, 4);

  const handleAdd = async () => {
    const parsed = parseTasksFromText(addText);
    if (!parsed.length) return;
    setAdding(true);
    try {
      await base44.entities.Task.bulkCreate(
        parsed.map((title) => ({ title, project_id: project.id, context: "Toegevoegd door Giulia · Acties", status: "gepland" }))
      );
      setAddText("");
      if (reload) reload();
    } finally {
      setAdding(false);
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

  return (
    <div className="space-y-5">
      {/* Progress + Giulia context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Progress hero */}
        <GlassPanel level={2} className="lg:col-span-2 p-6 lg:p-7">
          <div className="flex items-center gap-6 lg:gap-8 flex-wrap">
            <ProgressDial value={progress} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge variant={ps.variant}>{ps.label}</StatusBadge>
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Projectvoortgang</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{giulia.summary}</p>
              {giulia.nextStep && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-olive/12 border border-olive/25 px-3.5 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-olive" />
                  <span className="text-xs font-medium text-olive">Volgende stap: {giulia.nextStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Nested onderdeel breakdown */}
          <div className="mt-6 pt-6 border-t border-border/40">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Voortgang per onderdeel</p>
            <div className="space-y-2.5">
              {breakdown.map((o) => {
                const open = expanded === o.name;
                return (
                  <div key={o.name}>
                    <button
                      onClick={() => setExpanded(open ? null : o.name)}
                      className="w-full flex items-center gap-3 group"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
                      <span className="text-sm flex-1 text-left truncate group-hover:text-foreground transition-colors">{o.name}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{o.done}/{o.total}</span>
                      <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-olive rounded-full transition-all duration-700" style={{ width: `${o.pct}%` }} />
                      </div>
                      <span className="text-xs font-display font-semibold tabular-nums w-9 text-right">{o.pct}%</span>
                    </button>
                    {open && o.subs.length > 1 && (
                      <div className="ml-7 mt-2 space-y-1.5">
                        {o.subs.map((s) => (
                          <div key={s.name} className="flex items-center gap-3">
                            <span className="text-[11px] text-muted-foreground flex-1 truncate">{s.name}</span>
                            <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
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
          </div>
        </GlassPanel>

        {/* Giulia context + add */}
        <GlassPanel level={3} className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-7 w-7 rounded-xl glass-1 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-olive" />
            </span>
            <h3 className="text-sm font-display font-semibold">Giulia context</h3>
          </div>
          <p className="text-xs text-foreground/75 leading-relaxed flex-1">
            {giulia.summary}
          </p>

          <div className="mt-5 pt-5 border-t border-border/40">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1.5">
              <Plus className="h-3 w-3" /> Laat Giulia dit toevoegen
            </p>
            <textarea
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              rows={3}
              placeholder="bv. Na de afspraak met Sarah het moodboard aanpassen en de nieuwe versie naar haar sturen"
              className="w-full text-xs bg-foreground/[0.03] border border-border/50 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-olive leading-relaxed"
            />
            <GlassButton
              variant="primary"
              size="sm"
              className="w-full mt-2.5"
              onClick={handleAdd}
              disabled={adding || !addText.trim()}
            >
              {adding ? "Toevoegen…" : "Voeg taken toe"}
            </GlassButton>
          </div>
        </GlassPanel>
      </div>

      {/* Quick-glance stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile value={upcoming.length} label="Komende deadlines" icon={Calendar} accent="text-amber-500" onClick={() => onNavigate("Timeline")} />
        <StatTile value={nextActions.length} label="Volgende acties" icon={ArrowRight} accent="text-olive" onClick={() => onNavigate("Tasks")} />
        <StatTile value={blockers.length} label="Openstaande blokkades" icon={AlertCircle} accent="text-red-500" onClick={() => onNavigate("Tasks")} />
        <StatTile value={events.length} label="Afspraken" icon={Clock} accent="text-blue-500" onClick={() => onNavigate("Timeline")} />
      </div>

      {/* Detail modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Volgende acties */}
        <GlassPanel level={1} className="p-5">
          <ModuleHeader icon={ArrowRight} label="Volgende acties" onMore={() => onNavigate("Tasks")} />
          <div className="space-y-2">
            {nextActions.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                <p className="text-sm flex-1 truncate">{t.title}</p>
              </div>
            ))}
            {nextActions.length === 0 && <EmptyHint text="Geen actieve taken — alles staat klaar of gepland." />}
          </div>
        </GlassPanel>

        {/* Openstaande blokkades */}
        <GlassPanel level={1} className="p-5">
          <ModuleHeader icon={AlertCircle} label="Openstaande blokkades" onMore={() => onNavigate("Tasks")} />
          <div className="space-y-2">
            {blockers.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${["wacht", "waiting"].includes(t.status) ? "bg-amber-500" : "bg-foreground/30"}`} />
                <p className="text-sm flex-1 truncate">{t.title}</p>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{["wacht", "waiting"].includes(t.status) ? "wacht" : "te spec."}</span>
              </div>
            ))}
            {blockers.length === 0 && <EmptyHint text="Geen blokkades — het project kan vrij doorlopen." />}
          </div>
        </GlassPanel>

        {/* Betrokken personen */}
        <GlassPanel level={1} className="p-5">
          <ModuleHeader icon={Users} label="Betrokken personen" onMore={() => onNavigate("People")} />
          <div className="space-y-2.5">
            {contacts.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <Avatar src={c.avatar} name={c.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  {c.role && <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>}
                </div>
              </div>
            ))}
            {contacts.length === 0 && <EmptyHint text="Nog niemand gekoppeld aan dit project." />}
          </div>
        </GlassPanel>

        {/* Komende deadlines */}
        <GlassPanel level={1} className="p-5">
          <ModuleHeader icon={Calendar} label="Komende deadlines" onMore={() => onNavigate("Timeline")} />
          <div className="space-y-2">
            {upcoming.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <span className="text-[11px] tabular-nums text-foreground/80 font-medium w-12 shrink-0">{fmtDate(t.deadline)}</span>
                <p className="text-sm flex-1 truncate">{t.title}</p>
              </div>
            ))}
            {upcoming.length === 0 && <EmptyHint text="Geen deadlines in zicht voor de komende taken." />}
          </div>
        </GlassPanel>

        {/* Recente activiteit */}
        <GlassPanel level={1} className="p-5">
          <ModuleHeader icon={ActivityIcon} label="Recente activiteit" onMore={() => onNavigate("Activity")} />
          <div className="space-y-2.5">
            {activity.map((a) => (
              <div key={a.id} className="flex gap-2.5 items-start">
                <span className="h-1.5 w-1.5 rounded-full bg-olive mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{a.description}</p>
                  {a.timestamp && <p className="text-[10px] text-muted-foreground">{fmtDate(a.timestamp)}</p>}
                </div>
              </div>
            ))}
            {activity.length === 0 && <EmptyHint text="Nog geen activiteit geregistreerd." />}
          </div>
        </GlassPanel>

        {/* Communicatie / beslissingen / bestanden */}
        <GlassPanel level={1} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Communicatie & kennis</p>
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

function StatTile({ value, label, icon: Icon, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-2xl p-5 text-left group transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`h-9 w-9 rounded-xl flex items-center justify-center bg-foreground/[0.04] ${accent}`}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-4xl font-display font-bold tabular-nums leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">{label}</p>
    </button>
  );
}

function ModuleHeader({ icon: Icon, label, onMore }) {
  return (
    <div className="flex items-center justify-between mb-3">
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
      <span className="text-sm font-display font-semibold tabular-nums">{count}</span>
    </button>
  );
}

function EmptyHint({ text }) {
  return <p className="text-xs text-muted-foreground leading-relaxed py-2">{text}</p>;
}