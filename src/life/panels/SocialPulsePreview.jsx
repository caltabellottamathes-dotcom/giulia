import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { socialPulse, closeCircle, meaningfulInteractions, whatsappThreads } from "@/lib/domainUtils";
import { MessageCircle, CalendarHeart, Bell } from "lucide-react";

const LIGHT = "#d8dab3";
const PLUM = "#301728";
const initials = (n) => (n || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const fmtDay = (d) => new Date(d).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" });

/** SocialPulsePreview — wie aandacht verdient, je gesprekken en je afspraken.
 *  "Meaningful" = verzonden berichten + life-afspraken (7d), geen ontvangen post. */
export default function SocialPulsePreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [c, m, w, e] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 100).catch(() => []),
        base44.entities.Email.list("-timestamp", 80).catch(() => []),
        base44.entities.WhatsAppMessage.list("-timestamp", 120).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
      ]);
      setContacts(c || []); setEmails(m || []); setWhatsapps(w || []); setEvents(e || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const pulse = useMemo(() => socialPulse(closeCircle(contacts)), [contacts]);
  const attention = pulse.filter((p) => p.overdue).slice(0, 3);
  const mi = useMemo(() => meaningfulInteractions({ emails, whatsapps, events, days: 7 }), [emails, whatsapps, events]);
  const threads = useMemo(() => whatsappThreads(whatsapps, contacts, 4), [whatsapps, contacts]);
  const afspraken = useMemo(() => {
    const now = Date.now();
    const life = (events || []).filter((e) => e.domain === "life").map((e) => ({ ...e, t: new Date(e.start).getTime() }));
    return {
      upcoming: life.filter((e) => e.t >= now).sort((a, b) => a.t - b.t).slice(0, 3),
      recent: life.filter((e) => e.t < now).sort((a, b) => b.t - a.t).slice(0, 3),
    };
  }, [events]);

  const statement = mi.total >= 5 ? "VERBONDEN DEZE WEEK" : attention.length > 2 ? "ENKELE RELATIES DOVEN" : "RUSTIG VERBONDEN";
  const kicker = `${mi.total} BETEKENISVOL · ${threads.length} GESPREKKEN`;

  const remind = async (c) => { try { await base44.entities.Task.create({ title: `${c.name} bellen`, domain: "life", contact_id: c.id, status: "today", priority: "medium" }); } catch { /* ignore */ } };

  return (
    <PreviewShell index="20" section="SOCIAL PULSE" statement={statement} kicker={kicker} accent={LIGHT}
      context={[
        { label: "BETEKENISVOL · 7D", text: `${mi.total} interacties — verzonden berichten en afspraken. Geen ontvangen post.` },
        { label: "GESPREKKEN", text: threads.length ? `${threads.length} WhatsApp-gesprekken recent.` : "Nog geen gesprekken geregistreerd." },
        { label: "AFSPRAKEN", text: `${afspraken.upcoming.length} komend · ${afspraken.recent.length} recent.` },
      ]}
      actions={[{ label: "Planner", to: "/life/social?view=socialplanner" }, { label: "Persoonlijke Tijd", primary: true, to: "/life/social?view=socialtime" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 h-full overflow-hidden">
        <div className="flex flex-col gap-4 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">BETEKENISVOL · 7D</p>
            <p className="text-storm text-4xl font-bold tabular-nums mt-1 leading-none">{mi.total}</p>
            <p className="text-storm/45 text-[10px] mt-1.5">{mi.sentWa} bericht · {mi.meetings} afspraak</p>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">PULSE · LIVE</p>
            <PulseWave color={LIGHT} bars={18} height={36} />
          </div>
          <div className="flex flex-col items-center"><AnimatedRing pct={Math.min(100, mi.total * 14)} size={120} color={LIGHT} label={String(mi.total)} sub="7 DAGEN" /></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">VRAAGT AANDACHT</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : (
              <>
                {attention.length ? attention.map((p) => (
                  <div key={p.contact.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: LIGHT, color: PLUM }}>{initials(p.contact.name)}</div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-storm truncate">{p.contact.name}</p><p className="text-[10px] text-storm/50">{p.since === Infinity ? "nooit contact" : `${p.since} dagen geleden`}</p></div>
                      <button onClick={() => remind(p.contact)} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold shrink-0" style={{ color: LIGHT }}><Bell className="w-3 h-3" />Herinner</button>
                    </div>
                  </div>
                )) : <p className="text-sm text-storm/55 italic px-1">Niemand vraagt nu aandacht.</p>}

                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">GESPREKKEN · WHATSAPP</p>
                {threads.length ? threads.map((t) => (
                  <div key={t.contact_id} onClick={onOpen} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-3 py-2.5 cursor-pointer hover:bg-marble/10 transition">
                    <MessageCircle className="w-3.5 h-3.5 text-storm/50 shrink-0" />
                    <div className="min-w-0 flex-1"><p className="text-sm text-storm truncate">{t.name}</p><p className="text-[10px] text-storm/50 truncate">{t.last.message}</p></div>
                    <span className="text-[10px] text-storm/40 tabular-nums shrink-0">{t.count}× · {fmtDay(t.last.timestamp)}</span>
                  </div>
                )) : <p className="text-sm text-storm/45 italic px-1">Geen gesprekken gevonden.</p>}

                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">AFSPRAKEN</p>
                {[...afspraken.upcoming, ...afspraken.recent].slice(0, 5).map((e) => (
                  <div key={e.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-3 py-2.5 cursor-pointer hover:bg-marble/10 transition">
                    <CalendarHeart className="w-3.5 h-3.5 text-storm/50 shrink-0" />
                    <span className="text-sm text-storm flex-1 truncate">{e.title}</span>
                    <span className="text-[10px] text-storm/40 tabular-nums">{fmtDay(e.start)}</span>
                  </div>
                ))}
                {afspraken.upcoming.length === 0 && afspraken.recent.length === 0 && <p className="text-sm text-storm/45 italic px-1">Geen afspraken met life-domein.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}