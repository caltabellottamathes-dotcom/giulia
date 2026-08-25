import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import HouseholdStateViz from "@/life/components/HouseholdStateViz";
import HouseholdRoutineCard from "@/life/components/HouseholdRoutineCard";
import HouseholdItemCard from "@/life/components/HouseholdItemCard";
import { IMAGES } from "@/lib/images";
import { householdZones, mattersItems, householdHeadline, isAttention, statusLabel, routineState, nextExpected } from "@/lib/householdUtils";
import { Home, Repeat, ShoppingCart, Wrench, Plus, Sparkles, CheckCircle2, Search } from "lucide-react";
import { logLifeActivity } from "@/lib/lifeActivity";
import LifeActivityFeed from "@/life/components/LifeActivityFeed";
import RoutinesPanel from "@/life/panels/RoutinesPanel";

const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const BLUE_DEEP = "hsl(var(--life-blue-deep))";
const DOW = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];
const KIND_OPTS = [{ k: "task", l: "Taak" }, { k: "shopping", l: "Boodschap" }, { k: "maintenance", l: "Onderhoud" }, { k: "issue", l: "Issue" }, { k: "routine", l: "Routine" }, { k: "item", l: "Voorwerp" }];

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: Home },
  { key: "ROUTINES", label: "Routines", icon: Repeat },
  { key: "SHOPPING", label: "Boodschappen", icon: ShoppingCart },
  { key: "MAINTENANCE", label: "Onderhoud", icon: Wrench },
  { key: "HOUSEHOLD", label: "Huishouden", icon: Sparkles },
  { key: "SELFCARE", label: "Zelfzorg", icon: Repeat },
];

const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; };
const ago = (d) => { if (!d) return "—"; const n = Math.round((Date.now() - new Date(d).getTime()) / 86400000); return n <= 0 ? "vandaag" : n === 1 ? "gisteren" : `${n} dagen geleden`; };
const fmt = (d) => d ? new Date(d).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "—";

export default function HouseholdPage() {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => { const t = new URLSearchParams(window.location.search).get("tab"); return t ? t.toUpperCase() : "OVERVIEW"; });
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", kind: "task", category: "", notes: "", frequency_days: "", preferred_time: "evening" });

  const load = async () => {
    try {
      const [it, t, e] = await Promise.all([
        base44.entities.HouseholdItem.list().catch(() => []),
        base44.entities.Task.filter({ domain: "life" }).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
      ]);
      setItems(it || []); setTasks(t || []); setEvents(e || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const zones = useMemo(() => householdZones(items), [items]);
  const matters = useMemo(() => mattersItems(items, tasks), [items, tasks]);
  const headline = householdHeadline(matters, items);

  const routines = items.filter((i) => i.kind === "routine");
  const shopping = items.filter((i) => i.kind === "shopping");
  const maintenance = items.filter((i) => i.kind === "maintenance");
  const issues = items.filter((i) => i.kind === "issue");
  const householdItems = items.filter((i) => i.kind === "item");
  const history = items.filter((i) => i.status === "done" || i.last_done).sort((a, b) => new Date(b.last_done || 0) - new Date(a.last_done || 0));

  const complete = async (i) => { try { await base44.entities.HouseholdItem.update(i.id, { status: "done", last_done: new Date().toISOString(), next_due: i.frequency_days ? new Date(Date.now() + i.frequency_days * 86400000).toISOString().slice(0, 10) : i.next_due }); await logLifeActivity("Household", "completed", `${i.title} voltooid`); await load(); } catch { /* ignore */ } };
  const createItem = async () => {
    if (!form.title.trim()) return;
    try {
      const base = { title: form.title.trim(), category: form.category || undefined, notes: form.notes || undefined, preferred_time: form.preferred_time, frequency_days: form.frequency_days ? Number(form.frequency_days) : undefined, status: form.kind === "issue" ? "open" : form.kind === "routine" ? "good" : "needs_attention" };
      if (form.kind === "task") await base44.entities.Task.create({ title: form.title.trim(), domain: "life", status: "today" });
      else await base44.entities.HouseholdItem.create({ ...base, kind: form.kind });
      await logLifeActivity("Household", "added", `${form.title.trim()} toegevoegd`);
      setForm({ title: "", kind: "task", category: "", notes: "", frequency_days: "", preferred_time: "evening" });
      await load();
    } catch { /* ignore */ }
  };

  const todayTasks = tasks.filter((t) => t.status === "today" || t.status === "overdue");
  const todayRoutines = routines.filter((r) => { const st = routineState(r); return st.hot; });

  const weekStrip = useMemo(() => {
    const start = startOfWeek();
    return DOW.map((label, i) => {
      const d = new Date(start.getTime() + i * 86400000); d.setHours(0, 0, 0, 0);
      const next = d.getTime() + 86400000;
      const dayRoutines = routines.filter((r) => { const n = nextExpected(r); return n && n.getTime() >= d.getTime() && n.getTime() < next; });
      const dayTasks = tasks.filter((t) => { const dl = t.deadline ? new Date(t.deadline).getTime() : null; return dl && dl >= d.getTime() && dl < next; });
      const label2 = [...dayRoutines.map((r) => r.title), ...dayTasks.map((t) => t.title)][0] || null;
      return { label, date: d, item: label2 };
    });
  }, [routines, tasks]);

  const filtered = (list) => query ? list.filter((i) => (i.title || "").toLowerCase().includes(query.toLowerCase())) : list;
  const selectedRoutine = routines.find((r) => r.id === selected);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-household" image={IMAGES.lifeHousehold} icon={Home} eyebrow="LIFE" title="Reminders For Home." subtitle={matters.length === 0 ? "Alles loopt soepel — niets vraagt om aandacht." : `${matters.length} dingen waard om deze week te doen.`}
        actions={<GlassButton variant="primary" size="md" onClick={() => document.getElementById("creator")?.scrollIntoView({ behavior: "smooth" })}><Plus className="h-4 w-4" /> Toevoegen</GlassButton>} />

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${tab === t.key ? "text-ivory" : "text-foreground/55 hover:text-foreground"}`} style={tab === t.key ? { background: SAND, color: "hsl(var(--charcoal))" } : {}}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "OVERVIEW" && (
        <div className="space-y-4">
          <GlassPanel level={2} className="p-6">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Jouw huis</p>
                <h2 className="text-4xl font-display font-semibold tracking-tight mt-1">{matters.length === 0 ? "ALLES GOED" : `${matters.length} DINGEN`}</h2>
                <p className="text-sm text-muted-foreground mt-1">{matters.length === 0 ? "Niets vraagt om aandacht." : "Dingen die deze week helpen."}</p>
              </div>
            </div>
            <HouseholdStateViz zones={zones} />
          </GlassPanel>

          <div className="grid md:grid-cols-2 gap-4">
            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Vandaag</p>
              {(todayTasks.length || todayRoutines.length) ? (
                <div className="space-y-2 mt-3">
                  {[...todayRoutines, ...todayTasks].map((x, i) => (
                    <div key={x.id || i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: SAND }} />
                      <p className="text-sm flex-1 truncate">{x.title}</p>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{x.preferred_time || "vandaag"}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground mt-3 italic">Vandaag hoeft er niets speciaals.</p>}
            </GlassPanel>

            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Deze week</p>
              <div className="grid grid-cols-7 gap-1.5">
                {weekStrip.map((d, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-foreground/45">{d.label}</span>
                    <div className="rounded-lg min-h-[56px] p-1.5 flex items-center justify-center" style={d.item ? { background: SAND, color: "hsl(var(--charcoal))" } : { border: "1px dashed hsl(var(--foreground) / 0.15)" }}>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-center leading-tight line-clamp-2">{d.item || "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Aandacht nodig</p>
            {matters.length ? (
              <div className="grid sm:grid-cols-2 gap-2">
                {matters.slice(0, 6).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--foreground) / 0.04)" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: SAND }} />
                    <p className="text-sm flex-1 truncate">{m.title}</p>
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: SAND_DEEP }}>{statusLabel(m.status)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground italic">Niets vraagt nu om aandacht.</p>}
          </GlassPanel>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Jouw huishoudritme</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {routines.slice(0, 3).map((r) => (
                <div key={r.id}>
                  <p className="text-lg font-display font-semibold">{r.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{r.frequency_days ? `Elke ${r.frequency_days} dagen` : "Vast ritme"}</p>
                  <p className="text-[11px] uppercase tracking-wide mt-1.5 font-semibold" style={{ color: BLUE_DEEP }}>Laatst: {ago(r.last_done)}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* ROUTINES */}
      {tab === "ROUTINES" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-40">
            <img src={IMAGES.lifeHousehold} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Jouw ritme</p>
                <h2 className="text-4xl font-display font-semibold tracking-tight text-ivory mt-1">MEESTAL OP KOERS</h2>
                <p className="text-sm text-ivory/70 mt-1">De meeste routines lopen normaal.</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routines.length ? routines.map((r) => (
              <HouseholdRoutineCard key={r.id} item={r} onOpen={() => setSelected(r.id)} selected={selected === r.id} onDone={complete} />
            )) : <p className="text-sm text-muted-foreground italic col-span-full">Nog geen routines.</p>}
          </div>

          {selectedRoutine && (
            <GlassPanel level={3} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Routine detail</p>
                  <h3 className="text-2xl font-display font-semibold tracking-tight mt-1">{selectedRoutine.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">Sluit</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                <Field label="Frequentie" value={selectedRoutine.frequency_days ? `Elke ${selectedRoutine.frequency_days} dagen` : "Vast ritme"} />
                <Field label="Voorkeurstijd" value={selectedRoutine.preferred_time || "Flexibel"} />
                <Field label="Duur" value={selectedRoutine.duration_min ? `~${selectedRoutine.duration_min} min` : "—"} />
                <Field label="Flexibiliteit" value={selectedRoutine.flexibility === "fixed" ? "Vast" : "Flexibel"} />
                <Field label="Laatst gedaan" value={ago(selectedRoutine.last_done)} />
                <Field label="Volgende verwacht" value={nextExpected(selectedRoutine) ? fmt(nextExpected(selectedRoutine)) : "—"} />
              </div>
              {routineState(selectedRoutine).hot && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: "hsl(var(--life-sand) / 0.16)" }}>
                  <p className="text-sm italic" style={{ color: SAND_DEEP }}>Lijkt steeds uit te stellen — misschien past een ander moment beter bij je ritme.</p>
                </div>
              )}
              <div className="flex gap-2 mt-5 pt-4 border-t border-foreground/8">
                <GlassButton variant="primary" size="sm" onClick={() => complete(selectedRoutine)}><CheckCircle2 className="h-3.5 w-3.5" /> Markeer voltooid</GlassButton>
                <GlassButton variant="outline" size="sm" onClick={() => base44.entities.Task.create({ title: selectedRoutine.title, domain: "life", status: "today" }).then(load)}><Plus className="h-3.5 w-3.5" /> Als taak</GlassButton>
              </div>
            </GlassPanel>
          )}
        </div>
      )}

      {/* SHOPPING */}
      {tab === "SHOPPING" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-40">
            <img src={IMAGES.notebookChair} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Boodschappen</p>
                <h2 className="text-4xl font-display font-semibold tracking-tight text-ivory mt-1">{shopping.length} NODIG</h2>
                <p className="text-sm text-ivory/70 mt-1">Dingen die je mist of bijna op zijn.</p>
              </div>
            </div>
          </div>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Volgende boodschap</p>
            <div className="flex items-end gap-4 mt-2">
              <p className="text-[64px] leading-[0.8] font-display font-semibold tracking-[-0.04em] tabular-nums" style={{ color: BLUE_DEEP }}>{shopping.length}</p>
              <p className="text-sm text-muted-foreground mb-3">items samen — één uitstapje</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {filtered(shopping).length ? filtered(shopping).map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "hsl(var(--life-sand) / 0.2)", color: SAND_DEEP }}>
                  {s.title}
                  <button onClick={() => complete(s)} className="opacity-50 hover:opacity-100"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                </span>
              )) : <p className="text-sm text-muted-foreground italic">Niets nodig.</p>}
            </div>
          </GlassPanel>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Patronen</p>
            <p className="text-sm text-muted-foreground italic">Giulia herkent terugkerende patronen (bv. koffie ~ elke 12 dagen) en signaleert op tijd — niet automatisch bestellen.</p>
          </GlassPanel>
        </div>
      )}

      {/* MAINTENANCE */}
      {tab === "MAINTENANCE" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-40">
            <img src={IMAGES.hourglassJacket} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Onderhoud</p>
                <h2 className="text-4xl font-display font-semibold tracking-tight text-ivory mt-1">{maintenance.length ? `${maintenance.length} AANKOMEND` : "ALLES GOED"}</h2>
              </div>
            </div>
          </div>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Onderhoudstijdlijn</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[...maintenance].sort((a, b) => new Date(a.next_due) - new Date(b.next_due)).map((m) => (
                <div key={m.id} className="shrink-0 text-center min-w-[88px]">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{m.next_due ? new Date(m.next_due).toLocaleDateString("nl-NL", { month: "short" }) : "—"}</p>
                  <div className="h-16 rounded-xl mt-1.5 flex items-center justify-center" style={{ background: "hsl(var(--life-sand) / 0.18)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide px-1 leading-tight" style={{ color: SAND_DEEP }}>{m.title}</p>
                  </div>
                  <p className="text-[10px] tabular-nums text-muted-foreground mt-1">{m.next_due ? new Date(m.next_due).getDate() : ""}</p>
                </div>
              ))}
              {maintenance.length === 0 && <p className="text-sm text-muted-foreground italic">Geen onderhoud aankomend.</p>}
            </div>
          </GlassPanel>

          <div className="grid sm:grid-cols-2 gap-4">
            {maintenance.map((m) => (
              <GlassPanel key={m.id} level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">{m.title}</p>
                <p className="text-2xl font-display font-semibold tracking-tight mt-1 tabular-nums">{m.next_due ? new Date(m.next_due).toLocaleDateString("nl-NL", { day: "numeric", month: "long" }) : "—"}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Laatst: {ago(m.last_done)}</p>
                <div className="flex gap-2 mt-4">
                  <GlassButton variant="primary" size="sm" onClick={() => base44.entities.Task.create({ title: `${m.title} plannen`, domain: "life", deadline: m.next_due, status: "upcoming" }).then(() => alert("Gepland als taak"))}><Plus className="h-3.5 w-3.5" /> Plan</GlassButton>
                  <GlassButton variant="outline" size="sm" onClick={() => complete(m)}><CheckCircle2 className="h-3.5 w-3.5" /> Herinner</GlassButton>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* HOUSEHOLD */}
      {tab === "HOUSEHOLD" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek in huishouden" className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-life-blue-deep" />
          </div>

          <HouseholdSection title="Voorwerpen" items={filtered(householdItems)} action="Bewerk" onAction={() => {}} empty="Geen voorwerpen geregistreerd." />
          <HouseholdSection title="Terugkerende verantwoordelijkheden" items={filtered(routines)} action="Bekijk" onAction={(i) => { setTab("ROUTINES"); setSelected(i.id); }} empty="Geen routines." />
          <HouseholdSection title="Issues" items={filtered(issues)} action="Los op" onAction={(i) => base44.entities.Task.create({ title: i.title, domain: "life", status: "today" }).then(load)} empty="Geen open issues." />

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Geschiedenis</p>
            {history.length ? (
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 10).map((h) => (
                  <span key={h.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs" style={{ background: "hsl(var(--foreground) / 0.05)", color: "hsl(var(--muted-foreground))" }}>
                    <CheckCircle2 className="w-3 h-3" style={{ color: BLUE_DEEP }} /> {h.title} · {ago(h.last_done)}
                  </span>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground italic">Nog geen geschiedenis.</p>}
          </GlassPanel>
        </div>
      )}

      {/* ZELFCARE — Routines gemigreerd uit SELF */}
      {tab === "SELFCARE" && (
        <div className="rounded-[28px] bg-charcoal p-6 text-ivory">
          <RoutinesPanel />
        </div>
      )}

      {/* Creator */}
      <Creator form={form} setForm={setForm} onCreate={createItem} />

      <LifeActivityFeed />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className="text-sm mt-0.5 capitalize">{value}</p>
    </div>
  );
}

function HouseholdSection({ title, items, action, onAction, empty }) {
  return (
    <GlassPanel level={2} className="p-6">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">{title}</p>
      {items.length ? (
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((i) => <HouseholdItemCard key={i.id} item={i} action={action} onAction={() => onAction(i)} />)}
        </div>
      ) : <p className="text-sm text-muted-foreground italic">{empty}</p>}
    </GlassPanel>
  );
}

function Creator({ form, setForm, onCreate }) {
  return (
    <GlassPanel level={2} className="p-6" id="creator">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Toevoegen aan huishouden</p>
      <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="bv. 'De wasmachine maakt een raar geluid'" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue-deep" />
      <div className="flex flex-wrap gap-1.5 mt-3">
        {KIND_OPTS.map((o) => (
          <button key={o.k} onClick={() => setForm((f) => ({ ...f, kind: o.k }))} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${form.kind === o.k ? "text-charcoal" : "text-muted-foreground border-foreground/15"}`} style={form.kind === o.k ? { background: SAND, borderColor: SAND } : {}}>{o.l}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Categorie" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
        <input value={form.frequency_days} onChange={(e) => setForm((f) => ({ ...f, frequency_days: e.target.value }))} placeholder="Frequentie (dagen)" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
        <select value={form.preferred_time} onChange={(e) => setForm((f) => ({ ...f, preferred_time: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none">
          <option value="morning">Ochtend</option>
          <option value="afternoon">Middag</option>
          <option value="evening">Avond</option>
        </select>
      </div>
      <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notitie / context" rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none mt-3 resize-none" />
      <button onClick={onCreate} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40 transition" style={{ background: "hsl(var(--life-blue-deep))" }}><Plus className="h-4 w-4" /> Toevoegen</button>
    </GlassPanel>
  );
}