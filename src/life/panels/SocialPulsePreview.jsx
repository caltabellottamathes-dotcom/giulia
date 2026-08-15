import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { socialPulse, closeCircle } from "@/lib/domainUtils";
import { usePanel } from "@/lib/PanelContext";
import { MessageCircle, Bell, CalendarHeart, CalendarPlus, Plus, Sparkles, ArrowUpRight } from "lucide-react";

const BLUE = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const initials = (n) => (n || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/** Social Pulse panel — editorial compositie: grote typografie, mix van fonts,
 *  één centraal getal, en "what matters now" beperkt tot de naaste kring. */
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
  const situations = pulse.filter((p) => p.overdue).slice(0, 3);

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const weekData = useMemo(() => {
    const arr = Array.from({ length: 8 }, () => 0);
    const now = Date.now();
    [...(emails || []), ...(whatsapps || [])].forEach((x) => { if (!x.timestamp) return; const w = Math.floor((now - new Date(x.timestamp).getTime()) / (7 * 86400000)); if (w >= 0 && w < 8) arr[7 - w]++; });
    return arr;
  }, [emails, whatsapps]);
  const max = Math.max(1, ...weekData);

  const upcoming = useMemo(() => (events || []).filter((e) => e.domain === "life" && new Date(e.start).getTime() >= Date.now()).slice(0, 3), [events]);
  const activePlans = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").length;

  const headline = interactions >= 10 ? "A LOT HAPPENING" : situations.length > 1 ? "QUIETER" : "CONNECTED";
  const sub = interactions >= 10 ? "Je sociale leven beweegt" : situations.length > 1 ? "Enkele naaste relaties doven uit" : "Je kring voelt warm";

  const headlineFor = (p) => (p.since === Infinity ? "Nieuw contact" : p.since > p.freq * 1.5 ? "Something has changed" : p.since > p.freq ? "Going quieter" : "Steady");
  const reasonFor = (p) => {
    if (p.since === Infinity) return "Nog geen contact vastgelegd — leg de relatie vast.";
    if (p.since > p.freq * 1.5) return `Je ritme was elke ${p.freq} dagen. Het is nu ${p.since} dagen geleden.`;
    if (p.since > p.freq) return `Ruim over je ritme van ${p.freq} dagen.`;
    return `Binnen je ritme — elke ${p.freq} dagen.`;
  };
  const remind = async (c) => { try { await base44.entities.Task.create({ title: `${c.name} bellen`, domain: "life", contact_id: c.id, status: "today", priority: "medium" }); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-7">
      {/* HEADLINE */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Social Pulse</p>
        <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] text-ivory mt-1.5">{headline}</h2>
        <p className="text-sm text-ivory/55 mt-2 italic">{sub}</p>
      </div>

      {/* ACTIVITY COMPOSITION — groot getal + bar-timeline */}
      <div className="grid grid-cols-[auto_1fr] gap-5 items-end">
        <div>
          <p className="text-[64px] leading-[0.8] font-display font-semibold text-ivory tabular-nums">{interactions}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 mt-1.5 leading-tight">meaningful<br />interactions</p>
        </div>
        <div className="h-16 flex items-end gap-1.5">
          {weekData.map((v, i) => (
            <span key={i} className="flex-1 rounded-t-md transition-all duration-700" style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: v ? BLUE : "hsl(var(--ivory))", opacity: v ? 0.85 : 0.12 }} />
          ))}
        </div>
      </div>

      {/* WHAT MATTERS NOW — alleen naaste kring */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">What matters now</p>
        {situations.length ? (
          <div className="space-y-2.5">
            {situations.map((p) => (
              <div key={p.contact.id} className="glass-card-2 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-base font-display font-semibold text-charcoal shrink-0" style={{ background: SAND }}>{initials(p.contact.name)}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-display font-semibold text-ivory leading-none truncate">{p.contact.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: SAND_DEEP }}>{headlineFor(p)}</p>
                  </div>
                  <span className="ml-auto text-[11px] text-ivory/45 tabular-nums shrink-0">{p.since === Infinity ? "nooit" : `${p.since}d`}</span>
                </div>
                <p className="text-[13px] text-ivory/65 leading-relaxed italic mb-3">{reasonFor(p)}</p>
                <div className="flex gap-2">
                  <button onClick={() => openModule("whatsapp")} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory"><MessageCircle className="w-3.5 h-3.5" /> Bericht</button>
                  <button onClick={() => openModule("socialplanner")} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory"><CalendarHeart className="w-3.5 h-3.5" /> Plan</button>
                  <button onClick={() => remind(p.contact)} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory"><Bell className="w-3.5 h-3.5" /> Herinnering</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-2 rounded-2xl p-5">
            <p className="text-sm text-ivory/70 italic">Niets dringends — je naaste kring voelt bij. Laat het zo.</p>
          </div>
        )}
      </div>

      {/* SOCIAL MOMENTS */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Social moments</p>
          <div className="space-y-1">
            {upcoming.map((e) => {
              const d = new Date(e.start);
              return (
                <button key={e.id} onClick={onOpen} className="w-full flex items-center gap-3 text-left hover:bg-white/5 rounded-xl px-2 py-2 transition">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-ivory/80 tabular-nums w-12 shrink-0">{d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}</span>
                  <span className="text-sm text-ivory flex-1 truncate">{e.title}</span>
                  <span className="text-[10px] text-ivory/40 tabular-nums">{d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-ivory/40" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => openModule("whatsapp")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><MessageCircle className="w-4 h-4" style={{ color: BLUE }} /> Message</button>
          <button onClick={() => openModule("socialplanner")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><CalendarPlus className="w-4 h-4" style={{ color: BLUE }} /> Plan</button>
          <button onClick={() => openModule("socialplanner")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Plus className="w-4 h-4" style={{ color: BLUE }} /> Add moment</button>
          <button onClick={() => openModule("chat")} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: BLUE }} /> Ask Giulia</button>
        </div>
      </div>

      <div className="rounded-2xl glass-card-2 p-4">
        <p className="text-xs text-ivory/60 leading-relaxed italic">
          {situations.length > 1
            ? `${situations.length} naaste relaties wachten. Eén bericht vandaag houdt je kring warm.`
            : `Je ritme voelt natuurlijk. ${activePlans} sociaal${activePlans === 1 ? "" : "le"} plan${activePlans === 1 ? "" : "s"} staat klaar.`}
        </p>
      </div>
    </div>
  );
}