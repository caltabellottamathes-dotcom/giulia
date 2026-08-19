import React from "react";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Trash2, Check, Sparkles } from "lucide-react";
import { Tile, SIZES, WidgetHeader, Ring, CountUp, BrandPhoto } from "./shared";

/* PeopleWidget — glass floats over a header photo; avatar cluster + call. */
export function PeopleAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const sorted = [...contacts].sort((a, b) => (a.name || "").trim().toLowerCase().localeCompare((b.name || "").trim().toLowerCase(), "nl"));
  const top = sorted.find((c) => c.phone) || sorted[0];
  const cluster = sorted.slice(0, 5);
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("people")}>
      <div className="flex flex-col h-full">
        <div className={cn("relative shrink-0 overflow-hidden", ratio === "tall" ? "h-16" : ratio === "wide" ? "h-14" : "h-20")}>
          <BrandPhoto src={IMAGES.portraitThinking} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-4 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">People Around Me.</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/70 tabular-nums">{contacts.length}</span>
          </div>
        </div>
        <div className="flex-1 -mt-6 rounded-t-[20px] glass-3 p-4 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col min-h-0">
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : contacts.length > 0 ? (
            <>
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {cluster.map((c, i) => <span key={c.id} className="h-10 w-10 rounded-full border-2 border-ivory/20 flex items-center justify-center text-sm font-semibold" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)", zIndex: 10 - i }}>{c.name?.slice(0, 1).toUpperCase()}</span>)}
                </div>
                {contacts.length > cluster.length && <span className="ml-3 text-sm font-medium text-ivory/60">+{contacts.length - cluster.length}</span>}
              </div>
              <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                <div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-ivory/45">Bellen</p><p className="text-sm font-semibold text-ivory truncate">{top?.name}</p></div>
                <a href={top?.phone ? `tel:${top.phone}` : undefined} onClick={(e) => e.stopPropagation()} className={cn("h-10 px-4 rounded-2xl font-semibold text-sm flex items-center transition hover:-translate-y-0.5", !top?.phone && "pointer-events-none opacity-40")} style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Bel</a>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Geen contacten</p></div>}
        </div>
      </div>
    </Tile>
  );
}

/* DocumentsWidget — fanned stack of file cards + favorite toggle. */
const TYPE_MARK = { pdf: "PDF", image: "IMG", doc: "DOC", sheet: "XLS", figma: "FIG", other: "FILE" };
const TYPE_COLOR = { pdf: "bg-charcoal", image: "bg-olive", doc: "bg-charcoal", sheet: "bg-sand", figma: "bg-olive", other: "bg-charcoal" };
export function DocumentsAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: docs, loading, reload } = useEntityList("Document", { sort: "-created_date" });
  const favs = docs.filter((d) => d.status === "favorite");
  const top = docs[0];
  const stack = docs.slice(0, 3);
  const toggleFav = async (e, d) => { e.stopPropagation(); try { await base44.entities.Document.update(d.id, { status: d.status === "favorite" ? "recent" : "favorite" }); reload(); } catch {} };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("documents")}>
      <div className="p-4 flex flex-col h-full">
        <WidgetHeader label="Documenten" count={`${docs.length}`} />
        {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div> : docs.length > 0 ? (
          <div className="flex-1 flex items-center gap-4 min-h-0">
            <div className="relative w-20 h-24 shrink-0">
              {stack.map((d, i) => (
                <div key={d.id} className={cn("absolute inset-0 rounded-2xl overflow-hidden border border-ivory/15 float-shadow", i === 0 ? "z-30" : "z-20")} style={{ transform: `translate(${i * 5}px, ${i * 5}px) rotate(${i * 4}deg)` }}>
                  {i === 0 && (d.type === "image" && d.url ? <img src={d.url} alt="" className="h-full w-full object-cover" /> : <div className={cn("h-full w-full flex items-center justify-center", TYPE_COLOR[d.type] || "bg-charcoal")}><span className="font-display font-bold text-base tracking-tight text-ivory">{TYPE_MARK[d.type] || "FILE"}</span></div>)}
                  {i > 0 && <img src={IMAGES.chairsScattered} alt="" className="h-full w-full object-cover opacity-80" draggable={false} />}
                </div>
              ))}
              <span className="absolute -top-2 -right-2 z-40 h-6 min-w-6 px-1 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{docs.length}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-current truncate">{top?.name}</p>
              <p className="text-[11px] opacity-50 truncate mt-0.5">{top?.owner || "Onbekend"}</p>
              <button onClick={(e) => toggleFav(e, top)} className={cn("mt-2.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition", top?.status === "favorite" ? "border-transparent" : "border-current/15 text-current")} style={top?.status === "favorite" ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}>{top?.status === "favorite" ? "Favoriet" : "Markeer favoriet"}</button>
              {favs.length > 0 && <p className="text-[11px] opacity-50 mt-1.5">{favs.length} favorieten</p>}
            </div>
          </div>
        ) : <BrandPhoto src={IMAGES.chairsScattered} className="flex-1 rounded-2xl" overlay="bg-charcoal/45"><div className="absolute inset-0 flex items-center justify-center"><p className="text-sm text-ivory">Geen bestanden</p></div></BrandPhoto>}
      </div>
    </Tile>
  );
}

/* MemoryWidget — glass floats over a bottom photo; confidence ring + ±. */
export function MemoryAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: memories, loading, reload } = useEntityList("Memory", { sort: "-created_date" });
  const top = memories[0];
  const avg = memories.length ? memories.reduce((a, m) => a + (m.confidence || 0.5), 0) / memories.length : 0;
  const setConf = async (e, m, delta) => { e.stopPropagation(); const c = Math.max(0, Math.min(1, +(m.confidence || 0.5) + delta)); try { await base44.entities.Memory.update(m.id, { confidence: +c.toFixed(2) }); reload(); } catch {} };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("memory")}>
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-6 rounded-b-[20px] glass-3 p-4 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col min-h-0">
          <WidgetHeader label="What I Remember." count={`${memories.length} herinneringen`} />
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : memories.length > 0 ? (
            <div className="flex-1 flex items-center gap-4 min-h-0">
              <Ring value={avg} max={1} size={s.ring} stroke={10}>
                <div className="text-center"><span className="text-xl font-display font-semibold leading-none text-ivory">{Math.round(avg * 100)}</span><p className="text-[8px] uppercase tracking-wider text-ivory/45 mt-0.5">zeker</p></div>
              </Ring>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-ivory/45">{top.category}</p>
                <p className="text-sm text-ivory/85 line-clamp-2 leading-snug mt-0.5">{top.content}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button onClick={(e) => setConf(e, top, -0.1)} className="h-8 w-8 rounded-full glass-button text-ivory text-lg leading-none flex items-center justify-center transition hover:bg-white/15">−</button>
                  <button onClick={(e) => setConf(e, top, 0.1)} className="h-8 w-8 rounded-full glass-button text-ivory text-lg leading-none flex items-center justify-center transition hover:bg-white/15">+</button>
                </div>
              </div>
            </div>
          ) : <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Nog niets onthouden</p></div>}
        </div>
        <div className={cn("relative shrink-0 overflow-hidden", s.photo)}><BrandPhoto src={IMAGES.loungeChairs} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" /></div>
      </div>
    </Tile>
  );
}

/* ActivityWidget — photo floats over the glass (count on the photo); per-source
 * rows with clear. */
const SRC_COLOR = { email: "hsl(16 45% 47%)", whatsapp: "hsl(var(--sand))", task: "hsl(var(--olive))", calendar: "hsl(var(--ridge))", system: "hsl(var(--smoke))", giulia: "hsl(var(--olive))" };
const SRC_LABEL = { email: "Who's Texting?", whatsapp: "Who's Texting?", task: "To Do!", calendar: "What's Happening?", system: "Systeem", giulia: "Giulia" };
const dot = (s) => SRC_COLOR[(s || "").toLowerCase()] || "hsl(var(--smoke))";
const label = (s) => SRC_LABEL[(s || "").toLowerCase()] || (s || "Overig");
export function ActivityAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: items, loading, reload } = useEntityList("Activity", { sort: "-created_date" });
  const groups = {};
  items.forEach((it) => { const k = (it.source || "overig").toLowerCase(); (groups[k] = groups[k] || []).push(it); });
  const keys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length).slice(0, ratio === "wide" ? 4 : 4);
  const clearCat = async (k) => { const ids = groups[k].map((g) => g.id); try { await base44.entities.Activity.deleteMany({ id: { $in: ids } }); reload(); } catch {} };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("activity")}>
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.topDownWalk} className={cn("-mb-6 rounded-b-[20px] shadow-[0_14px_24px_-12px_rgba(0,0,0,0.3)] relative z-10", ratio === "tall" ? "h-16" : "h-14")} overlay="bg-gradient-to-t from-charcoal/85 to-charcoal/30">
          <div className="absolute inset-0 px-4 flex items-end justify-between pb-1.5">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">I Do Process!</h3>
            <span className="text-xl font-display font-semibold text-ivory tabular-nums">{items.length}</span>
          </div>
        </BrandPhoto>
        <div className="p-3.5 pt-7 flex-1 flex flex-col min-h-0">
          {loading ? <div className="flex-1 flex items-center"><div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div> : keys.length ? (
            <div className="space-y-1.5">
              {keys.map((k) => {
                const list = groups[k];
                return (
                  <div key={k} className="group flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: dot(k) }} />
                    <span className="text-[10px] uppercase tracking-wider font-bold w-16 shrink-0 text-current opacity-70">{label(k)}</span>
                    <span className="text-[11px] text-current opacity-60 truncate flex-1">{list[0].description}</span>
                    <span className="text-[10px] tabular-nums text-current opacity-50 shrink-0">{list.length}</span>
                    <button onClick={(e) => { e.stopPropagation(); clearCat(k); }} className="opacity-0 group-hover:opacity-100 text-current/50 hover:text-current transition-opacity shrink-0" aria-label="Wis categorie"><Trash2 className="h-3 w-3" /></button>
                  </div>
                );
              })}
            </div>
          ) : <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Nog geen activiteit</p></div>}
        </div>
      </div>
    </Tile>
  );
}