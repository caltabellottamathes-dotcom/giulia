import React, { useMemo, useState } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Tile, SIZES, WidgetHeader, CountUp, BrandPhoto } from "./shared";

/* EmailWidget — oversized unread count + inbox meter; brand photo floats over
 * the bottom with sender + action. Wide → count left / meter+photo right. */
export function EmailAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: emails, loading } = useEntityList("Email", { filter: { folder: "inbox" }, sort: "-created_date" });
  const unread = emails.filter((e) => e.status === "unread");
  const urgent = unread.filter((e) => e.important);
  const hero = unread.length;
  const next = unread[0];
  const row = ratio === "wide";
  return (
    <Tile ratio={ratio} radius="large" onClick={() => openModule("email")}>
      <div className="p-4 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Who's Texting?" count={hero ? `${hero} ongelezen` : "alles gelezen"} />
        {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div> : (
          <>
            <div className={cn("flex", row ? "items-end gap-4" : "items-end gap-3")}>
              <CountUp value={hero} className={cn("font-display font-semibold tracking-[-0.04em] text-current leading-[0.85]", row ? "text-6xl" : s.big)} />
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-2">ongelezen</p>
              {row && <div className="flex-1 flex gap-1 items-end h-16">
                {Array.from({ length: 14 }).map((_, i) => {
                  const filled = i < hero; const isUrgent = i < urgent.length;
                  return <span key={i} className="h-full flex-1 rounded-[3px]" style={filled ? { background: isUrgent ? "var(--tile-accent)" : "currentColor", opacity: isUrgent ? 1 : 0.85 } : { background: "currentColor", opacity: 0.1 }} />;
                })}
              </div>}
            </div>
            {!row && <div className="mt-4 flex gap-1 h-8">
              {Array.from({ length: 14 }).map((_, i) => {
                const filled = i < hero; const isUrgent = i < urgent.length;
                return <span key={i} className="h-full flex-1 rounded-[3px]" style={filled ? { background: isUrgent ? "var(--tile-accent)" : "currentColor", opacity: isUrgent ? 1 : 0.85 } : { background: "currentColor", opacity: 0.1 }} />;
              })}
            </div>}
            <div className="flex-1" />
          </>
        )}
      </div>
      {!loading && (
        <BrandPhoto src={IMAGES.portraitBoot} className={cn("w-full -mt-6 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.28)]", ratio === "tall" ? "h-20" : ratio === "wide" ? "h-16" : "h-20")} overlay="bg-gradient-to-t from-charcoal/40 via-transparent to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <p className="text-sm font-semibold text-ivory truncate" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{next ? next.sender || "Onbekend" : "Inbox rustig"}</p>
            {urgent.length > 0 ? <button onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition hover:-translate-y-0.5 shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{urgent.length} nodig actie</button> : <button onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="rounded-full px-3 py-1.5 text-[11px] font-semibold border border-ivory/30 text-ivory transition hover:bg-ivory/10 shrink-0">Open mail</button>}
          </div>
        </BrandPhoto>
      )}
    </Tile>
  );
}

/* WhatsAppWidget — photo floats over the glass (unread count on the photo);
 * top conversation bubble + reply. */
export function WhatsAppAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const { data: messages, reload } = useEntityList("WhatsAppMessage", { sort: "-created_date" });
  const { data: drafts } = useEntityList("Approval", { filter: { type: "whatsapp", status: "pending" } });
  const [reply, setReply] = useState("");
  const draftsReady = useMemo(() => drafts.filter((d) => d.status === "pending"), [drafts]);
  const convos = useMemo(() => {
    const m = new Map();
    messages.forEach((msg) => { const id = msg.contact_id; if (!id) return; if (!m.has(id)) m.set(id, { contact_id: id, last: msg, unread: 0, last_ts: "" }); const c = m.get(id); if (!c.last_ts || (msg.timestamp || msg.created_date || "") > c.last_ts) { c.last = msg; c.last_ts = msg.timestamp || msg.created_date; } if (msg.direction === "received" && msg.status === "unread") c.unread += 1; });
    return Array.from(m.values()).sort((a, b) => (b.last_ts || "").localeCompare(a.last_ts || "")).slice(0, 3);
  }, [messages]);
  const nameOf = (id) => contacts.find((c) => c.id === id)?.name || "Onbekend";
  const top = convos[0];
  const unreadTotal = convos.reduce((a, c) => a + c.unread, 0);
  const draftForTop = top && draftsReady.some((d) => d.thread_id === top.contact_id);
  const send = async (e) => { e.stopPropagation(); if (!reply.trim() || !top) return; try { await base44.entities.WhatsAppMessage.create({ contact_id: top.contact_id, message: reply.trim(), direction: "sent", status: "delivered" }); setReply(""); reload(); } catch {} };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("whatsapp")}>
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.stilettoHead} className={cn("-mb-6 rounded-b-[20px] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)] relative z-10", ratio === "tall" ? "h-20" : "h-16")} overlay="bg-gradient-to-t from-charcoal/85 to-charcoal/30">
          <div className="absolute inset-0 px-4 flex items-end justify-between pb-2.5">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80 mb-1">Who's Texting?</h3>
              {unreadTotal > 0 && <div className="flex items-end gap-2"><CountUp value={unreadTotal} className="text-2xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" /><p className="text-[10px] uppercase tracking-[0.2em] text-ivory/75 mb-0.5">ongelezen</p></div>}
            </div>
            {draftsReady.length > 0 && <span className="text-[10px] uppercase tracking-wider text-ivory/70">{draftsReady.length} concept</span>}
          </div>
        </BrandPhoto>
        <div className="p-4 pt-8 flex-1 flex flex-col min-h-0">
          {loading ? <div className="flex-1 flex items-center"><div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div> : top ? (
            <>
              <div className="flex items-start gap-2">
                <span className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{nameOf(top.contact_id).slice(0, 1).toUpperCase()}</span>
                <div className="relative flex-1 rounded-2xl rounded-tl-sm px-3 py-2 bg-current/[0.08]">
                  <p className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">{nameOf(top.contact_id)}</p>
                  <p className="text-sm text-current leading-snug line-clamp-2">{top.last.message}</p>
                  {top.unread > 0 && <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{top.unread}</span>}
                </div>
              </div>
              {draftForTop && <button onClick={(e) => { e.stopPropagation(); openModule("whatsapp"); }} className="mt-2 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold border border-current/15 text-current transition hover:bg-current/5">Giulia stelde een concept voor</button>}
              <form onSubmit={(e) => { e.preventDefault(); send(e); }} onClick={(e) => e.stopPropagation()} className="mt-auto pt-2.5 flex items-center gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Antwoord aan ${nameOf(top.contact_id)}…`} className="flex-1 min-w-0 bg-current/5 border border-current/15 rounded-full px-3.5 py-2 text-sm text-current placeholder:text-current/40 focus:outline-none focus:border-current/40" />
                <button type="submit" className="h-10 w-10 rounded-full flex items-center justify-center font-semibold transition hover:-translate-y-0.5 shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>→</button>
              </form>
            </>
          ) : <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Geen berichten</p></div>}
        </div>
      </div>
    </Tile>
  );
}

/* ProjectsWidget — photo floats over the glass (avg on the photo); progress
 * bars + nudge. */
export function ProjectsAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: projects, loading, reload } = useEntityList("Project");
  const active = projects.filter((p) => ["planning", "in_progress", "waiting"].includes(p.status));
  const avg = active.length ? Math.round(active.reduce((a, p) => a + (p.progress || 0), 0) / active.length) : 0;
  const visible = active.slice(0, ratio === "wide" ? 3 : 3);
  const nudge = async (e, p, delta) => { e.stopPropagation(); const np = Math.max(0, Math.min(100, Math.round((p.progress || 0) + delta))); try { await base44.entities.Project.update(p.id, { progress: np }); reload(); } catch {} };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("projects")}>
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.walkChairsHigh} className={cn("-mb-6 rounded-b-[20px] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)] relative z-10", ratio === "tall" ? "h-20" : "h-16")} overlay="bg-gradient-to-t from-charcoal/45 via-transparent to-transparent">
          <div className="absolute inset-0 px-4 pb-2.5 flex items-end">
            <div className="flex items-end gap-2"><CountUp value={avg} className="text-3xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" /><p className="text-[10px] uppercase tracking-[0.2em] text-ivory/75 mb-1">gem. klaar</p></div>
          </div>
        </BrandPhoto>
        <div className="p-4 pt-8 flex-1 flex flex-col min-h-0">
          <WidgetHeader label="What I'm Building." count={`${active.length} actief`} />
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div> : active.length > 0 ? (
            <>
              <div className="flex-1 space-y-3 min-h-0">
                {visible.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between gap-2 mb-1"><p className="text-sm font-medium text-current truncate">{p.title}</p><span className="text-[11px] tabular-nums opacity-50">{p.progress || 0}%</span></div>
                    <div className="relative h-2.5 rounded-full bg-current/10 overflow-hidden"><div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${Math.min(p.progress || 0, 100)}%`, background: "var(--tile-accent)" }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={(e) => nudge(e, active[0], -10)} className="h-8 w-8 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:bg-current/5">−</button>
                <button onClick={(e) => nudge(e, active[0], 10)} className="h-8 w-8 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:bg-current/5">+</button>
                <span className="text-[11px] opacity-50 truncate">{active[0]?.title}</span>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Geen actieve projecten</p></div>}
        </div>
      </div>
    </Tile>
  );
}

/* KnowledgeWidget — glass floats over a bottom photo; count + category bars. */
const KCATS = ["Notes", "Insights", "Research", "Decisions", "Saved"];
export function KnowledgeAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Knowledge", { sort: "-created_date" });
  const [cat, setCat] = useState("all");
  const counts = KCATS.reduce((acc, c) => { acc[c] = items.filter((k) => k.category === c).length; return acc; }, {});
  const maxC = Math.max(1, ...Object.values(counts));
  const row = ratio === "wide";
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("knowledge")}>
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-6 rounded-b-[20px] glass-3 p-4 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col min-h-0">
          <WidgetHeader label="What I Know." count={`${items.length} notities`} />
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : items.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-end gap-3 mb-3"><CountUp value={items.length} className={cn("font-display font-semibold tracking-[-0.03em] leading-none text-ivory", row ? "text-4xl" : s.big)} /><p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-1">notities</p></div>
              <div className="flex items-end gap-2 flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                {KCATS.map((c) => (
                  <button key={c} onClick={() => setCat(cat === c ? "all" : c)} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="w-full rounded-md transition-all duration-500" style={{ height: `${Math.max(8, (counts[c] / maxC) * 100)}%`, background: "var(--tile-accent)", opacity: cat === "all" || cat === c ? 1 : 0.4 }} />
                    <span className="text-[8px] uppercase tracking-wide text-ivory/45">{c.slice(0, 3)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Nog niets opgeslagen</p></div>}
        </div>
        <div className={cn("relative shrink-0 overflow-hidden", s.photo)}><BrandPhoto src={IMAGES.chairWater} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" /></div>
      </div>
    </Tile>
  );
}