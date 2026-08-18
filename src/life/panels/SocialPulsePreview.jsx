import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { socialPulse, closeCircle } from "@/lib/domainUtils";
import { MessageCircle, Bell, CalendarHeart } from "lucide-react";

const PLUM = "#301728", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const initials = (n) => (n || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function SocialPulsePreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [c, m, w, e, p] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 100).catch(() => []),
        base44.entities.Email.list("-timestamp", 80).catch(() => []),
        base44.entities.WhatsAppMessage.list("-timestamp", 80).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.SocialPlan.list("suggested_date").catch(() => []),
      ]);
      setContacts(c || []); setEmails(m || []); setWhatsapps(w || []); setEvents(e || []); setPlans(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const pulse = useMemo(() => socialPulse(closeCircle(contacts)), [contacts]);
  const situations = pulse.filter(p => p.overdue).slice(0, 3);
  const interactions = useMemo(() => { const cut = Date.now() - 30 * 86400000; return [...(emails || []), ...(whatsapps || [])].filter(x => x.timestamp && new Date(x.timestamp).getTime() >= cut).length; }, [emails, whatsapps]);
  const activePlans = (plans || []).filter(p => p.status === "planned" || p.status === "confirmed").length;
  const upcoming = useMemo(() => (events || []).filter(e => e.domain === "life" && new Date(e.start).getTime() >= Date.now()).slice(0, 3), [events]);
  const headline = interactions >= 10 ? "VEEL GEBEUREN" : situations.length > 1 ? "RUSTIGER" : "VERBONDEN";
  const sub = interactions >= 10 ? "Je sociale leven beweegt" : situations.length > 1 ? "Enkele naaste relaties doven uit" : "Je kring voelt warm";
  const headlineFor = (p) => (p.since === Infinity ? "Nieuw contact" : p.since > p.freq * 1.5 ? "Iets is veranderd" : p.since > p.freq ? "Wordt rustiger" : "Stabiel");
  const reasonFor = (p) => { if (p.since === Infinity) return "Nog geen contact vastgelegd."; if (p.since > p.freq * 1.5) return `Ritme was elke ${p.freq} dagen. Nu ${p.since} dagen.`; if (p.since > p.freq) return `Ruim over ritme van ${p.freq} dagen.`; return `Binnen ritme — elke ${p.freq} dagen.`; };
  const remind = async (c) => { try { await base44.entities.Task.create({ title: `${c.name} bellen`, domain: "life", contact_id: c.id, status: "today", priority: "medium" }); } catch { /* ignore */ } };

  return (
    <PreviewShell index="20" section="SOCIAL PULSE" statement={headline} kicker={sub.toUpperCase()} accent={LIGHT}
      context={[
        { label: "INTERACTIES", text: `${interactions} betekenisvolle interacties in 30 dagen.` },
        { label: "NASTE KRING", text: situations.length ? `${situations.length} relaties wachten op contact.` : "Je naaste kring voelt warm." },
        { label: "SOCIAAL", text: `${activePlans} sociale plannen staan klaar.` },
      ]}
      actions={[{ label: "Open Social Pulse", primary: true, to: "/life/social-pulse" }, { label: "Social Planner", to: "/life/social-planner" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">INTERACTIES · 30D</p>
            <p className="text-storm text-4xl font-bold tabular-nums mt-1">{interactions}</p>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">PULSE · LIVE</p>
            <PulseWave color={LIGHT} bars={18} height={36} />
          </div>
          <div className="flex flex-col items-center"><AnimatedRing pct={Math.min(100, interactions)} size={120} color={LIGHT} label={String(interactions)} sub="INTERACTIES" /></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">WHAT MATTERS NOW · NASTE KRING</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : situations.length ? situations.map(p => (
              <div key={p.contact.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-plum shrink-0" style={{ background: LIGHT }}>{initials(p.contact.name)}</div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-storm truncate">{p.contact.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-storm/50 mt-0.5">{headlineFor(p)}</p>
                  </div>
                  <span className="ml-auto text-[11px] text-storm/45 tabular-nums shrink-0">{p.since === Infinity ? "nooit" : `${p.since}d`}</span>
                </div>
                <p className="text-xs text-storm/60 italic mb-2.5">{reasonFor(p)}</p>
                <div className="flex gap-1.5">
                  <button onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-full border border-marble/30 bg-marble/5 px-3 py-1.5 text-xs text-storm/70 hover:bg-marble/10 transition"><MessageCircle className="w-3.5 h-3.5" /> Bericht</button>
                  <button onClick={() => remind(p.contact)} className="inline-flex items-center gap-1.5 rounded-full border border-marble/30 bg-marble/5 px-3 py-1.5 text-xs text-storm/70 hover:bg-marble/10 transition"><Bell className="w-3.5 h-3.5" /> Herinner</button>
                </div>
              </div>
            )) : <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4"><p className="text-sm text-storm/60 italic">Niets dringends — je naaste kring voelt bij.</p></div>}
            {upcoming.length > 0 && (
              <>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">SOCIAL MOMENTS</p>
                {upcoming.map(e => (
                  <div key={e.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-4 py-2.5 cursor-pointer hover:bg-marble/10 transition">
                    <CalendarHeart className="w-3.5 h-3.5 text-storm/50 shrink-0" />
                    <span className="text-sm text-storm flex-1 truncate">{e.title}</span>
                    <span className="text-[10px] text-storm/40 tabular-nums">{new Date(e.start).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}