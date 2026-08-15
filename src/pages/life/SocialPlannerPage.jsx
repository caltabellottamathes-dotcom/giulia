import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { socialPulse } from "@/lib/domainUtils";
import { CalendarHeart, Plus, Clock } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const fmtSlot = (d) => d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

export default function SocialPlannerPage() {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ contactId: "", activity: "", slot: null });

  const load = async () => {
    try {
      const [c, e, p] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 100).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.SocialPlan.list("suggested_date").catch(() => []),
      ]);
      setContacts(c || []); setEvents(e || []); setPlans(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const freeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    for (let i = 0; i < 14 && slots.length < 4; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      d.setHours(19, 0, 0, 0);
      const end = new Date(d.getTime() + 2 * 3600000);
      if (d <= now) continue;
      const busy = (events || []).some((e) => { const s = new Date(e.start).getTime(), en = new Date(e.end || e.start).getTime(); return s < end.getTime() && en > d.getTime(); });
      if (!busy) slots.push(d);
    }
    return slots;
  }, [events]);

  const upcoming = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed");
  const past = (plans || []).filter((p) => p.status === "done" || p.status === "cancelled");
  const contactName = (id) => contacts.find((c) => c.id === id)?.name || "—";
  const suggestions = socialPulse(contacts).filter((p) => p.overdue).slice(0, 4);

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
  const confirmPlan = async (p) => { try { await base44.entities.SocialPlan.update(p.id, { status: "confirmed" }); if (p.calendar_event_id) await base44.entities.CalendarEvent.update(p.calendar_event_id, { status: "confirmed" }); await load(); } catch { /* ignore */ } };
  const cancelPlan = async (p) => { try { await base44.entities.SocialPlan.update(p.id, { status: "cancelled" }); await load(); } catch { /* ignore */ } };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-social-planner" image={IMAGES.lifeSocialPlanner} icon={CalendarHeart} eyebrow="LIFE" title="Social Planner" subtitle="Sociale tijd inplannen op vrije momenten"
        actions={<GlassButton variant="primary" size="md" onClick={() => document.getElementById("add-plan")?.scrollIntoView({ behavior: "smooth" })}><Plus className="h-4 w-4" /> Nieuw plan</GlassButton>} />

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Deze week</p><p className="text-3xl font-display font-semibold mt-1 text-life-blue">{upcoming.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Vrije avonden</p><p className="text-3xl font-display font-semibold mt-1">{freeSlots.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Aandacht nodig</p><p className="text-3xl font-display font-semibold mt-1 text-life-sand">{suggestions.length}</p></GlassPanel>
      </div>

      <GlassPanel level={2} className="p-6" id="add-plan">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Sociaal plan aanmaken</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <select value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue">
            <option value="">Met wie?</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} placeholder="Activiteit (bv. diner, wandeling)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {freeSlots.map((s) => (
            <button key={s.toISOString()} onClick={() => setForm((f) => ({ ...f, slot: s }))} className="rounded-full px-3 py-1.5 text-xs font-medium border transition" style={form.slot?.toISOString() === s.toISOString() ? { background: BLUE, color: "hsl(var(--charcoal))", borderColor: BLUE } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>{fmtSlot(s)}</button>
          ))}
        </div>
        <button onClick={createPlan} disabled={!form.contactId || !form.activity.trim() || !form.slot} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40 transition" style={{ background: "hsl(var(--life-blue-deep))" }}><Plus className="w-4 h-4" /> Plan in</button>
      </GlassPanel>

      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Aankomende plannen</p>
        {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : upcoming.length ? (
          <div className="divide-y divide-border/30">
            {upcoming.map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--life-blue) / 0.16)", color: "hsl(var(--life-blue-deep))" }}><CalendarHeart className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.activity}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.suggested_date).toLocaleString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {p.contact_ids?.map(contactName).join(", ")}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground hidden sm:block">{p.status}</span>
                <div className="flex gap-2">
                  <button onClick={() => confirmPlan(p)} className="text-xs font-medium text-foreground hover:text-life-blue">Bevestig</button>
                  <button onClick={() => cancelPlan(p)} className="text-xs text-muted-foreground hover:text-destructive">Annuleer</button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Nog geen plannen — voeg er een toe hierboven.</p>}
      </GlassPanel>

      {suggestions.length > 0 && (
        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Mensen die je wilde zien</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <span key={s.contact.id} className="rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "hsl(var(--life-sand) / 0.18)", color: "hsl(var(--life-blue-deep))" }}>{s.contact.name} · {s.since === Infinity ? "nooit" : `${s.since}d`}</span>
            ))}
          </div>
        </GlassPanel>
      )}

      {past.length > 0 && (
        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Eerdere plannen</p>
          <div className="divide-y divide-border/30">
            {past.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-2.5">
                <p className="text-sm flex-1 truncate text-muted-foreground">{p.activity}</p>
                <span className="text-xs text-muted-foreground">{p.status}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}