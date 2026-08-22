import React from "react";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusDocs;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const IVORY = "hsl(var(--ivory))";
const URGENT = "hsl(var(--d-focus-urgent))";
const TYPE_MARK = { pdf: "PDF", image: "IMG", doc: "DOC", sheet: "XLS", figma: "FIG", other: "FILE" };

/** DocumentsFocusWidget — P·3x2·B·SIDE · "Files to Share."
 *  PhotoShell-header bovenin; GlassCard onder met recente bestanden (type-chip
 *  in pistachio + plum merk, naam in wit, "te delen" in urgent-geel). Focus-
 *  kleuren, zelfde skelet als de andere Focus-widgets. Data: Document. */
export default function DocumentsFocusWidget() {
  const { openModule } = usePanel();
  const { data: docs, loading } = useEntityList("Document", { sort: "-created_date", limit: 60, realtime: true });

  const recent = (docs || []).slice(0, 4);
  const shared = (docs || []).filter((d) => d.status === "shared").length;
  const total = (docs || []).length;

  return (
    <div className="w-full h-[290px]">
      <PhotoGlassLayeredWidget shape="3:2" photo={PHOTO} glassPosition="bottom" glassFraction={0.42} overhang={0} domain="focus" radius="large" onClick={() => openModule("documents")} overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/8"
        photoChildren={
          <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-10 bg-gradient-to-b from-black/60 to-transparent" style={{ color: IVORY }}>
            <WidgetHeader type="briefing" label="Files to Share." count={total ? String(total) : ""} />
            <h3 className="text-[20px] leading-tight font-display font-semibold tracking-[-0.02em] mt-1">TE DELEN BESTANDEN.</h3>
            {shared > 0 && <p className="text-[9px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{shared} klaar om te delen</p>}
          </div>
        }
      >
        <div className="flex flex-col h-full overflow-hidden -mx-1 px-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1.5 mt-1">
            {loading ? (
              <div className="flex items-center justify-center py-4"><div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
            ) : recent.length === 0 ? (
              <p className="text-[11px] text-ivory/55 px-1 py-2">Nog geen bestanden.</p>
            ) : recent.map((d) => (
              <button key={d.id} onClick={() => openModule("documents")} className="group flex items-center gap-2.5 py-1.5 pl-2 pr-1.5 rounded-xl text-left hover:bg-white/10 transition-colors">
                <span className="h-7 px-1.5 rounded-md shrink-0 flex items-center justify-center text-[8px] font-display font-bold" style={{ background: LIGHT, color: DEEP }}>{TYPE_MARK[d.type] || "FILE"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: IVORY }}>{d.name || d.title}</p>
                  <p className="text-[9px] uppercase tracking-wide leading-tight truncate" style={{ color: d.status === "shared" ? URGENT : "rgba(255,255,255,0.45)" }}>{d.owner || "—"}{d.status === "shared" ? " · te delen" : ""}</p>
                </div>
                {d.status === "shared" && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: URGENT }} />}
              </button>
            ))}
          </div>
          <button onClick={() => openModule("documents")} className="text-[8px] uppercase tracking-[0.2em] font-bold pt-1.5 self-end" style={{ color: LIGHT }}>ALLES →</button>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}