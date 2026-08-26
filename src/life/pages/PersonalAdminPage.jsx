import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { adminWeather, radarEvents, weatherZones, repeaters, friction, nextThing, openLoops, comingUp, needsYouList, daysUntil, fmtDate } from "@/lib/adminUtils";
import { Shield, Wallet, FileText, RefreshCw, ListChecks, CircleDot } from "lucide-react";
import { logLifeActivity } from "@/lib/lifeActivity";
import AdminItemEditor from "@/life/components/AdminItemEditor";
import SpaceShell from "@/life/components/space/SpaceShell";
import SpaceRecap from "@/life/components/space/SpaceRecap";
import AdminStacks from "@/life/components/space/AdminStacks";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: CircleDot },
  { key: "MONEY", label: "Geld", icon: Wallet },
  { key: "DOCUMENTS", label: "Documenten", icon: FileText },
  { key: "RENEWALS", label: "Verlengingen", icon: RefreshCw },
  { key: "OBLIGATIONS", label: "Verplichtingen", icon: ListChecks },
  { key: "OPEN", label: "Open", icon: CircleDot },
];

function buildSnapshot(tab, d) {
  const lines = [];
  const label = TABS.find((t) => t.key === tab)?.label || tab;
  lines.push(`Tab: ${label}`);
  lines.push(`Totaal zaken: ${d.obs.length} · actief: ${d.obs.filter((o) => o.status !== "done").length} · te laat: ${d.w.counts.overdue} · op komst: ${d.w.counts.coming} · vereist jou: ${d.w.counts.needsYou} · geld op komst: €${Math.round(d.w.counts.money)}`);
  if (d.next) lines.push(`Volgende: ${d.next.title} (${fmtDate(d.next.due_date)}, ${daysUntil(d.next.due_date)} dagen, €${d.next.amount || 0})`);
  if (d.stuck) lines.push(`Vast lopend: ${d.stuck.title} — ${d.stuck.notes || "geen notitie"}`);
  lines.push(`Terugkerend: ${d.rep.monthly.length} maandelijks, ${d.rep.yearly.length} jaarlijks`);
  lines.push(`Open loops: ${d.loops.length}`);
  lines.push(`Documenten actief: ${d.activeDocs.length}`);
  lines.push("Komende items:");
  d.events.slice(0, 8).forEach((e) => lines.push(`- ${e.title} | €${e.amount || 0} | ${fmtDate(e.due_date)} | ${daysUntil(e.due_date)} dagen | ${daysUntil(e.due_date) < 0 ? "te laat" : daysUntil(e.due_date) <= 7 ? "nadert" : "op koers"}`));
  return lines.join("\n");
}

function buildPrompt(tab, d) {
  const label = TABS.find((t) => t.key === tab)?.label || tab;
  const overview = tab === "OVERVIEW";
  return `Je bent GIULIA, de persoonlijke AI-assistent van Salvo. Schrijf een redactioneel overzicht in gewone, warme menselijke taal over de actuele staat van zijn persoonlijke administratie${overview ? " (overview — dek alle tabs)" : ` (${label}-tab)`}.

Regels:
- headline: 1 korte, prikkende zin (max ~8 woorden) die de huidige staat vangt. Geen label-woord ervoor.
- summary: 2-3 zinnen, de kern van de staat, met concrete cijfers/data. Spreek Salvo aan met "je".
- highlights: 4-6 korte puntjes, elk met een "kicker" (één woord in hoofdletters, bijv. GELD, DOCUMENTEN, VERLENGINGEN, VERPLICHTINGEN, OPEN, VOLGENDE, VAST) en een "text" van 1-2 zinnen met concrete cijfers/data uit de data.${overview ? " Dit is het overview — dek alle tabs: geld, documenten, verlengingen, verplichtingen en openstaand." : ` Focus op de ${label}-tab.`}
- Nederlands. Geen markdown.

Data:
${buildSnapshot(tab, d)}`;
}

export default function PersonalAdminPage() {
  const [obs, setObs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => (new URLSearchParams(window.location.search).get("tab") || "OVERVIEW").toUpperCase());
  const [editor, setEditor] = useState({ open: false, item: null });
  const [recapRefresh, setRecapRefresh] = useState(0);

  const load = async () => {
    try {
      const [o, d] = await Promise.all([base44.entities.AdminObligation.list().catch(() => []), base44.entities.Document.list().catch(() => [])]);
      setObs(o || []); setDocs(d || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const w = useMemo(() => adminWeather(obs), [obs]);
  const events = useMemo(() => radarEvents(obs), [obs]);
  const zones = useMemo(() => weatherZones(obs), [obs]);
  const next = useMemo(() => nextThing(obs), [obs]);
  const stuck = useMemo(() => friction(obs), [obs]);
  const rep = useMemo(() => repeaters(obs), [obs]);
  const loops = useMemo(() => openLoops(obs), [obs]);
  const moneyPayments = useMemo(() => comingUp(obs).filter((o) => Number(o.amount) > 0), [obs]);
  const renewals = useMemo(() => obs.filter((o) => ["renewal", "subscription", "insurance"].includes(o.type)), [obs]);
  const activeDocs = useMemo(() => (docs || []).filter((d) => d.status !== "archived"), [docs]);
  const needsYouCount = useMemo(() => needsYouList(obs).length, [obs]);

  const data = { w, events, zones, next, stuck, rep, loops, moneyPayments, renewals, activeDocs, obs, needsYouCount };

  const done = async (o) => { try { await base44.entities.AdminObligation.update(o.id, { status: "done" }); await logLifeActivity("Admin", "completed", `${o.title} afgerekend`); await load(); } catch { /* ignore */ } };
  const del = async (o) => { try { await base44.entities.AdminObligation.delete(o.id); await logLifeActivity("Admin", "deleted", `${o.title} verwijderd`); await load(); } catch { /* ignore */ } };
  const openNew = () => setEditor({ open: true, item: null });
  const openEdit = (o) => setEditor({ open: true, item: o });
  const closeEditor = () => setEditor({ open: false, item: null });
  const afterEdit = () => { load(); setRecapRefresh((r) => r + 1); };

  const recapPrompt = useMemo(() => buildPrompt(tab, data), [tab, obs, docs]); // eslint-disable-line react-hooks/exhaustive-deps
  const fallback = useMemo(() => buildFallback(tab, data), [tab, obs, docs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SpaceShell
        bgImage={IMAGES.lifePersonalAdmin}
        heroImage="https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg"
        eyebrow="LIFE → ADMIN"
        title="Things to Handle!"
        tabs={TABS}
        activeTab={tab}
        onTab={setTab}
        navInfo="LIFE · ADMIN"
        onAdd={openNew}
        recap={<SpaceRecap prompt={recapPrompt} fallback={fallback} refreshKey={recapRefresh} onRefresh={() => setRecapRefresh((r) => r + 1)} />}
      >
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <AdminStacks tab={tab} data={data} onDone={done} onEdit={openEdit} onDelete={del} />
        )}
      </SpaceShell>

      <AdminItemEditor open={editor.open} item={editor.item} onClose={closeEditor} onSaved={afterEdit} onDeleted={afterEdit} />
    </>
  );
}

/** Deterministische fallback-recap voor als de AI-call faalt. */
function buildFallback(tab, d) {
  let headline = "Je administratie is rustig.";
  let summary = `Er staan ${d.w.counts.coming} zaken op komst en er is €${Math.round(d.w.counts.money)} aan administratie in de wachtrij.`;
  if (d.w.counts.overdue > 0) { headline = `${d.w.counts.overdue} zaken lopen al te laat.`; summary = `Er zijn ${d.w.counts.overdue} te late zaken en €${Math.round(d.w.counts.money)} in de wachtrij. Pak eerst wat te laat is op.`; }
  else if (d.next) { headline = `Volgende: ${d.next.title}.`; summary = `${d.next.title} staat klaar${d.next.amount ? ` voor €${d.next.amount}` : ""} op ${fmtDate(d.next.due_date)}, over ${daysUntil(d.next.due_date)} dagen. Verder ${d.w.counts.coming} zaken op komst.`; }
  const highlights = [];
  if (d.next) highlights.push({ kicker: "VOLGENDE", text: `${d.next.title}${d.next.amount ? ` · €${d.next.amount}` : ""} · ${fmtDate(d.next.due_date)} (${daysUntil(d.next.due_date)} dagen).` });
  highlights.push({ kicker: "GELD", text: `€${Math.round(d.w.counts.money)} op komst; ${d.rep.monthly.length} maandelijks en ${d.rep.yearly.length} jaarlijks terugkerend.` });
  highlights.push({ kicker: "VERPLICHTINGEN", text: `${d.obs.filter((o) => o.status !== "done").length} actief, ${d.w.counts.needsYou} vereisen jou, ${d.w.counts.coming} op komst.` });
  highlights.push({ kicker: "DOCUMENTEN", text: `${d.activeDocs.length} documenten in de stapel, ${d.activeDocs.filter((x) => x.status === "recent").length} in beweging.` });
  highlights.push({ kicker: "OPEN", text: `${d.loops.length} open loops${d.stuck ? `; "${d.stuck.title}" zit vast` : ""}.` });
  return (
    <>
      <h2 className="font-display text-[40px] leading-[0.95] tracking-[-0.03em] text-foreground">{headline}</h2>
      <p className="font-body text-[15px] leading-[1.65] text-foreground/75 text-balance italic">{summary}</p>
      <div className="flex flex-col gap-4 mt-auto">
        {highlights.map((h, i) => (
          <div key={i} className="border-t border-foreground/12 pt-3">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-olive mb-1">{h.kicker}</p>
            <p className="font-display text-[15px] leading-[1.5] text-foreground/85">{h.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}