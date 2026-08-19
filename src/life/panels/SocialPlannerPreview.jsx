import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { closeCircle, socialPulse } from "@/lib/domainUtils";
import { Plus, CalendarHeart, Clock } from "lucide-react";

const PLUM = "#301728", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const fmtSlot = (d) => d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

export default function SocialPlannerPreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ contactId: "", activity: "", slot: null });

  const load = async () => {
    try { const [c, e, p] = await Promise.all([base44.entities.Contact.filter({}, "name", 80).catch(() => []), base44.entities.CalendarEvent.list("start").catch(() => []), base44.entities.SocialPlan.list("suggested_date").catch(() => [])]); setContacts(c || []); setEvents(e || []); setPlans(p || []); } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const contactName = (id) => contacts.find(c => c.id === id)?.name || "—";
  const freeSlots = useMemo(() => { const slots = []; const now = new Date(); for (let i = 0; i < 10 && slots.length < 3; i++) { const d = new Date(now.getTime() + i * 86400000); d.setHours(19, 0, 0, 0); const end = new Date(d.getTime() + 3 * 3600000); if (d <= now) continue; const busy = (events || []).some(e => { const s = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return s < end.getTime() && en > d.getTime(); }); if (!busy) slots.push({ date: d, start: 19, hours: 3 }); } return slots; }, [events]);
  const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; };
  const weekPlans = useMemo(() => { const s = startOfWeek().getTime(), e = s + 7 * 86400000; return (plans || []).filter(p => { const t = new Date(p.suggested_date || 0).getTime(); return t >= s && t < e && p.status !== "cancelled"; }); }, [plans]);
  const pulse = useMemo(() => socialPulse(closeCircle(contacts)), [contacts]);
  const peopleWant = pulse.filter(p => p.overdue);
  const opportunities = useMemo(() => freeSlots.map((s, i) => ({ ...s, person: peopleWant[i] })), [freeSlots, peopleWant]);
  const openPlans = (plans || []).filter(p => p.status === "planned" || p.status === "tentative");
  const status = freeSlots.length > 0 ? "RUIMTE OM TE VERBINDEN" : weekPlans.length > 2 ? "DRUK DEZE WEEK" : "JE WEEK STAAKT";

  const createPlan = async () => { if (!form.contactId || !form.activity.trim() || !form.slot) return; try { const start = form.slot.toISOString(); const end = new Date(form.slot.getTime() + 2 * 3600000).toISOString(); const ev = await base44.entities.CalendarEvent.create({ title: form.activity.trim(), start, end, domain: "life", status: "tentative" }); await base44.entities.SocialPlan.create({ contact_ids: [form.contactId], activity: form.activity.trim(), calendar_event_id: ev.id, suggested_date: start, status: "planned" }); setForm({ contactId: "", activity: "", slot: null }); await load(); } catch { /* ignore */ } };

  return (
    <PreviewShell index="24" section="SOCIAL PLANNER" statement={status} kicker={`${freeSlots.length} VRIJE MOMENTEN`} accent={LIGHT}
      context={[
        { label: "STATUS", text: `${freeSlots.length} vrije sociale momenten deze week.` },
        { label: "OPEN PLANNEN", text: `${openPlans.length} plannen wachten op bevestiging.` },
        { label: "KANSEN", text: opportunities.length ? `${opportunities.length} sociale kansen gevonden.` : "Geen extra kansen." },
      ]}
      actions={[{ label: "Open Social Planner", primary: true, to: "/life/social?view=planner" }, { label: "Open Social Pulse", to: "/life/social-pulse" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={Math.min(100, freeSlots.length * 33)} size={140} color={LIGHT} label={String(freeSlots.length)} sub="VRIJ" /></div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">PULSE · LIVE</p>
            <PulseWave color={LIGHT} bars={18} height={36} />
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">VRIJE SLOTS</p>
            <div className="space-y-1.5">
              {freeSlots.map(s => (
                <button key={s.date.toISOString()} onClick={() => setForm(f => ({ ...f, slot: s.date }))} className={`w-full text-left rounded-lg px-3 py-2 text-xs border transition ${form.slot?.toISOString() === s.date.toISOString() ? "bg-sand text-storm border-sand" : "border-marble/30 bg-marble/5 text-storm/70 hover:bg-marble/10"}`}>{fmtSlot(s.date)}</button>
              ))}
              {freeSlots.length === 0 && <p className="text-storm/40 text-xs">Geen vrije slots.</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">SOCIALE KANSEN · {opportunities.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : opportunities.length ? opportunities.map((o, i) => (
              <div key={i} className="rounded-2xl border border-marble/20 bg-marble/5 p-3.5">
                <p className="text-sm font-semibold text-storm">{o.date.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
                <p className="text-xs text-storm/60 mt-1">{o.hours} uur vrij{o.person ? <> — <span className="italic">{o.person.contact.name}</span> wilde je zien</> : null}</p>
                {o.person && <button onClick={() => setForm(f => ({ ...f, slot: o.date, contactId: o.person.contact.id }))} className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-plum transition" style={{ background: LIGHT }}><Plus className="w-3.5 h-3.5" />Plan iets</button>}
              </div>
            )) : <p className="text-storm/40 text-sm">Geen kansen — week is vol.</p>}
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">OPEN PLANNEN · {openPlans.length}</p>
            {openPlans.map(p => (
              <div key={p.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-storm truncate">{p.activity}</p>
                    <p className="text-[11px] text-storm/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.suggested_date).toLocaleString("nl-NL", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {(p.contact_ids || []).map(contactName).join(", ")}</p>
                  </div>
                  <button onClick={() => base44.entities.SocialPlan.update(p.id, { status: "confirmed" }).then(load)} className="text-[10px] uppercase tracking-wide font-semibold shrink-0" style={{ color: LIGHT }}><CalendarHeart className="w-3.5 h-3.5 inline mr-1" />Bevestig</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}