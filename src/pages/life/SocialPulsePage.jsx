import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import { IMAGES } from "@/lib/images";
import { socialPulse } from "@/lib/domainUtils";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Heart } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";

export default function SocialPulsePage() {
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, m, w, e] = await Promise.all([
          base44.entities.Contact.filter({}, "name", 100).catch(() => []),
          base44.entities.Email.list("-timestamp", 80).catch(() => []),
          base44.entities.WhatsAppMessage.list("-timestamp", 80).catch(() => []),
          base44.entities.CalendarEvent.list("start").catch(() => []),
        ]);
        setContacts(c || []); setEmails(m || []); setWhatsapps(w || []); setEvents(e || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const interactions = useMemo(() => {
    const map = {};
    [...(emails || []).map((m) => ({ cid: m.contact_id })), ...whatsapps.map((w) => ({ cid: w.contact_id }))].forEach((x) => { if (x.cid) map[x.cid] = (map[x.cid] || 0) + 1; });
    return map;
  }, [emails, whatsapps]);

  const weeks = useMemo(() => {
    const arr = Array.from({ length: 8 }, (_, i) => ({ label: `-${7 * (7 - i)}d`, value: 0 }));
    const now = Date.now();
    const add = (t) => { if (!t) return; const w = Math.floor((now - new Date(t).getTime()) / (7 * 86400000)); if (w >= 0 && w < 8) arr[7 - w].value++; };
    [...emails, ...whatsapps].forEach((x) => add(x.timestamp));
    events.filter((e) => e.domain === "life").forEach((e) => add(e.start));
    return arr;
  }, [emails, whatsapps, events]);

  const overdueCount = pulse.filter((p) => p.overdue).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-social-pulse" image={IMAGES.portraitThinking} icon={Heart} eyebrow="LIFE" title="Social Pulse" subtitle="Wie aandacht verdient in je netwerk" />

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Contacten</p><p className="text-3xl font-display font-semibold mt-1">{contacts.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Wachten te lang</p><p className="text-3xl font-display font-semibold mt-1 text-life-blue">{overdueCount}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Interacties (recent)</p><p className="text-3xl font-display font-semibold mt-1">{emails.length + whatsapps.length}</p></GlassPanel>
      </div>

      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Sociale activiteit (8 weken)</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "hsl(var(--foreground) / 0.05)" }} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{weeks.map((_, i) => <Cell key={i} fill={BLUE} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Relatieoverzicht</p>
        {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : (
          <div className="divide-y divide-border/30">
            {pulse.map((p) => (
              <div key={p.contact.id} className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "hsl(var(--life-blue) / 0.18)", color: "hsl(var(--life-blue-deep))" }}>{(p.contact.name || "?")[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.contact.relationship_type || "—"} · elke {p.freq} dagen</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium tabular-nums">{p.since === Infinity ? "nooit" : `${p.since}d`}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{interactions[p.contact.id] || 0} interacties</p>
                </div>
                {p.overdue ? <span className="text-xs font-semibold text-life-sand">wacht</span> : <span className="text-xs text-muted-foreground">bij</span>}
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}