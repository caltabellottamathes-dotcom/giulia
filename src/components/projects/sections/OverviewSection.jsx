import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import Avatar from "@/components/glass/Avatar";
import ProgressArc from "@/components/projects/ProgressArc";
import { base44 } from "@/api/base44Client";
import { isTaskDone, parseContext } from "@/lib/projectStatus";

const STATUS_COLORS = {
  klaar: "hsl(152 56% 42%)",
  actief: "hsl(var(--olive))",
  gepland: "hsl(211 86% 52%)",
  wacht: "hsl(38 92% 48%)",
  te_specifieren: "hsl(var(--foreground) / 0.22)",
};
const STATUS_LABEL = { klaar: "Klaar", actief: "Actief", gepland: "Gepland", wacht: "Wacht", te_specifieren: "Open" };

const statusKey = (s) => {
  if (["klaar", "done", "completed"].includes(s)) return "klaar";
  if (["actief", "in_progress", "today"].includes(s)) return "actief";
  if (["gepland", "upcoming"].includes(s)) return "gepland";
  if (["wacht", "waiting"].includes(s)) return "wacht";
  return "te_specifieren";
};

/** Overview — bold, graphic project dashboard built as bespoke infographics. */
export default function OverviewSection({ project, tasks, onNavigate }) {
  const [emails, setEmails] = useState([]);
  const [events, setEvents] = useState([]);
  const [docs, setDocs] = useState([]);
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
      setDocs(d.filter((x) => x.project_id === project.id));
      setContacts(c.filter((x) => (x.project_ids || []).includes(project.id)));
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

  const dist = { klaar: 0, actief: 0, gepland: 0, wacht: 0, te_specifieren: 0 };
  tasks.forEach((t) => { dist[statusKey(t.status)]++; });
  const distEntries = Object.entries(dist).filter(([, n]) => n > 0);

  const giuliaContext = [
    `${project.title} staat op ${progress}% — ${doneCount} van ${tasks.length} taken klaar.`,
    dist.actief > 0 ? `${dist.actief} taken momenteel actief.` : "",
    dist.wacht > 0 ? `${dist.wacht} taken wachten op vervolg.` : "",
    dist.te_specifieren > 0 ? `${dist.te_specifieren} onderdelen nog open.` : "",
    project.next_milestone ? `Volgende stap: ${project.next_milestone}.` : "",
  ].filter(Boolean).join(" ");

  const SegmentedBar = ({ items, total, height = "h-3" }) => (
    <div className={`${height} w-full flex rounded-full overflow-hidden bg-muted/50`}>
      {items.map(([k, n]) => (
        <div
          key={k}
          style={{ width: `${total ? (n / total) * 100 : 0}%`, background: STATUS_COLORS[k] }}
          className="h-full transition-all duration-700 ease-out"
          title={`${STATUS_LABEL[k]}: ${n}`}
        />
      ))}
    </div>
  );

  const StatTile = ({ value, label, onClick, children }) => (
    <button onClick={onClick} className="glass rounded-2xl p-5 text-left hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
      {children || <p className="text-4xl font-display font-bold tabular-nums leading-none">{value}</p>}
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2.5 font-medium">{label}</p>
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero — progress arc + status legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel level={2} className="lg:col-span-2 p-7">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Projectvoortgang</p>
            <span className="text-xs text-muted-foreground tabular-nums">{doneCount}/{tasks.length} taken</span>
          </div>
          <div className="flex items-center gap-6 lg:gap-10">
            <ProgressArc value={progress} size={188} />
            <div className="flex-1 space-y-3.5">
              {distEntries.map(([k, n]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: STATUS_COLORS[k] }} />
                  <span className="text-sm font-medium">{STATUS_LABEL[k]}</span>
                  <span className="text-2xl font-display font-bold tabular-nums ml-auto">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Giulia context — live status dot, bespoke graphic card */}
        <GlassPanel level={3} className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-olive opacity-60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-olive" />
            </span>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Giulia context</p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85 flex-1">{giuliaContext}</p>
          <button onClick={() => onNavigate("Tasks")} className="mt-4 self-start rounded-full bg-foreground text-background px-4 py-2 text-xs font-semibold hover:bg-foreground/90 transition">
            Naar taken
          </button>
        </GlassPanel>
      </div>

      {/* Onderdeel breakdown — segmented infographic bars */}
      <GlassPanel level={2} className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-display font-semibold">Onderdelen</h2>
          <button onClick={() => onNavigate("Tasks")} className="text-xs text-muted-foreground hover:text-foreground transition">Alle taken →</button>
        </div>
        <div className="space-y-4">
          {Object.entries(onderdelen).map(([ond, ts]) => {
            const d = ts.filter(isTaskDone).length;
            const p = ts.length ? Math.round((d / ts.length) * 100) : 0;
            const od = { klaar: 0, actief: 0, gepland: 0, wacht: 0, te_specifieren: 0 };
            ts.forEach((t) => { od[statusKey(t.status)]++; });
            const items = Object.entries(od).filter(([, n]) => n > 0);
            return (
              <button key={ond} onClick={() => onNavigate("Tasks")} className="block w-full text-left group">
                <div className="flex items-baseline gap-3 mb-1.5">
                  <span className="text-sm font-medium truncate flex-1 group-hover:text-olive transition-colors">{ond}</span>
                  <span className="text-2xl font-display font-bold tabular-nums leading-none">{p}<span className="text-sm text-muted-foreground font-medium">%</span></span>
                </div>
                <SegmentedBar items={items} total={ts.length} />
              </button>
            );
          })}
          {Object.keys(onderdelen).length === 0 && <p className="text-sm text-muted-foreground">Nog geen onderdelen.</p>}
        </div>
      </GlassPanel>

      {/* Quick info — big-number graphic tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile value={emails.length} label="E-mails" onClick={() => onNavigate("Communication")} />
        <StatTile value={events.length} label="Afspraken" onClick={() => onNavigate("Timeline")} />
        <StatTile value={docs.length} label="Bestanden" onClick={() => onNavigate("Files")} />
        <StatTile label="Betrokkenen" onClick={() => onNavigate("People")}>
          {contacts.length > 0 ? (
            <div className="flex items-center">
              <div className="flex -space-x-2.5">
                {contacts.slice(0, 5).map((c) => (
                  <Avatar key={c.id} src={c.avatar} name={c.name} size="sm" className="ring-2 ring-background" />
                ))}
              </div>
              <span className="text-4xl font-display font-bold tabular-nums leading-none ml-3">{contacts.length}</span>
            </div>
          ) : (
            <p className="text-4xl font-display font-bold tabular-nums leading-none">0</p>
          )}
        </StatTile>
      </div>
    </div>
  );
}