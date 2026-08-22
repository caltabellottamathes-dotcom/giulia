import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusPeople;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const IVORY = "hsl(var(--ivory))";

const initials = (name) => (name || "?").trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

/** PeopleFocusWidget — P·2x3·B·SIDE · "People Around Me."
 *  GlassCard: bovenin de geanimeerde header, dan enkel de personen met wie
 *  ik contact had via WhatsApp of mail (geen andere contacten). Onderin een
 *  snelzoekbalk die binnen die groep filtert. Alles in focus-kleuren. */
export default function PeopleFocusWidget() {
  const { openModule } = usePanel();
  const { data: contacts } = useEntityList("Contact", { sort: "-created_date", limit: 200, realtime: true });
  const { data: msgs } = useEntityList("WhatsAppMessage", { sort: "-timestamp", limit: 200, realtime: true });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", limit: 200, realtime: true });
  const [q, setQ] = useState("");

  const contacted = useMemo(() => {
    const lastByContact = new Map();
    const touch = (id, ts) => {
      if (!id) return;
      const t = ts ? new Date(ts).getTime() : 0;
      const cur = lastByContact.get(id);
      if (!cur || t > cur) lastByContact.set(id, t);
    };
    (msgs || []).forEach((m) => touch(m.contact_id, m.timestamp || m.created_date));
    (emails || []).forEach((e) => touch(e.contact_id, e.timestamp || e.created_date));
    return (contacts || [])
      .filter((c) => lastByContact.has(c.id))
      .map((c) => ({ ...c, last: lastByContact.get(c.id) }))
      .sort((a, b) => b.last - a.last);
  }, [contacts, msgs, emails]);

  const filtered = useMemo(() => {
    if (!q.trim()) return contacted;
    const s = q.toLowerCase();
    return contacted.filter((c) => (c.name || "").toLowerCase().includes(s) || (c.company || "").toLowerCase().includes(s));
  }, [contacted, q]);

  return (
    <div className="w-full h-[380px]">
      <PhotoGlassLayeredWidget shape="2:3" photo={PHOTO} glassPosition="bottom" glassFraction={0.48} overhang={0} domain="focus" radius="large" onClick={() => openModule("people")} overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/5">
        <div className="flex flex-col h-full overflow-hidden -mx-1 px-1" onClick={(e) => e.stopPropagation()}>
          <div className="pb-1.5 mb-1 border-b border-white/12">
            <WidgetHeader type="social" label="People Around Me." count={contacted.length ? String(contacted.length) : ""} />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1.5 mt-1">
            {filtered.length === 0 ? (
              <p className="text-[11px] text-ivory/50 px-1 py-2 text-center">{q ? "Geen contacten gevonden." : "Nog geen contact via WhatsApp of mail."}</p>
            ) : filtered.slice(0, 6).map((c) => (
              <button key={c.id} onClick={() => openModule("people")} className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-xl text-left hover:bg-white/10 transition-colors">
                <span className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-display font-bold" style={{ background: DEEP, color: LIGHT, border: `1.5px solid ${LIGHT}` }}>
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: LIGHT }}>{c.name}</p>
                  <p className="text-[9px] uppercase tracking-wide leading-tight truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{[c.role, c.company].filter(Boolean).join(" · ") || "—"}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="relative mt-1.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek een contact…"
              className="w-full rounded-full pl-8 pr-3 py-2 text-[12px] focus:outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY }}
            />
          </div>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}