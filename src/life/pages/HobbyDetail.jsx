import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { hobbyState, stateColor, fmtDaysAgo } from "@/lib/hobbyUtils";
import { Palette, CalendarPlus, Plus, ArrowUpRight, Check, FileText, Lightbulb, Users, Film, Briefcase, Sparkles } from "lucide-react";

const LIFE = "hsl(var(--life-blue-deep))";

export default function HobbyDetail() {
  const { id } = useParams();
  const [hobby, setHobby] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newEvent, setNewEvent] = useState("");

  const load = async () => {
    try {
      const h = await base44.entities.Hobby.get(id).catch(() => null);
      setHobby(h);
      const [t, e, d, i, c, m] = await Promise.all([
        base44.entities.Task.list("deadline").catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.Document.list().catch(() => []),
        base44.entities.Idea.list().catch(() => []),
        base44.entities.Contact.filter({}, "name", 100).catch(() => []),
        base44.entities.HobbyMoment.list("-date").catch(() => []),
      ]);
      const matchTitle = (x) => h && (x.title || "").toLowerCase().includes((h.title || "").toLowerCase());
      const pid = h?.linked_project_id;
      setTasks(pid ? (t || []).filter((x) => x.project_id === pid) : (t || []).filter((x) => x.domain === "life" && matchTitle(x)));
      setEvents((e || []).filter((x) => (pid ? x.project_id === pid : x.domain === "life" && matchTitle(x))));
      setDocuments(pid ? (d || []).filter((x) => x.project_id === pid) : (d || []).filter((x) => matchTitle(x) && x.status !== "recent"));
      setIdeas(pid ? (i || []).filter((x) => x.project_id === pid) : (i || []).filter((x) => matchTitle(x)));
      setContacts((c || []).filter((x) => (x.project_ids || []).includes(pid)).filter(Boolean));
      setMoments((m || []).filter((x) => x.hobby_id === id || matchTitle(x)));
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const state = hobby ? hobbyState(hobby) : "quiet";
  const upcoming = useMemo(() => (events || []).filter((e) => new Date(e.start).getTime() >= Date.now()).sort((a, b) => (a.start || "").localeCompare(b.start || "")), [events]);
  const pastEvents = useMemo(() => (events || []).filter((e) => new Date(e.start).getTime() < Date.now()).sort((a, b) => (b.start || "").localeCompare(a.start || "")), [events]);
  const openTasks = (tasks || []).filter((t) => t.status !== "completed" && t.status !== "archived");

  const addEvent = async () => { if (!newEvent.trim() || !hobby) return; const start = new Date(Date.now() + 86400000); start.setHours(19, 0, 0, 0); try { await base44.entities.CalendarEvent.create({ title: newEvent.trim(), start: start.toISOString(), end: new Date(start.getTime() + 2 * 3600000).toISOString(), domain: "life", project_id: hobby.linked_project_id || undefined, status: "tentative" }); await base44.entities.Hobby.update(hobby.id, { last_activity_date: new Date().toISOString(), activity_level: "active" }); setNewEvent(""); await load(); } catch { /* ignore */ } };
  const addNote = async () => { if (!newNote.trim() || !hobby) return; try { await base44.entities.Note.create({ title: `${hobby.title} — notitie`, content: newNote.trim(), kind: "note" }); setNewNote(""); } catch { /* ignore */ } };
  const addMoment = async () => { if (!hobby) return; try { await base44.entities.HobbyMoment.create({ title: `${hobby.title} sessie`, hobby_id: hobby.id, activity: "creative_session", date: new Date().toISOString() }); await base44.entities.Hobby.update(hobby.id, { last_activity_date: new Date().toISOString(), activity_level: "active" }); await load(); } catch { /* ignore */ } };
  const createProject = async () => { if (!hobby) return; try { const p = await base44.entities.Project.create({ title: `${hobby.title} project`, domain: "life", status: "in_progress" }); await base44.entities.Hobby.update(hobby.id, { linked_project_id: p.id }); await load(); } catch { /* ignore */ } };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" /></div>;
  if (!hobby) return <div className="text-center py-20"><p className="text-sm text-muted-foreground">Hobby niet gevonden.</p><Link to="/life/hobbies" className="text-life-blue text-sm mt-2 inline-block">Terug naar hobby's</Link></div>;

  // Activity timeline (conversation → idea → listening → session → file → project)
  const timeline = [
    { label: "Conversation", on: ideas.length > 0 || moments.length > 0 },
    { label: "Idea", on: ideas.length > 0 },
    { label: "Listening", on: true },
    { label: "Session", on: moments.length > 0 || pastEvents.length > 0 },
    { label: "File", on: documents.length > 0 },
    { label: "Project", on: !!hobby.linked_project_id },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-hobby" image={hobby.image || IMAGES.lifeHobbies} icon={Palette} eyebrow="LIFE · Hobby" title={hobby.title} subtitle={hobby.current_thread || hobby.category || "What you do because you want to"} />

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Current state</p><p className="text-2xl font-display font-semibold mt-1 uppercase" style={{ color: stateColor(state) }}>{state}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Last activity</p><p className="text-2xl font-display font-semibold mt-1">{fmtDaysAgo(hobby.last_activity_date)}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Aankomend</p><p className="text-2xl font-display font-semibold mt-1 text-life-blue">{upcoming.length}</p></GlassPanel>
      </div>

      {/* Current thread */}
      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current thread</p>
        <h3 className="text-2xl font-display font-semibold mt-1">{hobby.current_thread || "—"}</h3>
      </GlassPanel>

      {/* Activity timeline */}
      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Activity</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {timeline.map((t, i) => (
            <React.Fragment key={t.label}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full" style={{ background: t.on ? LIFE : "hsl(var(--foreground)/0.15)" }} />
                <span className={`text-[9px] uppercase tracking-wide font-semibold ${t.on ? "" : "text-muted-foreground/50"}`}>{t.label}</span>
              </div>
              {i < timeline.length - 1 && <span className="h-px flex-1 min-w-[12px]" style={{ background: timeline[i + 1].on ? LIFE : "hsl(var(--foreground)/0.1)" }} />}
            </React.Fragment>
          ))}
        </div>
      </GlassPanel>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Afspraken / sessions */}
        <GlassPanel level={2} className="p-6">
          <div className="flex items-center justify-between mb-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sessions / Afspraken</p><CalendarPlus className="w-4 h-4 text-life-blue" /></div>
          <div className="flex gap-2 mb-4">
            <input value={newEvent} onChange={(e) => setNewEvent(e.target.value)} placeholder="Sessie toevoegen" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-life-blue" />
            <button onClick={addEvent} className="rounded-xl px-3 py-2 text-ivory" style={{ background: LIFE }}><Plus className="w-4 h-4" /></button>
          </div>
          {upcoming.length ? <div className="divide-y divide-border/30">{upcoming.map((e) => <div key={e.id} className="flex items-center gap-3 py-2.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: LIFE }} /><p className="text-sm flex-1 truncate">{e.title}</p><span className="text-xs text-muted-foreground">{new Date(e.start).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span></div>)}</div> : <p className="text-sm text-muted-foreground">Niets ingepland.</p>}
        </GlassPanel>

        {/* Taken */}
        <GlassPanel level={2} className="p-6">
          <div className="flex items-center justify-between mb-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Taken</p><Check className="w-4 h-4 text-life-blue" /></div>
          {openTasks.length ? <div className="divide-y divide-border/30">{openTasks.map((t) => <div key={t.id} className="flex items-center gap-3 py-2.5"><p className="text-sm flex-1 truncate">{t.title}</p><button onClick={() => base44.entities.Task.update(t.id, { status: "completed" }).then(load)} className="text-life-blue hover:scale-110 transition"><Check className="w-4 h-4" /></button></div>)}</div> : <p className="text-sm text-muted-foreground">Geen open taken.</p>}
        </GlassPanel>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <GlassPanel level={2} className="p-5"><div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ideeën</p></div>{ideas.length ? <div className="space-y-2">{ideas.slice(0, 6).map((i) => <p key={i.id} className="text-sm truncate">{i.title}</p>)}</div> : <p className="text-sm text-muted-foreground">Nog geen ideeën.</p>}</GlassPanel>
        <GlassPanel level={2} className="p-5"><div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bestanden</p></div>{documents.length ? <div className="space-y-2">{documents.slice(0, 6).map((d) => <p key={d.id} className="text-sm truncate">{d.name}</p>)}</div> : <p className="text-sm text-muted-foreground">Nog geen bestanden.</p>}</GlassPanel>
        <GlassPanel level={2} className="p-5"><div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mensen</p></div>{contacts.length ? <div className="space-y-2">{contacts.slice(0, 6).map((c) => <p key={c.id} className="text-sm truncate">{c.name}</p>)}</div> : <p className="text-sm text-muted-foreground">Nog niemand.</p>}</GlassPanel>
      </div>

      {/* Moments */}
      {moments.length > 0 && (
        <GlassPanel level={2} className="p-6">
          <div className="flex items-center gap-2 mb-3"><Film className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Related moments</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {moments.slice(0, 6).map((m) => (
              <div key={m.id} className="relative h-20 rounded-xl overflow-hidden">
                <img src={m.photo || IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                <p className="absolute bottom-2 left-2 text-xs font-semibold text-ivory truncate">{m.title}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Actions */}
      <GlassPanel level={2} className="p-5">
        <div className="flex flex-wrap gap-2">
          <GlassButton variant="primary" size="sm" onClick={addMoment}><Sparkles className="h-3.5 w-3.5" /> Start activity</GlassButton>
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Notitie" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-life-blue" />
            <GlassButton variant="glass" size="sm" onClick={addNote}><Plus className="h-3.5 w-3.5" /> Note</GlassButton>
          </div>
          {hobby.linked_project_id ? (
            <Link to={`/projects/${hobby.linked_project_id}`}><GlassButton variant="outline" size="sm">Open project <ArrowUpRight className="h-3.5 w-3.5 ml-1" /></GlassButton></Link>
          ) : (
            <GlassButton variant="glass" size="sm" onClick={createProject}><Briefcase className="h-3.5 w-3.5" /> Project</GlassButton>
          )}
          <Link to="/life/hobbies"><GlassButton variant="ghost" size="sm">Alle hobby's</GlassButton></Link>
        </div>
      </GlassPanel>
    </div>
  );
}