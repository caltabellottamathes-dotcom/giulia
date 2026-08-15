import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn, HeroStat, MiniBars, Row } from "./previewParts";
import { socialPulse } from "@/lib/domainUtils";
import { usePanel } from "@/lib/PanelContext";
import { MessageCircle, Bell, CalendarHeart, Clock, Plus, Sparkles, CalendarPlus } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";

/** Social Pulse panel — situaties, niet simpelweg personen.
 *  Current state → wat er nu toe doet → sociale momenten → snelle acties. */
export default function SocialPulsePreview({ onOpen }) {
  const { openModule } = usePanel();
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [c, m, w, e, p] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 80).catch(() => []),
        base44.entities.Email.list("-timestamp", 60).catch(() => []),
        base44.entities.WhatsAppMessage.list("-timestamp", 60).catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
        base44.entities.SocialPlan.list("suggested_date").catch(() => []),
      ]);
      setContacts(c || []); setEmails(m || []); setWhatsapps(w || []); setEvents(e || []); setPlans(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const situations = pulse.filter((p) => p.overdue).slice(0, 3);
  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const weekData = useMemo(() => {
    const arr = Array.from({ length: 8 }, (_, i) => ({ value: 0, color: BLUE }));
    const now = Date.now();
    [...(emails || []), ...(whatsapps || [])].forEach((x) => { if (!x.timestamp) return; const w = Math.floor((now - new Date(x.timestamp).getTime()) / (7 * 86400000)); if (w >= 0 && w < 8) arr[7 - w].value++; });
    return arr;
  }, [emails, whatsapps]);

  const upcomingMoments = useMemo(() => {
    const ev = (events || []).filter((e) => e.domain === "life" && new Date(e.start).getTime() >= Date.now()).slice(0, 4);
    return ev;
  }, [events]);
  const activePlans = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").length;

  const reasonFor = (p) => {
    if (p.since === Infinity) return "Nog geen contact vastgelegd";
    if (p.since > p.freq * 1.5) return `Iets is veranderd — je ritme was elke ${p.freq} dagen, nu ${p.since} dagen.`;
    if (p.since > p.freq) return `Ruim over je ritme van ${p.freq} dagen.`;
    return `Binnen je ritme (${p.freq} dagen).`;
  };
  const headlineFor = (p) => {
    if (p.since === Infinity) return "Nieuw contact";
    if (p.since > p.freq * 1.5) return "Something has changed";
    if (p.since > p.freq) return "Going quieter";
    return "Steady";
  };

  const remind = async (c) => { try { await base44.entities.Task.create({ title: `${c.name} bellen`, domain: "life", contact_id: c.id, status: "today", priority: "medium" }); } catch { /* ignore */ } };

  if (loading) return <Empty text="Laden…" />;

  return (
    <div className="space-y-5">
      {/* SECTION 1 — CURRENT STATE */}
      <SectionLabel>Current state</SectionLabel>
      <HeroStat
        label="Social activity"
        value={interactions}
        accent={BLUE}
        sub="meaningful interactions · laatste 30 dagen"
        visual={<MiniBars data={weekData} height={48} />}
      />

      {/* SECTION 2 — WHAT MATTERS NOW */}
      <SectionLabel>What matters now</SectionLabel>
      {situations.length ? (
        <div className="flex flex-col gap-2">
          {situations.map((p) => (
            <Card key={p.contact.id} accent={SAND}>
              <p className="text-[15px] font-display font-semibold text-ivory">{p.contact.name}</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ivory/45 mt-0.5">{headlineFor(p)}</p>
              <p className="text-xs text-ivory/60 mt-1.5 leading-relaxed">{reasonFor(p)}</p>
              <div className="mt-3 flex items-center gap-2">
                <ActionBtn label="Bericht" icon={MessageCircle} onClick={() => openModule("whatsapp")} />
                <ActionBtn label="Plan iets" icon={CalendarHeart} onClick={() => openModule("socialplanner")} />
                <ActionBtn label="Herinnering" icon={Bell} onClick={() => remind(p.contact)} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card accent={BLUE}>
          <p className="text-sm text-ivory/70">Niets dringends — je netwerk voelt bij. Laat het zo.</p>
        </Card>
      )}

      {/* SECTION 3 — SOCIAL MOMENTS */}
      <SectionLabel>Social moments</SectionLabel>
      {upcomingMoments.length ? (
        <div className="flex flex-col gap-1.5">
          {upcomingMoments.map((e) => {
            const d = new Date(e.start);
            return (
              <Row key={e.id} title={e.title} sub={`${d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })} · ${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`} accent={BLUE} onClick={onOpen} />
            );
          })}
        </div>
      ) : (
        <Card accent={BLUE}>
          <p className="text-sm text-ivory/70">Geen sociale momenten ingepland.</p>
          <div className="mt-2.5"><ActionBtn label="Plan iets" icon={CalendarPlus} onClick={() => openModule("socialplanner")} /></div>
        </Card>
      )}

      {/* SECTION 4 — QUICK ACTIONS */}
      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => openModule("whatsapp")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><MessageCircle className="w-4 h-4 text-life-blue" /> Message someone</button>
        <button onClick={() => openModule("socialplanner")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><CalendarPlus className="w-4 h-4 text-life-blue" /> Plan something</button>
        <button onClick={() => openModule("socialplanner")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Plus className="w-4 h-4 text-life-blue" /> Add social moment</button>
        <button onClick={() => openModule("chat")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Sparkles className="w-4 h-4 text-life-blue" /> Ask Giulia</button>
      </div>

      <div className="rounded-2xl glass-card-2 p-4 mt-1">
        <p className="text-xs text-ivory/60 leading-relaxed">
          {situations.length > 2
            ? `${situations.length} relaties wachten al te lang. Eén bericht vandaag houdt je netwerk warm zonder het te forceren.`
            : `Je ritme voelt natuurlijk. ${activePlans} sociaal${activePlans === 1 ? "" : "le"} plan${activePlans === 1 ? "" : "s"} staat staan klaar.`}
        </p>
      </div>
    </div>
  );
}