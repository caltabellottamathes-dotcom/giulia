import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import SocialWeekTimeline from "@/components/life/SocialWeekTimeline";
import SocialPlanCard from "@/components/life/SocialPlanCard";
import SocialPersonCard from "@/components/life/SocialPersonCard";
import { IMAGES } from "@/lib/images";
import { closeCircle, socialPulse, daysSince } from "@/lib/domainUtils";
import { CalendarHeart, Plus, Clock, Search, MessageCircle, ExternalLink, Sparkles } from "lucide-react";
import { logLifeActivity } from "@/lib/lifeActivity";
import LifeActivityFeed from "@/components/life/LifeActivityFeed";
import LifeOverviewCards from "@/components/life/LifeOverviewCards";

const BLUE = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const DOW = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];
const ACTIVITIES = ["Diner", "Koffie", "Bezoek", "Wandeling", "Concert", "Iets anders"];
const fmtSlot = (d) => d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; };

const TABS = [
  { key: "OVERVIEW", label: "Overview" },
  { key: "PLANS", label: "Plannen" },
  { key: "PEOPLE", label: "Mensen" },
  { key: "OPPORTUNITIES", label: "Kansen" },
  { key: "OPEN", label: "Open" },
];

export default function SocialPlannerPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => { const t = new URLSearchParams(window.location.search).get("tab"); return t ? t.toUpperCase() : "OVERVIEW"; });
  const [planFilter, setPlanFilter] = useState("UPCOMING");
  const [form, setForm] = useState({ contactId: "", activity: "", slot: null });
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const [c, e, p] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 120).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.SocialPlan.list("suggested_date").catch(() => []),
      ]);
      setContacts(c || []); setEvents(e || []); setPlans(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const contactName = (id) => contacts.find((c) => c.id === id)?.name || "—";
  const contactById = (id) => contacts.find((c) => c.id === id);

  const freeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    for (let i = 0; i < 14 && slots.length < 4; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      d.setHours(19, 0, 0, 0);
      const end = new Date(d.getTime() + 3 * 3600000);
      if (d <= now) continue;
      const busy = (events || []).some((e) => { const s = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return s < end.getTime() && en > d.getTime(); });
      if (!busy) slots.push(d);
    }
    return slots;
  }, [events]);

  const weekPlans = useMemo(() => {
    const s = startOfWeek().getTime(), e = s + 7 * 86400000;
    return (plans || []).filter((p) => { const t = new Date(p.suggested_date || 0).getTime(); return t >= s && t < e && p.status !== "cancelled"; });
  }, [plans]);

  const upcoming = (plans || []).filter((p) => p.status === "confirmed");
  const tentative = (plans || []).filter((p) => p.status === "tentative");
  const waiting = (plans || []).filter((p) => p.status === "planned");
  const completed = (plans || []).filter((p) => p.status === "done" || p.status === "cancelled");

  const pulse = useMemo(() => socialPulse(closeCircle(contacts)), [contacts]);
  const peopleWant = pulse.filter((p) => p.overdue);
  const recentlySeen = closeCircle(contacts).filter((c) => c.last_contact_date && daysSince(c.last_contact_date) < 21).sort((a, b) => new Date(b.last_contact_date) - new Date(a.last_contact_date));
  const waitingPeople = closeCircle(contacts).filter((c) => (plans || []).some((p) => p.status === "planned" && (p.contact_ids || []).includes(c.id)));

  const openDaysCount = useMemo(() => {
    const start = startOfWeek();
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * 86400000); d.setHours(0, 0, 0, 0);
      const next = d.getTime() + 86400000;
      const busy = (events || []).some((e) => { const s = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return s < next && en > d.getTime(); });
      const hasPlan = weekPlans.some((p) => { const t = new Date(p.suggested_date || 0).getTime(); return t >= d.getTime() && t < next; });
      if (!busy && !hasPlan) n++;
    }
    return n;
  }, [events, weekPlans]);

  const opportunities = freeSlots.slice(0, 3).map((d, i) => ({
    date: d,
    hours: 3,
    person: peopleWant[i]?.contact,
    activities: ACTIVITIES.slice(0, 3),
    hasContext: !!peopleWant[i],
  }));

  const summary = openDaysCount >= 2 ? `Je hebt ruimte voor ${Math.min(2, openDaysCount)} sociale plannen deze week.` : openDaysCount === 1 ? "Eén open moment deze week." : "Deze week is sociaal vol.";

  const createPlan = async () => {
    if (!form.contactId || !form.activity.trim() || !form.slot) return;
    const start = form.slot.toISOString();
    const end = new Date(form.slot.getTime() + 2 * 3600000).toISOString();
    try {
      const ev = await base44.entities.CalendarEvent.create({ title: form.activity.trim(), start, end, domain: "life", status: "tentative" });
      await base44.entities.SocialPlan.create({ contact_ids: [form.contactId], activity: form.activity.trim(), calendar_event_id: ev.id, suggested_date: start, status: "planned" });
      await logLifeActivity("SocialPlanner", "planned", `${form.activity.trim()} met ${contactName(form.contactId)}`);
      setForm({ contactId: "", activity: "", slot: null });
      await load();
    } catch { /* ignore */ }
  };
  const confirmPlan = async (p) => { try { await base44.entities.SocialPlan.update(p.id, { status: "confirmed" }); if (p.calendar_event_id) await base44.entities.CalendarEvent.update(p.calendar_event_id, { status: "confirmed" }); await logLifeActivity("SocialPlanner", "confirmed", `${p.activity} bevestigd`); await load(); } catch { /* ignore */ } };
  const cancelPlan = async (p) => { try { await base44.entities.SocialPlan.update(p.id, { status: "cancelled" }); await logLifeActivity("SocialPlanner", "cancelled", `${p.activity} geannuleerd`); await load(); } catch { /* ignore */ } };
  const markDone = async (p) => { try { await base44.entities.SocialPlan.update(p.id, { status: "done" }); if (p.calendar_event_id) await base44.entities.CalendarEvent.update(p.calendar_event_id, { status: "confirmed" }); await logLifeActivity("SocialPlanner", "done", `${p.activity} gedaan`); await load(); } catch { /* ignore */ } };
  const editPlan = (p) => { setForm({ contactId: p.contact_ids?.[0] || "", activity: p.activity, slot: new Date(p.suggested_date) }); document.getElementById("creator")?.scrollIntoView({ behavior: "smooth" }); };

  const filteredPlans = planFilter === "UPCOMING" ? upcoming : planFilter === "TENTATIVE" ? tentative : planFilter === "WAITING" ? waiting : completed;
  const selectedPlan = (plans || []).find((p) => p.id === selected);

  const peopleFiltered = (list) => query ? list.filter((c) => (c.name || "").toLowerCase().includes(query.toLowerCase())) : list;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-social-planner" image={IMAGES.lifeSocialPlanner} icon={CalendarHeart} eyebrow="LIFE" title="Social Planner" subtitle={summary}
        actions={<GlassButton variant="primary" size="md" onClick={() => document.getElementById("creator")?.scrollIntoView({ behavior: "smooth" })}><Plus className="h-4 w-4" /> Nieuw plan</GlassButton>} />

      <LifeOverviewCards cards={[
        { label: "Deze week", value: weekPlans.length, hint: "gepland", accent: "blue" },
        { label: "Bevestigd", value: upcoming.length, accent: "blue" },
        { label: "Open dagen", value: openDaysCount, hint: "vrij", accent: "sand" },
        { label: "Te bellen", value: peopleWant.length, hint: "overdue", accent: "sand" },
      ]} />

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${tab === t.key ? "text-ivory" : "text-foreground/55 hover:text-foreground"}`} style={tab === t.key ? { background: BLUE } : {}}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "OVERVIEW" && (
        <div className="space-y-4">
          <GlassPanel level={2} className="p-6">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Jouw sociale week</p>
                <h2 className="text-3xl font-display font-semibold tracking-tight mt-1">BUSY → OPEN → SOCIAAL</h2>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-wide">
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: SAND }} /> Bevestigd</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-dashed" style={{ borderColor: "hsl(var(--life-blue))" }} /> Open</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm border border-foreground/20" /> Bezet</span>
              </div>
            </div>
            <SocialWeekTimeline plans={weekPlans} events={events} />
          </GlassPanel>

          <div className="grid md:grid-cols-2 gap-4">
            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Sociale capaciteit</p>
              <div className="flex items-end gap-5 mt-3">
                <p className="text-[72px] leading-[0.8] font-display font-semibold tracking-[-0.04em] text-life-blue-deep tabular-nums">{openDaysCount}</p>
                <p className="text-sm text-muted-foreground mb-3 leading-tight">mogelijke sociale<br />momenten</p>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {DOW.map((l, i) => { const s = startOfWeek(); const d = new Date(s.getTime() + i * 86400000); const next = d.getTime() + 86400000; const busy = (events || []).some((e) => { const st = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return st < next && en > d.getTime(); }); const plan = weekPlans.some((p) => { const t = new Date(p.suggested_date || 0).getTime(); return t >= d.getTime() && t < next; }); const open = !busy && !plan; return <span key={i} className="h-8 rounded-md flex items-center justify-center text-[8px] font-semibold uppercase" style={plan ? { background: SAND, color: "hsl(var(--charcoal))" } : open ? { border: "1px dashed hsl(var(--life-blue))", color: "hsl(var(--life-blue-deep))" } : { background: "hsl(var(--foreground) / 0.06)", color: "hsl(var(--muted-foreground))" }}>{l}</span>; })}
              </div>
            </GlassPanel>

            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Mensen die je wilde zien</p>
              {peopleWant.length ? (
                <div className="space-y-2 mt-3">
                  {peopleWant.slice(0, 4).map((p) => (
                    <SocialPersonCard key={p.contact.id} person={p.contact} reason={`Je wilde ${p.contact.name.split(" ")[0]} zien`} suggestedTime={freeSlots[0] ? freeSlots[0].toLocaleDateString("nl-NL", { weekday: "long" }) : null} onPlan={(person) => { setForm({ contactId: person.id, activity: "", slot: freeSlots[0] || null }); setTab("PLANS"); }} />
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground mt-3 italic">Niemand specifiek in gedachten.</p>}
            </GlassPanel>
          </div>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Open uitnodigingen</p>
            {waiting.length ? (
              <div className="space-y-2">
                {waiting.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-foreground/8 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.activity} · {(p.contact_ids || []).map(contactName).join(", ")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Uitnodiging verzonden — wacht op antwoord</p>
                    </div>
                    <button onClick={() => editPlan(p)} className="text-xs font-semibold text-life-blue-deep hover:underline shrink-0">Volg op</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground italic">Geen open uitnodigingen.</p>}
          </GlassPanel>
        </div>
      )}

      {/* PLANS */}
      {tab === "PLANS" && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["UPCOMING", "TENTATIVE", "WAITING", "COMPLETED"].map((f) => (
              <button key={f} onClick={() => setPlanFilter(f)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${planFilter === f ? "text-ivory" : "text-foreground/55 border border-foreground/12"}`} style={planFilter === f ? { background: SAND, color: "hsl(var(--charcoal))" } : {}}>{f === "UPCOMING" ? "Aankomend" : f === "TENTATIVE" ? "Voorlopig" : f === "WAITING" ? "Wachtend" : "Voltooid"}</button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.length ? filteredPlans.map((p) => (
              <SocialPlanCard key={p.id} plan={p} contactName={contactName} onOpen={() => setSelected(p.id)} onConfirm={confirmPlan} onCancel={cancelPlan} onDone={markDone} selected={selected === p.id} />
            )) : <p className="text-sm text-muted-foreground col-span-full italic">Geen plannen in deze weergave.</p>}
          </div>

          {selectedPlan && (
            <GlassPanel level={3} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Detail</p>
                  <h3 className="text-2xl font-display font-semibold tracking-tight uppercase mt-1">{selectedPlan.activity}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">Sluit</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Wie</p><p className="text-sm mt-1">{(selectedPlan.contact_ids || []).map(contactName).join(", ") || "—"}</p></div>
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Wanneer</p><p className="text-sm mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(selectedPlan.suggested_date).toLocaleString("nl-NL", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div>
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Waar</p><p className="text-sm mt-1">{selectedPlan.notes || "Nog geen locatie"}</p></div>
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Status</p><p className="text-sm mt-1 capitalize">{selectedPlan.status}</p></div>
                {selectedPlan.notes && <div className="sm:col-span-2"><p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Context</p><p className="text-sm mt-1 italic text-muted-foreground">{selectedPlan.notes}</p></div>}
              </div>
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-foreground/8">
                <GlassButton variant="primary" size="sm" onClick={() => navigate("/agenda")}><ExternalLink className="h-3.5 w-3.5" /> Open agenda</GlassButton>
                <GlassButton variant="outline" size="sm" onClick={() => navigate("/whatsapp")}><MessageCircle className="h-3.5 w-3.5" /> Bericht</GlassButton>
                <GlassButton variant="outline" size="sm" onClick={() => editPlan(selectedPlan)}><Plus className="h-3.5 w-3.5" /> Bewerk</GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => cancelPlan(selectedPlan)} className="text-destructive hover:text-destructive">Annuleer</GlassButton>
              </div>
            </GlassPanel>
          )}

          <CreatorPanel form={form} setForm={setForm} contacts={contacts} freeSlots={freeSlots} onCreate={createPlan} />
        </div>
      )}

      {/* PEOPLE */}
      {tab === "PEOPLE" && (
        <div className="space-y-5">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.lifeSocialPulse} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Wie wil ik tijd voor maken?</p>
                <h2 className="text-4xl font-display font-semibold tracking-tight text-ivory mt-1">MENSEN OM TE ZIEN</h2>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek mensen" className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-life-blue-deep" />
          </div>

          <PeopleSection title="Wilde je zien" list={peopleFiltered(peopleWant.map((p) => p.contact))} reasonFor={(c) => `Je wilde ${c.name.split(" ")[0]} zien`} suggestedFor={() => freeSlots[0] ? freeSlots[0].toLocaleDateString("nl-NL", { weekday: "long" }) : null} onPlan={(person) => { setForm({ contactId: person.id, activity: "", slot: freeSlots[0] || null }); setTab("PLANS"); }} empty="Niemand specifiek genoemd." />
          <PeopleSection title="Recent gezien" list={peopleFiltered(recentlySeen)} reasonFor={(c) => `${daysSince(c.last_contact_date)} dagen geleden`} onPlan={(person) => { setForm({ contactId: person.id, activity: "", slot: freeSlots[0] || null }); setTab("PLANS"); }} empty="Nog geen recente contacten." />
          <PeopleSection title="Suggested" list={peopleFiltered(closeCircle(contacts).filter((c) => !peopleWant.some((p) => p.contact.id === c.id) && !recentlySeen.some((r) => r.id === c.id)))} reasonFor={() => "Giulia ziet een mogelijkheid"} onPlan={(person) => { setForm({ contactId: person.id, activity: "", slot: freeSlots[0] || null }); setTab("PLANS"); }} empty="Geen suggesties." />
          <PeopleSection title="Wachtend" list={peopleFiltered(waitingPeople)} reasonFor={() => "Open uitnodiging"} onPlan={(person) => { setForm({ contactId: person.id, activity: "", slot: freeSlots[0] || null }); setTab("PLANS"); }} empty="Niemand wacht." />
        </div>
      )}

      {/* OPPORTUNITIES */}
      {tab === "OPPORTUNITIES" && (
        <div className="space-y-5">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.twoChairsSand} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Mogelijkheden, geen afspraken</p>
                <h2 className="text-4xl font-display font-semibold tracking-tight text-ivory mt-1">OPEN RUIMTE</h2>
                <p className="text-sm text-ivory/70 mt-1.5">{opportunities.length} momenten kunnen sociaal werken deze week.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {opportunities.map((o, i) => (
              <GlassPanel key={i} level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">{o.date.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
                <p className="text-2xl font-display font-semibold tracking-tight mt-1 tabular-nums">{o.date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} → {new Date(o.date.getTime() + o.hours * 3600000).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                <p className="text-sm text-muted-foreground mt-1.5">Open</p>
                {o.hasContext ? (
                  <>
                    {o.person && <p className="text-sm mt-3">Mogelijke mensen: <span className="font-semibold">{o.person.name}</span></p>}
                    <p className="text-xs text-muted-foreground mt-1">Mogelijke activiteiten: {o.activities.join(" · ")}</p>
                    <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => { setForm({ contactId: o.person?.id || "", activity: "", slot: o.date }); setTab("PLANS"); }}><Plus className="h-3.5 w-3.5" /> Maak plan</GlassButton>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-3 italic">Je hebt tijd, maar geen voor de hand liggende sociale context. Plan zelf iets als je wilt.</p>
                )}
              </GlassPanel>
            ))}
            {opportunities.length === 0 && <p className="text-sm text-muted-foreground italic">Geen open momenten deze week.</p>}
          </div>

          <CreatorPanel form={form} setForm={setForm} contacts={contacts} freeSlots={freeSlots} onCreate={createPlan} />
        </div>
      )}

      {/* OPEN */}
      {tab === "OPEN" && (
        <div className="space-y-3">
          <OpenSection title="Wacht op antwoord" items={waiting.map((p) => ({ id: p.id, title: `${p.activity} uitnodiging aan ${(p.contact_ids || []).map(contactName).join(", ")}`, action: "Volg op", onAction: () => editPlan(p) }))} empty="Geen uitnodigingen wachtend." />
          <OpenSection title="Heeft een datum nodig" items={peopleWant.map((p) => ({ id: p.contact.id, title: `Je wilde ${p.contact.name} zien — geen datum gepland`, action: "Vind een tijd", onAction: () => { setForm({ contactId: p.contact.id, activity: "", slot: freeSlots[0] || null }); setTab("PLANS"); } }))} empty="Niemand wacht op een datum." />
          <OpenSection title="Heeft bevestiging nodig" items={tentative.map((p) => ({ id: p.id, title: `${p.activity} · ${(p.contact_ids || []).map(contactName).join(", ")}`, action: "Bevestig", onAction: () => confirmPlan(p) }))} empty="Geen voorlopige plannen." />
          <OpenSection title="Volg op" items={waiting.filter((p) => { const d = daysSince(p.suggested_date); return d >= 3; }).map((p) => ({ id: p.id, title: `${p.activity} — ${daysSince(p.suggested_date)} dagen geleden verzonden`, action: "Stuur herinnering", onAction: () => navigate("/whatsapp") }))} empty="Niets om op te volgen." />
        </div>
      )}

      <LifeActivityFeed />
    </div>
  );
}

function PeopleSection({ title, list, reasonFor, suggestedFor, onPlan, empty }) {
  return (
    <GlassPanel level={2} className="p-6">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">{title}</p>
      {list.length ? (
        <div className="grid sm:grid-cols-2 gap-2">
          {list.map((c) => <SocialPersonCard key={c.id} person={c} reason={reasonFor(c)} suggestedTime={suggestedFor?.(c)} onPlan={onPlan} />)}
        </div>
      ) : <p className="text-sm text-muted-foreground italic">{empty}</p>}
    </GlassPanel>
  );
}

function OpenSection({ title, items, empty }) {
  return (
    <GlassPanel level={2} className="p-6">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">{title}</p>
      {items.length ? (
        <div className="divide-y divide-foreground/8">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <p className="text-sm">{it.title}</p>
              <button onClick={it.onAction} className="text-xs font-semibold text-life-blue-deep hover:underline shrink-0">{it.action}</button>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground italic">{empty}</p>}
    </GlassPanel>
  );
}

function CreatorPanel({ form, setForm, contacts, freeSlots, onCreate }) {
  return (
    <GlassPanel level={2} className="p-6" id="creator">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Sociaal plan maken</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <select value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue-deep">
          <option value="">Met wie?</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} placeholder="Activiteit" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue-deep" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {ACTIVITIES.map((a) => <button key={a} onClick={() => setForm((f) => ({ ...f, activity: a === "Iets anders" ? "" : a }))} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${form.activity === a ? "text-charcoal" : "text-muted-foreground border-foreground/15 hover:text-foreground"}`} style={form.activity === a ? { background: SAND, borderColor: SAND } : {}}>{a}</button>)}
        <button onClick={() => setForm((f) => ({ ...f, activity: "Laat Giulia voorstellen" }))} className="rounded-full px-3 py-1.5 text-xs font-medium border border-life-blue-deep/40 text-life-blue-deep hover:bg-life-blue/10 transition inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Giulia</button>
      </div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mt-4 mb-2">Beschikbare momenten</p>
      <div className="flex flex-wrap gap-2">
        {freeSlots.length ? freeSlots.map((s) => (
          <button key={s.toISOString()} onClick={() => setForm((f) => ({ ...f, slot: s }))} className="rounded-full px-3 py-1.5 text-xs font-medium border transition" style={form.slot?.toISOString() === s.toISOString() ? { background: "hsl(var(--life-blue-deep))", color: "hsl(var(--ivory))", borderColor: "hsl(var(--life-blue-deep))" } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>{fmtSlot(s)}</button>
        )) : <p className="text-xs text-muted-foreground">Geen vrije avonden gevonden.</p>}
      </div>
      <button onClick={onCreate} disabled={!form.contactId || !form.activity.trim() || !form.slot} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40 transition" style={{ background: "hsl(var(--life-blue-deep))" }}><Plus className="h-4 w-4" /> Plan in</button>
    </GlassPanel>
  );
}