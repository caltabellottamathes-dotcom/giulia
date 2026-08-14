import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "./previewParts";
import { socialPulse } from "@/lib/domainUtils";
import { Plus, Clock, CalendarHeart } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";

const fmtSlot = (d) => d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

/** Social Planner panel — sociaal plan aanmaken op vrije agenda-momenten. */
export default function SocialPlannerPreview() {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ contactId: "", activity: "", slot: null });

  const load = async () => {
    try {
      const [c, e, p] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 60).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.SocialPlan.filter({ status: "planned" }, "suggested_date", 20).catch(() => []),
      ]);
      setContacts(c || []); setEvents(e || []); setPlans(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const freeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    for (let i = 0; i < 10 && slots.length < 3; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      d.setHours(19, 0, 0, 0);
      const end = new Date(d.getTime() + 2 * 3600000);
      if (d <= now) continue;
      const busy = (events || []).some((e) => { const s = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return s < end.getTime() && en > d.getTime(); });
      if (!busy) slots.push(d);
    }
    return slots;
  }, [events]);

  const suggestion = useMemo(() => socialPulse(contacts).find((p) => p.overdue), [contacts]);

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

  return (
    <div className="space-y-4">
      {/* Create */}
      <div className="rounded-2xl glass-card-2 p-4 space-y-3">
        <SectionLabel>Sociaal plan aanmaken</SectionLabel>
        <select value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))} className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory outline-none">
          <option value="">Met wie?</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} placeholder="Activiteit (bv. diner, wandeling)" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
        <div className="flex flex-wrap gap-2">
          {freeSlots.length ? freeSlots.map((s) => (
            <button key={s.toISOString()} onClick={() => setForm((f) => ({ ...f, slot: s }))} className={`rounded-full px-3 py-1.5 text-xs transition border ${form.slot?.toISOString() === s.toISOString() ? "text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`} style={form.slot?.toISOString() === s.toISOString() ? { background: BLUE, borderColor: BLUE } : {}}>
              {fmtSlot(s)}
            </button>
          )) : <p className="text-xs text-ivory/45">Geen vrije avonden gevonden — kies handmatig.</p>}
        </div>
        <button onClick={createPlan} disabled={!form.contactId || !form.activity.trim() || !form.slot} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}>
          <Plus className="w-4 h-4" /> Plan in
        </button>
      </div>

      <SectionLabel>Aankomende plannen</SectionLabel>
      {loading ? <Empty text="Laden…" /> : plans.length ? (
        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 -mr-1">
          {plans.map((p) => (
            <Card key={p.id} accent={BLUE}>
              <p className="text-sm font-medium text-ivory">{p.activity}</p>
              <p className="text-xs text-ivory/55 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.suggested_date).toLocaleString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
            </Card>
          ))}
        </div>
      ) : <Empty text="Nog geen plannen" />}

      {suggestion && (
        <div className="rounded-2xl glass-card-2 p-4">
          <SectionLabel>Suggestie van Giulia</SectionLabel>
          <p className="text-sm text-ivory/80 mt-2 flex items-start gap-2"><CalendarHeart className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SAND }} /> Je hebt <span className="font-semibold mx-1">{suggestion.contact.name}</span> al {Math.round(suggestion.since / 7)} week(ken) niet gezien. Een vrije avond staat klaar hierboven.</p>
        </div>
      )}
    </div>
  );
}