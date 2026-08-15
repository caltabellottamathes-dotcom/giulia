import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import SocialWeekTimeline from "@/components/life/SocialWeekTimeline";
import { closeCircle, socialPulse } from "@/lib/domainUtils";
import { Plus, CalendarHeart, CalendarPlus, MessageCircle, Sparkles, Clock } from "lucide-react";

const BLUE = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand))";
const fmtSlot = (d) => d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

/** Social Planner panel — snelle interactieve planningsomgeving. Editorial:
 *  grote status, compacte weektimeline, sociale kansen, open plannen,
 *  compacte creator + snelle acties. */
export default function SocialPlannerPreview() {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ contactId: "", activity: "", slot: null });

  const load = async () => {
    try {
      const [c, e, p] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 80).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.SocialPlan.list("suggested_date").catch(() => []),
      ]);
      setContacts(c || []); setEvents(e || []); setPlans(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const contactName = (id) => contacts.find((c) => c.id === id)?.name || "—";

  const freeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    for (let i = 0; i < 10 && slots.length < 3; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      d.setHours(19, 0, 0, 0);
      const end = new Date(d.getTime() + 3 * 3600000);
      if (d <= now) continue;
      const busy = (events || []).some((e) => { const s = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return s < end.getTime() && en > d.getTime(); });
      if (!busy) slots.push({ date: d, start: 19, hours: 3 });
    }
    return slots;
  }, [events]);

  const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; };
  const weekPlans = useMemo(() => {
    const s = startOfWeek().getTime(), e = s + 7 * 86400000;
    return (plans || []).filter((p) => { const t = new Date(p.suggested_date || 0).getTime(); return t >= s && t < e && p.status !== "cancelled"; });
  }, [plans]);

  const pulse = useMemo(() => socialPulse(closeCircle(contacts)), [contacts]);
  const peopleWant = pulse.filter((p) => p.overdue);

  const opportunities = useMemo(() => freeSlots.map((s, i) => ({ ...s, person: peopleWant[i] })), [freeSlots, peopleWant]);
  const openPlans = (plans || []).filter((p) => p.status === "planned" || p.status === "tentative");

  const status = freeSlots.length > 0 ? "RUIMTE OM TE VERBINDEN" : weekPlans.length > 2 ? "DRUK DEZE WEEK" : "JE WEEK STAAKT";
  const sub = freeSlots.length > 0 ? "Je hebt wat open sociale tijd deze week." : weekPlans.length > 2 ? "Bijna vol — kies bewust." : "Rustig, met ruimte.";

  const createPlan = async () => {
    if (!form.contactId || !form.activity.trim() || !form.slot) return;
    const start = form.slot.toISOString();
    const end = new Date(form.slot.getTime() + 2 * 3600000).toISOString();
    try {
      const ev = await base44.entities.CalendarEvent.create({ title: form.activity.trim(), start, end, domain: "life", status: "tentative" });
      await base44.entities.SocialPlan.create({ contact_ids: [form.contactId], activity: form.activity.trim(), calendar_event_id: ev.id, suggested_date: start, status: "planned" });
      setForm({ contactId: "", activity: "", slot: null });
      await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-7 text-ivory">
      {/* HEADER */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Social Planner</p>
        <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1.5">{status}</h2>
        <p className="text-sm text-ivory/55 mt-2 italic">{sub}</p>
      </div>

      {/* DEZE WEEK */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Deze week</p>
        <SocialWeekTimeline plans={weekPlans} events={events} compact />
      </div>

      {/* SOCIALE KANSEN */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Sociale kansen</p>
        {opportunities.length ? (
          <div className="space-y-2.5">
            {opportunities.map((o, i) => (
              <div key={i} className="glass-card-2 rounded-2xl p-4">
                <p className="text-lg font-display font-semibold leading-none">{o.date.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
                <p className="text-sm text-ivory/65 mt-1.5">Je hebt <span className="font-semibold text-ivory">{o.hours} uur vrij</span>{o.person ? <> — <span className="italic">{o.person.contact.name}</span> wilde je zien</> : null}.</p>
                {o.person ? (
                  <button onClick={() => setForm((f) => ({ ...f, slot: o.date, contactId: o.person.contact.id }))} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition" style={{ background: SAND, color: "hsl(var(--charcoal))" }}><Plus className="w-3.5 h-3.5" /> Plan iets</button>
                ) : (
                  <p className="text-[11px] text-ivory/45 mt-2 italic">Geen voor de hand liggende sociale context — plan zelf iets.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-2 rounded-2xl p-4">
            <p className="text-sm text-ivory/65 italic">Al behoorlijk vol — geen extra sociaal plan voorgesteld.</p>
          </div>
        )}
      </div>

      {/* OPEN PLANNEN */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Open plannen</p>
        {openPlans.length ? (
          <div className="space-y-2">
            {openPlans.map((p) => (
              <div key={p.id} className="glass-card-2 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-display font-semibold truncate">{p.activity}</p>
                    <p className="text-xs text-ivory/55 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.suggested_date).toLocaleString("nl-NL", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {(p.contact_ids || []).map(contactName).join(", ")}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-ivory/50 shrink-0">{p.status === "planned" ? "Wacht op antwoord" : "Voorlopig"}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => base44.entities.SocialPlan.update(p.id, { status: "confirmed" }).then(load)} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory"><CalendarHeart className="w-3.5 h-3.5" /> Bevestig</button>
                  <button onClick={() => setForm((f) => ({ ...f, contactId: p.contact_ids?.[0] || "", activity: p.activity, slot: new Date(p.suggested_date) }))} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory"><MessageCircle className="w-3.5 h-3.5" /> Volg op</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-2 rounded-2xl p-4"><p className="text-sm text-ivory/55 italic">Geen open plannen.</p></div>
        )}
      </div>

      {/* PLAN IETS — compacte creator */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Plan iets</p>
        <div className="glass-card-2 rounded-2xl p-4 space-y-3">
          <select value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))} className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory outline-none">
            <option value="">Met wie?</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} placeholder="Activiteit (diner, koffie, wandeling)" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex flex-wrap gap-2">
            {freeSlots.map((s) => (
              <button key={s.date.toISOString()} onClick={() => setForm((f) => ({ ...f, slot: s.date }))} className={`rounded-full px-3 py-1.5 text-xs transition border ${form.slot?.toISOString() === s.date.toISOString() ? "text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`} style={form.slot?.toISOString() === s.date.toISOString() ? { background: SAND, borderColor: SAND } : {}}>{fmtSlot(s.date)}</button>
            ))}
          </div>
          <button onClick={createPlan} disabled={!form.contactId || !form.activity.trim() || !form.slot} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAND }}><Plus className="w-4 h-4" /> Plan in</button>
        </div>
      </div>

      {/* SNELLE ACTIES */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Snelle acties</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setForm({ contactId: "", activity: "", slot: freeSlots[0]?.date || null })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Plus className="w-4 h-4" style={{ color: BLUE }} /> Plan iets</button>
          <button onClick={() => setForm({ contactId: "", activity: "", slot: null })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><CalendarHeart className="w-4 h-4" style={{ color: BLUE }} /> Nodig uit</button>
          <button onClick={() => setForm({ contactId: peopleWant[0]?.contact?.id || "", activity: "", slot: freeSlots[0]?.date || null })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><CalendarPlus className="w-4 h-4" style={{ color: BLUE }} /> Vind een tijd</button>
          <button className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: BLUE }} /> Vraag Giulia</button>
        </div>
      </div>
    </div>
  );
}