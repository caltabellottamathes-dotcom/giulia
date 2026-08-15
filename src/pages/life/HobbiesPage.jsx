import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { hobbyGroups, hobbyHeadline, hobbyState, fieldSize, stateColor, attentionFlow, hobbyRhythm, rhythmState, fmtDaysAgo } from "@/lib/hobbyUtils";
import { Palette, Plus, ArrowUpRight, Search, Sliders, Film, Calendar, Star, Compass } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "active", label: "Active" },
  { key: "explore", label: "Explore" },
  { key: "projects", label: "Projects" },
  { key: "moments", label: "Moments" },
  { key: "archive", label: "Archive" },
];

const TYPES = ["music", "creative", "cultural", "sport", "learning", "collecting", "other"];

export default function HobbiesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => (new URLSearchParams(window.location.search).get("tab") || "overview"));
  const [hobbies, setHobbies] = useState([]);
  const [events, setEvents] = useState([]);
  const [moments, setMoments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "creative", current_thread: "" });

  const load = async () => {
    try {
      const [h, e, m, p] = await Promise.all([
        base44.entities.Hobby.list("-last_activity_date").catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.HobbyMoment.list("-date").catch(() => []),
        base44.entities.Project.list().catch(() => []),
      ]);
      setHobbies(h || []); setEvents(e || []); setMoments(m || []); setProjects(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const g = useMemo(() => hobbyGroups(hobbies), [hobbies]);
  const headline = hobbyHeadline(g);
  const flow = useMemo(() => attentionFlow(hobbies), [hobbies]);
  const rhythm = useMemo(() => hobbyRhythm(events), [events]);
  const rState = useMemo(() => rhythmState(rhythm), [rhythm]);
  const hobbyProjects = useMemo(() => (projects || []).filter((p) => p.domain === "life" || (hobbies || []).some((h) => h.linked_project_id === p.id)), [projects, hobbies]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.Hobby.create({ title: form.title.trim(), type: form.type, current_thread: form.current_thread || undefined, status: "active", activity_level: "active" }); setForm({ title: "", type: "creative", current_thread: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const setTab2 = (t) => { setTab(t); navigate(`/life/hobbies?tab=${t}`, { replace: true }); };

  const HobbyCard = ({ h, big }) => (
    <Link to={`/life/hobbies/${h.id}`} className="block">
      <GlassPanel level={2} className="overflow-hidden hover:-translate-y-1 transition-transform h-full flex flex-col">
        <div className={`relative ${big ? "h-40" : "h-28"}`}>
          <img src={h.image || IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.4)", color: stateColor(hobbyState(h)) }}>{hobbyState(h)}</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className={`font-display font-semibold truncate ${big ? "text-2xl" : ""}`}>{h.title}</h3>
            {h.current_thread && <p className="text-xs text-muted-foreground mt-0.5 truncate">{h.current_thread}</p>}
            <p className="text-[11px] text-muted-foreground mt-1">{fmtDaysAgo(h.last_activity_date)}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-life-blue shrink-0" />
        </div>
      </GlassPanel>
    </Link>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-hobbies" image={IMAGES.lifeHobbies} icon={Palette} eyebrow="LIFE" title="Hobby's" subtitle="Things you're doing because you want to."
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Hobby</GlassButton>
          </div>
        } />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Hobby toevoegen</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Naam" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none capitalize">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={form.current_thread} onChange={(e) => setForm((f) => ({ ...f, current_thread: e.target.value }))} placeholder="Waar je nu mee bezig bent" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--life-blue-deep))" }}><Plus className="h-4 w-4" /> Voeg toe</button>
        </GlassPanel>
      )}

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab2(t.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition" style={tab === t.key ? { background: "hsl(var(--life-blue))", color: "hsl(var(--charcoal))" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : (
        <>
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="relative rounded-3xl overflow-hidden h-56">
                <img src={IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-display font-semibold tracking-[-0.03em] text-ivory">WHAT ARE YOU INTO?</h2>
                    <p className="text-sm text-ivory/70 mt-2">{g.active.length} active · {g.quiet.length} quiet · {g.news.length + g.emerging.length} emerging</p>
                  </div>
                </div>
              </div>

              {/* Hobby landscape — levend veld */}
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Hobby landscape</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-h-[80px]">
                  {hobbies.filter((h) => hobbyState(h) !== "archived").sort((a, b) => fieldSize(b) - fieldSize(a)).map((h) => {
                    const s = hobbyState(h); const sz = fieldSize(h); const fs = 14 + Math.round(sz * 28);
                    return <span key={h.id} className="font-display font-semibold tracking-tight" style={{ fontSize: `${fs}px`, color: s === "quiet" ? "hsl(var(--muted-foreground))" : stateColor(s) }}>{h.title.toUpperCase()}</span>;
                  })}
                </div>
              </GlassPanel>

              {/* Currently active */}
              {g.active.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Currently active</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{g.active.map((h) => <HobbyCard key={h.id} h={h} big />)}</div>
                </div>
              )}

              {/* Attention flow */}
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Attention flow</p>
                <div className="space-y-3">
                  {flow.map((f) => (
                    <div key={f.title} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-28 shrink-0 truncate">{f.title}</span>
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: 8 }).map((_, i) => <span key={i} className="h-2.5 flex-1 rounded-full" style={{ background: i < f.level ? stateColor(f.state) : "hsl(var(--foreground)/0.08)" }} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* New interests */}
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3 flex items-center gap-1.5"><Star className="w-3 h-3" /> New</p>
                  {g.news.length + g.emerging.length ? (
                    <div className="space-y-2.5">
                      {[...g.news, ...g.emerging].map((h) => (
                        <div key={h.id} className="flex items-center justify-between">
                          <div><p className="text-sm font-semibold">{h.title.toUpperCase()}</p><p className="text-[11px] text-muted-foreground">{h.discovered_date ? `${fmtDaysAgo(h.discovered_date)}` : "recent"}</p></div>
                          <Link to={`/life/hobbies/${h.id}`} className="text-xs font-semibold text-life-blue">Start →</Link>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground italic">Nog geen nieuwe interesses.</p>}
                </GlassPanel>

                {/* Quiet hobbies */}
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Quiet</p>
                  {g.quiet.length ? (
                    <div className="space-y-2.5">
                      {g.quiet.map((h) => (
                        <div key={h.id} className="flex items-center justify-between">
                          <Link to={`/life/hobbies/${h.id}`} className="text-sm font-medium">{h.title}</Link>
                          <span className="text-[11px] text-muted-foreground">{fmtDaysAgo(h.last_activity_date)}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground italic">Alles is actief.</p>}
                </GlassPanel>
              </div>

              {/* Hobby rhythm */}
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Hobby rhythm · <span style={{ color: stateColor(rState === "ACTIVE" ? "active" : rState === "QUIET" ? "quiet" : "new") }}>{rState}</span></p>
                <div className="flex items-end justify-between gap-2">
                  {rhythm.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <span className={`text-[10px] truncate ${d.label === "—" ? "text-muted-foreground/40" : "text-foreground font-medium"}`}>{d.label === "—" ? "—" : d.label.split(" ")[0]}</span>
                      <span className="w-2.5 rounded-full" style={{ height: d.label === "—" ? 8 : 40, background: d.label === "—" ? "hsl(var(--foreground)/0.1)" : "hsl(var(--life-blue-deep))" }} />
                      <span className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">{d.day}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          )}

          {tab === "active" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.active.length ? g.active.map((h) => <HobbyCard key={h.id} h={h} big />) : <p className="text-sm text-muted-foreground col-span-full">Niets nu actief.</p>}
            </div>
          )}

          {tab === "explore" && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3 flex items-center gap-1.5"><Compass className="w-3.3 h-3.3" /> Curious & new</p>
                {g.news.length + g.emerging.length ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...g.news, ...g.emerging].map((h) => (
                      <GlassPanel key={h.id} level={2} className="p-5">
                        <p className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: stateColor(hobbyState(h)) }}>{hobbyState(h)}</p>
                        <h3 className="text-2xl font-display font-semibold mt-1">{h.title.toUpperCase()}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{h.discovered_date ? `${fmtDaysAgo(h.discovered_date)}` : "recent"} · {h.mentions_count || 0} vermeldingen</p>
                        <Link to={`/life/hobbies/${h.id}`} className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ivory" style={{ background: "hsl(var(--life-sand-deep))" }}>Start</Link>
                      </GlassPanel>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground italic">Nog niets om te verkennen — Giulia herkent nieuwe interesses automatisch.</p>}
              </div>
            </div>
          )}

          {tab === "projects" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Hobby-projecten leven in het Projects-systeem — getagd LIFE → HOBBIES.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hobbyProjects.length ? hobbyProjects.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`}>
                    <GlassPanel level={2} className="p-5 hover:-translate-y-1 transition-transform h-full">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Project · LIFE</p>
                      <h3 className="text-xl font-display font-semibold mt-1">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{p.status} · {p.progress || 0}%</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-life-blue">Open project <ArrowUpRight className="w-3 h-3" /></span>
                    </GlassPanel>
                  </Link>
                )) : <p className="text-sm text-muted-foreground col-span-full italic">Geen hobby-projecten.</p>}
              </div>
            </div>
          )}

          {tab === "moments" && (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden h-40">
                <img src={IMAGES.chairWater} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6"><h2 className="text-3xl font-display font-semibold text-ivory">RECENT MOMENTS</h2></div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {moments.length ? moments.map((m) => (
                  <GlassPanel key={m.id} level={2} className="overflow-hidden">
                    <div className="relative h-28">
                      <img src={m.photo || IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                      <span className="absolute top-3 left-3 text-[9px] uppercase tracking-wide font-semibold text-ivory/85 px-2 py-0.5 rounded-full bg-charcoal/50 flex items-center gap-1"><Film className="w-2.5 h-2.5" />{m.activity}</span>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{m.date ? new Date(m.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
                      <h3 className="text-base font-display font-semibold mt-0.5">{m.title}</h3>
                      {m.location && <p className="text-xs text-muted-foreground mt-0.5">{m.location}</p>}
                    </div>
                  </GlassPanel>
                )) : <p className="text-sm text-muted-foreground italic col-span-full">Nog geen momenten — log er een via een hobby.</p>}
              </div>
            </div>
          )}

          {tab === "archive" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
              {g.archived.length ? g.archived.map((h) => <HobbyCard key={h.id} h={h} />) : <p className="text-sm text-muted-foreground italic col-span-full">Niets gearchiveerd — archiveren verwijdert niet, het haalt uit het actieve veld.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}