import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Palette, CalendarPlus, CheckSquare, Plus, ArrowUpRight, Clock, Check, FileText, Lightbulb, Users } from "lucide-react";

const LIFE = "hsl(var(--life-blue))";

export default function HobbyDetail() {
  const { id } = useParams();
  const [hobby, setHobby] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [newEvent, setNewEvent] = useState("");

  const load = async () => {
    try {
      const h = await base44.entities.Hobby.get(id).catch(() => null);
      setHobby(h);
      const pid = h?.linked_project_id;
      const [t, e, d, i, c] = await Promise.all([
        base44.entities.Task.list("deadline").catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.Document.list().catch(() => []),
        base44.entities.Idea.list().catch(() => []),
        base44.entities.Contact.filter({}, "name", 100).catch(() => []),
      ]);
      const matchTitle = (x) => h && (x.title || "").toLowerCase().includes((h.title || "").toLowerCase());
      setTasks(pid ? (t || []).filter((x) => x.project_id === pid) : (t || []).filter((x) => x.domain === "life" && matchTitle(x)));
      setEvents((e || []).filter((x) => (pid ? x.project_id === pid : x.domain === "life" && matchTitle(x))));
      setDocuments(pid ? (d || []).filter((x) => x.project_id === pid) : (d || []).filter((x) => matchTitle(x) && x.status !== "recent"));
      setIdeas(pid ? (i || []).filter((x) => x.project_id === pid) : (i || []).filter((x) => matchTitle(x)));
      setContacts((c || []).filter((x) => (x.project_ids || []).includes(pid)).filter(Boolean));
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const upcoming = useMemo(() => (events || []).filter((e) => new Date(e.start).getTime() >= Date.now()).sort((a, b) => (a.start || "").localeCompare(b.start || "")), [events]);
  const pastEvents = useMemo(() => (events || []).filter((e) => new Date(e.start).getTime() < Date.now()).sort((a, b) => (b.start || "").localeCompare(a.start || "")), [events]);
  const openTasks = (tasks || []).filter((t) => t.status !== "completed" && t.status !== "archived");

  const addTask = async () => { if (!newTask.trim() || !hobby) return; try { await base44.entities.Task.create({ title: newTask.trim(), domain: "life", project_id: hobby.linked_project_id || undefined, status: "today", priority: "medium" }); setNewTask(""); await load(); } catch { /* ignore */ } };
  const addEvent = async () => { if (!newEvent.trim() || !hobby) return; const start = new Date(Date.now() + 86400000); start.setHours(19, 0, 0, 0); try { await base44.entities.CalendarEvent.create({ title: newEvent.trim(), start: start.toISOString(), end: new Date(start.getTime() + 2 * 3600000).toISOString(), domain: "life", project_id: hobby.linked_project_id || undefined, status: "tentative" }); setNewEvent(""); await base44.entities.Hobby.update(hobby.id, { last_activity_date: new Date().toISOString() }); await load(); } catch { /* ignore */ } };
  const completeTask = async (t) => { try { await base44.entities.Task.update(t.id, { status: "completed" }); await load(); } catch { /* ignore */ } };
  const createProject = async () => { if (!hobby) return; try { const p = await base44.entities.Project.create({ title: `${hobby.title} project`, domain: "life", status: "in_progress" }); await base44.entities.Hobby.update(hobby.id, { linked_project_id: p.id }); await load(); } catch { /* ignore */ } };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" /></div>;
  if (!hobby) return <div className="text-center py-20"><p className="text-sm text-muted-foreground">Hobby niet gevonden.</p><Link to="/life/hobbies" className="text-life-blue text-sm mt-2 inline-block">Terug naar hobby's</Link></div>;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-hobby" image={hobby.image || IMAGES.chairWater} icon={Palette} eyebrow="LIFE · Hobby" title={hobby.title} subtitle={hobby.category || "Wat jou energie geeft"} />

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Afspraken</p><p className="text-3xl font-display font-semibold mt-1 text-life-blue">{upcoming.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Open taken</p><p className="text-3xl font-display font-semibold mt-1">{openTasks.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Status</p><p className="text-lg font-display font-semibold mt-1 capitalize">{hobby.status === "inactive" ? "inactief" : "actief"}</p></GlassPanel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Afspraken */}
        <GlassPanel level={2} className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Repetities / Afspraken</p>
            <Clock className="w-4 h-4 text-life-blue" />
          </div>
          <div className="flex gap-2 mb-4">
            <input value={newEvent} onChange={(e) => setNewEvent(e.target.value)} placeholder="Activiteit toevoegen" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-life-blue" />
            <button onClick={addEvent} className="rounded-xl px-3 py-2 text-ivory" style={{ background: LIFE }}><CalendarPlus className="w-4 h-4" /></button>
          </div>
          {upcoming.length ? (
            <div className="divide-y divide-border/30">
              {upcoming.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: LIFE }} />
                  <p className="text-sm flex-1 truncate">{e.title}</p>
                  <span className="text-xs text-muted-foreground">{new Date(e.start).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Niets ingepland.</p>}
          {pastEvents.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Eerder</p>
              <div className="divide-y divide-border/20">
                {pastEvents.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center py-1.5">
                    <p className="text-sm flex-1 truncate text-muted-foreground">{e.title}</p>
                    <span className="text-xs text-muted-foreground">{new Date(e.start).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Taken */}
        <GlassPanel level={2} className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Taken</p>
            <CheckSquare className="w-4 h-4 text-life-blue" />
          </div>
          <div className="flex gap-2 mb-4">
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Taak toevoegen" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-life-blue" />
            <button onClick={addTask} className="rounded-xl px-3 py-2 text-ivory" style={{ background: LIFE }}><Plus className="w-4 h-4" /></button>
          </div>
          {openTasks.length ? (
            <div className="divide-y divide-border/30">
              {openTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <p className="text-sm flex-1 truncate">{t.title}</p>
                  <button onClick={() => completeTask(t)} className="text-life-blue hover:scale-110 transition"><Check className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Geen open taken.</p>}
        </GlassPanel>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ideeën</p></div>
          {ideas.length ? <div className="space-y-2">{ideas.slice(0, 6).map((i) => <p key={i.id} className="text-sm truncate">{i.title}</p>)}</div> : <p className="text-sm text-muted-foreground">Nog geen ideeën.</p>}
        </GlassPanel>
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Documenten</p></div>
          {documents.length ? <div className="space-y-2">{documents.slice(0, 6).map((d) => <p key={d.id} className="text-sm truncate">{d.name}</p>)}</div> : <p className="text-sm text-muted-foreground">Nog geen bestanden.</p>}
        </GlassPanel>
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-life-blue" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mensen</p></div>
          {contacts.length ? <div className="space-y-2">{contacts.slice(0, 6).map((c) => <p key={c.id} className="text-sm truncate">{c.name}</p>)}</div> : <p className="text-sm text-muted-foreground">Nog niemand gekoppeld.</p>}
        </GlassPanel>
      </div>

      <div className="flex flex-wrap gap-3">
        {hobby.linked_project_id ? (
          <Link to={`/projects/${hobby.linked_project_id}`}>
            <GlassButton variant="outline" size="md">Naar gekoppeld project <ArrowUpRight className="h-4 w-4 ml-1" /></GlassButton>
          </Link>
        ) : (
          <GlassButton variant="primary" size="md" onClick={createProject}>Gerelateerd project aanmaken</GlassButton>
        )}
        <Link to="/life/hobbies"><GlassButton variant="outline" size="md">Alle hobby's</GlassButton></Link>
      </div>
    </div>
  );
}