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
 *  Foto = focusPeople. Glas-onder: enkel een snelle zoekfunctie — typ een
 *  naam en vind direct het contact. Tik opent People. */
export default function PeopleFocusWidget() {
  const { openModule } = usePanel();
  const { data: contacts } = useEntityList("Contact", { sort: "name", limit: 200, realtime: true });
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const all = contacts || [];
    if (!q.trim()) return all.slice(0, 6);
    const s = q.toLowerCase();
    return all.filter((c) => (c.name || "").toLowerCase().includes(s) || (c.company || "").toLowerCase().includes(s)).slice(0, 6);
  }, [contacts, q]);

  return (
    <div className="w-full h-[380px]">
      <PhotoGlassLayeredWidget shape="2:3" photo={PHOTO} glassPosition="bottom" glassFraction={0.48} overhang={0} domain="focus" radius="large" onClick={() => openModule("people")} overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/5"
        photoChildren={
          <div className="absolute inset-0 flex flex-col justify-end p-4 pb-3">
            <WidgetHeader type="social" label="People Around Me." count={(contacts || []).length ? String((contacts || []).length) : ""} />
            <h3 className="text-[24px] leading-[1.05] font-display font-semibold tracking-[-0.02em]" style={{ color: IVORY }}>VIND IEDEREEN.</h3>
          </div>
        }
      >
        <div className="flex flex-col gap-2 h-full overflow-hidden -mx-1 px-1" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek een contact…"
              className="w-full rounded-full pl-8 pr-3 py-2 text-[12px] focus:outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY }}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1">
            {results.length === 0 ? (
              <p className="text-[11px] text-ivory/50 px-1 py-2 text-center">Geen contacten gevonden.</p>
            ) : results.map((c) => (
              <button key={c.id} onClick={() => openModule("people")} className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-xl text-left transition-colors hover:bg-white/10">
                <span className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-display font-bold"
                  style={{ background: DEEP, color: LIGHT, border: `1.5px solid ${LIGHT}` }}>
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: IVORY }}>{c.name}</p>
                  <p className="text-[9px] uppercase tracking-wide leading-tight truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{[c.role, c.company].filter(Boolean).join(" · ") || "—"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}