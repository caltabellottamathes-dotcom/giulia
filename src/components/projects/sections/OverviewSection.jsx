import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import StatusBadge from "@/components/glass/StatusBadge";
import StatusDistribution from "@/components/projects/StatusDistribution";
import PhotoCard from "@/components/projects/PhotoCard";
import { IMAGES } from "@/lib/images";
import { base44 } from "@/api/base44Client";
import { projectStatusMeta, isTaskDone } from "@/lib/projectStatus";
import { buildBreakdown, weightedProgress, giuliaInterpret, parseTasksFromText } from "@/lib/projectEngine";
import {
  ChevronDown, Bot, ArrowRight, Calendar, Users, Mail, Gavel, FileText, Plus,
} from "lucide-react";

/** Overview — visual bento dashboard. Big graphic elements carry the
 *  status; text stays minimal. Understand the project in under 10s. */

const tierColor = (pct) => {
  if (pct >= 100) return "bg-olive";
  if (pct >= 50) return "bg-powder";
  if (pct > 0) return "bg-steel";
  return "bg-steel/30";
};

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
      {/* Editorial bento: progress (tall left) · takenverdeling + giulia (top right) · onderdeel (bottom right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-4">
        {/* Progress hero — tall vertical, full height left */}
        <GlassPanel level={2} className="lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:row-span-2 relative overflow-hidden p-0 min-h-[340px] flex flex-col justify-end">
          <img src={IMAGES.walkTowardChair} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/35 to-charcoal/5" />
          <div className="absolute top-6 left-6 right-6 z-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/70 mb-1.5">Voortgang</p>
            <p className="text-[11px] text-ivory/55 leading-snug max-w-[220px]">Gewogen over alle onderdelen en subonderdelen.</p>
          </div>
          <div className="relative p-6">
            <div className="flex items-end gap-1.5">
              <span className="text-[112px] font-display font-bold leading-[0.78] tabular-nums text-ivory">{progress}</span>
              <span className="text-3xl font-display text-ivory/55 mb-3">%</span>
            </div>
            <div className="mt-5 h-1.5 w-full bg-ivory/20 rounded-full overflow-hidden">
              <div className="h-full bg-powder rounded-full transition-all duration-700" style={{ width: `${Math.max(progress, 2)}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <StatusBadge variant={ps.variant}>{ps.label}</StatusBadge>
            </div>
          </div>
        </GlassPanel>

        {/* Taakverdeling — top middle · nav-glass */}
        <div className="lg:col-span-4 lg:col-start-5 lg:row-start-1 glass-dark float-shadow rounded-[28px] text-ivory flex flex-col overflow-hidden">
          <div className="h-1.5 bg-powder" />
          <div className="p-6 flex-1 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 mb-5">Takenverdeling</p>
            <div className="flex-1 flex flex-col justify-center">
              <div className="rounded-2xl bg-warm-white/90 p-4">
                <StatusDistribution tasks={tasks} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-ivory/15">
              <Metric value={activeCount} label="Actief" onClick={() => onNavigate("Tasks")} />
              <Metric value={blockerCount} label="Blokkades" onClick={() => onNavigate("Tasks")} />
            </div>
          </div>
        </div>

        {/* Giulia — top right · nav-glass */}
        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1 glass-dark float-shadow rounded-[28px] text-ivory flex flex-col overflow-hidden">
          <div className="h-1.5 bg-olive" />
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-10 w-10 rounded-2xl bg-olive/20 ring-1 ring-olive/40 flex items-center justify-center">
                <Bot className="h-5 w-5 text-ivory" />
              </span>
              <div>
                <h3 className="text-base font-display font-bold leading-none text-ivory">Giulia</h3>
                <p className="text-[10px] uppercase tracking-wider text-ivory/55 mt-1">Project-assistent</p>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 mb-2">Interpretatie</p>
            <p className="text-sm leading-relaxed flex-1 text-ivory/90">{giulia.insight}</p>
            {giulia.nextStep && (
              <div className="mt-3 inline-flex items-start gap-2 rounded-xl bg-ivory/10 border border-ivory/20 px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-powder shrink-0" />
                <span className="text-[11px] font-medium text-ivory/90 leading-snug">{giulia.nextStep}</span>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-ivory/15">
              {!addOpen ? (
                <button onClick={() => setAddOpen(true)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-olive text-ivory py-2.5 text-xs font-medium hover:bg-olive/90 transition">
                  <Plus className="h-3.5 w-3.5" /> Delegeer aan Giulia
                </button>
              ) : (
                <div>
                  <textarea
                    value={addText}
                    onChange={(e) => setAddText(e.target.value)}
                    rows={3}
                    placeholder="Beschrijf wat Giulia moet oppakken — zij splitst het in taken."
                    className="w-full text-xs bg-ivory/10 border border-ivory/20 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-olive leading-relaxed text-ivory placeholder:text-ivory/40"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setAddOpen(false); setAddText(""); }} className="px-3 py-1.5 text-xs text-ivory/60 hover:text-ivory transition">Annuleer</button>
                    <GlassButton variant="primary" size="sm" className="flex-1" onClick={handleAdd} disabled={adding || !addText.trim()}>
                      {adding ? "Toevoegen…" : "Voeg taken toe"}
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voortgang per onderdeel — bottom, next to the progress card */}
        <GlassPanel level={2} className="lg:col-span-8 lg:col-start-5 lg:row-start-2 p-5 flex flex-col overflow-hidden">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Voortgang per onderdeel</p>
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3">
            {breakdown.map((o) => {
              const open = expanded === o.name;
              return (
                <div key={o.name}>
                  <button onClick={() => setExpanded(open ? null : o.name)} className="w-full group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
                      <span className="text-xs text-foreground/70 flex-1 text-left truncate group-hover:text-foreground transition-colors">{o.name}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{o.done}/{o.total}</span>
                      <span className="text-sm font-display font-semibold tabular-nums leading-none w-9 text-right">{o.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${tierColor(o.pct)}`} style={{ width: `${Math.max(o.pct, 1)}%` }} />
                    </div>
                  </button>
                  {open && o.subs.length > 1 && (
                    <div className="ml-6 mt-2 space-y-1.5">
                      {o.subs.map((s) => (
                        <div key={s.name} className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground flex-1 truncate">{s.name}</span>
                          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${tierColor(s.pct)}`} style={{ width: `${s.pct}%` }} />
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
      </div>

      {/* Bottom bento: deadlines · people · knowledge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Deadlines */}
        <PhotoCard src={IMAGES.hourglassJacket} className="lg:col-span-5">
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
        </PhotoCard>

        {/* People cluster */}
        <PhotoCard src={IMAGES.bagJacket} className="lg:col-span-3">
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
        </PhotoCard>

        {/* Knowledge & communication */}
        <PhotoCard src={IMAGES.notebookStacked} className="lg:col-span-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Kennis & communicatie</p>
          <div className="space-y-2.5">
            <MiniRow icon={Mail} label="E-mails" count={emails.length} onClick={() => onNavigate("Communication")} />
            <MiniRow icon={Gavel} label="Beslissingen" count={decisions.length} onClick={() => onNavigate("Decisions")} />
            <MiniRow icon={FileText} label="Bestanden" count={documents.length} onClick={() => onNavigate("Files")} />
          </div>
        </PhotoCard>
      </div>
    </div>
  );
}

function Metric({ value, label, onClick }) {
  return (
    <button onClick={onClick} className="text-left group">
      <p className="text-3xl font-display font-bold tabular-nums leading-none text-ivory group-hover:text-powder transition-colors">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ivory/55 mt-1.5">{label}</p>
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