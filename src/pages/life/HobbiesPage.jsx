import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Palette, Plus, ArrowUpRight, Clock } from "lucide-react";

export default function HobbiesPage() {
  const [hobbies, setHobbies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: "" });

  const load = async () => {
    try {
      const [h, e] = await Promise.all([base44.entities.Hobby.list().catch(() => []), base44.entities.CalendarEvent.list("start").catch(() => [])]);
      setHobbies(h || []); setEvents(e || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (hobbies || []).filter((h) => h.status !== "inactive"), [hobbies]);
  const inactive = (hobbies || []).filter((h) => h.status === "inactive");
  const lifeEvents = useMemo(() => (events || []).filter((e) => e.domain === "life"), [events]);
  const upcoming = lifeEvents.filter((e) => new Date(e.start).getTime() >= Date.now()).sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const history = lifeEvents.filter((e) => new Date(e.start).getTime() < Date.now()).sort((a, b) => (b.start || "").localeCompare(a.start || "")).slice(0, 6);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.Hobby.create({ title: form.title.trim(), category: form.category || undefined, status: "active" }); setForm({ title: "", category: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };

  const HobbyCard = ({ h }) => (
    <Link to={`/life/hobbies/${h.id}`} className="block">
      <GlassPanel level={2} className="overflow-hidden hover:-translate-y-1 transition-transform h-full flex flex-col">
        <div className="relative h-28">
          <img src={h.image || IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
          {h.status === "inactive" && <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wide font-semibold text-ivory/80 rounded-full px-2 py-0.5 bg-charcoal/50">inactief</span>}
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-display font-semibold truncate">{h.title}</h3>
            {h.category && <p className="text-xs text-muted-foreground mt-0.5 truncate">{h.category}</p>}
          </div>
          <ArrowUpRight className="h-5 w-5 text-life-blue shrink-0" />
        </div>
      </GlassPanel>
    </Link>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-hobbies" image={IMAGES.lifeHobbies} icon={Palette} eyebrow="LIFE" title="Hobby's" subtitle="Wat jou energie geeft — met plek in je week"
        actions={<GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Hobby</GlassButton>} />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Hobby toevoegen</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Hobby (bv. gitaar, schilderen)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Categorie (optioneel)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--life-blue-deep))" }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </GlassPanel>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Actief</p><p className="text-3xl font-display font-semibold mt-1 text-life-blue">{active.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Aankomend</p><p className="text-3xl font-display font-semibold mt-1">{upcoming.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Inactief</p><p className="text-3xl font-display font-semibold mt-1 text-life-sand">{inactive.length}</p></GlassPanel>
      </div>

      {upcoming.length > 0 && (
        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Aankomende afspraken</p>
          <div className="divide-y divide-border/30">
            {upcoming.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-4 py-2.5">
                <Clock className="w-4 h-4 text-life-blue" />
                <p className="text-sm font-medium flex-1 truncate">{e.title}</p>
                <span className="text-xs text-muted-foreground">{new Date(e.start).toLocaleString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : active.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{active.map((h) => <HobbyCard key={h.id} h={h} />)}</div>
      ) : <GlassPanel level={2} className="p-12 text-center"><p className="text-sm text-muted-foreground">Nog geen hobby's — voeg er een toe.</p></GlassPanel>}

      {inactive.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Inactief</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">{inactive.map((h) => <HobbyCard key={h.id} h={h} />)}</div>
        </>
      )}

      {history.length > 0 && (
        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Recente activiteit</p>
          <div className="divide-y divide-border/20">
            {history.map((e) => (
              <div key={e.id} className="flex items-center gap-4 py-2.5">
                <p className="text-sm flex-1 truncate text-muted-foreground">{e.title}</p>
                <span className="text-xs text-muted-foreground">{new Date(e.start).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}