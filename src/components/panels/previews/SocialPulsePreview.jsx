import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "./previewParts";
import { socialPulse } from "@/lib/domainUtils";
import { usePanel } from "@/lib/PanelContext";
import { MessageCircle, Bell, CalendarHeart, Clock } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";

/** Social Pulse panel — wie aandacht verdient + snelle acties. */
export default function SocialPulsePreview() {
  const { openModule } = usePanel();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const data = await base44.entities.Contact.filter({}, "name", 60); setContacts(data || []); } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const top = pulse.slice(0, 8);
  const overdueCount = pulse.filter((p) => p.overdue).length;

  const reasonFor = (p) => {
    if (p.since === Infinity) return "Nog geen contact vastgelegd";
    if (p.since > p.freq * 1.5) return `Al ${p.since} dagen — je wil elke ${p.freq} dagen`;
    if (p.since > p.freq) return `Ruim over je ritme van ${p.freq} dagen`;
    return `Binnen je ritme (${p.freq} dagen)`;
  };

  const remind = async (c) => { try { await base44.entities.Task.create({ title: `${c.name} bellen`, domain: "life", contact_id: c.id, status: "today", priority: "medium" }); } catch { /* ignore */ } };
  const snooze = async (c) => { try { await base44.entities.Contact.update(c.id, { last_notified_at: new Date().toISOString() }); await load(); } catch { /* ignore */ } };

  return (
    <div className="space-y-4">
      <SectionLabel>Wie aandacht verdient</SectionLabel>
      {loading ? <Empty text="Laden…" /> : top.length ? (
        <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-1 -mr-1">
          {top.map((p) => (
            <Card key={p.contact.id} accent={p.overdue ? SAND : BLUE}>
              <p className="text-sm font-medium text-ivory">{p.contact.name}</p>
              <p className="text-xs text-ivory/55 mt-0.5">{reasonFor(p)}</p>
              <p className="text-[11px] text-ivory/40 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {p.since === Infinity ? "nooit" : `${p.since} dagen geleden`}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <ActionBtn label="Bericht" icon={MessageCircle} onClick={() => openModule("whatsapp")} />
                <ActionBtn label="Herinnering" icon={Bell} onClick={() => remind(p.contact)} />
                <ActionBtn label="Afspraak" icon={CalendarHeart} onClick={() => openModule("socialplanner")} />
                <button onClick={(e) => { e.stopPropagation(); snooze(p.contact); }} className="ml-auto text-[11px] text-ivory/50 hover:text-ivory transition">Uitstellen</button>
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty text="Geen contacten" />}

      <div className="rounded-2xl glass-card-2 p-4 mt-2">
        <SectionLabel>Giulia</SectionLabel>
        <p className="text-sm text-ivory/80 mt-2 leading-relaxed">
          {overdueCount > 2
            ? `${overdueCount} relaties wachten al te lang. Eén bericht of belletje vandaag houdt je netwerk warm zonder het te forceren.`
            : "Je netwerk voelt bij. Niets dringends — laat het zo."}
        </p>
      </div>
    </div>
  );
}