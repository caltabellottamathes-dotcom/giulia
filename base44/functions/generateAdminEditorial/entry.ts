import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * generateAdminEditorial — Giulia analyseert de volledige financiële +
 * administratieve data en schrijft per Admin-tab een editorial blok in
 * begrijpelijke menselijke taal. Dagelijks (workflow) of via Renew.
 * Persisteert per tab in AdminEditorial (upsert). BYOK Gemini.
 *
 * Parallelle per-tab calls (elk met 45s fetch-timeout) i.p.v. één grote
 * hangende some-call — sneller en robuuster.
 */
const TABS = ["OVERVIEW", "PORTEFEUILLES", "LASTEN", "INKOMEN", "FORECAST", "HEALTHY_MONEY", "DOCUMENTEN"];
const TAB_SUBJECT = {
  OVERVIEW: "het totale overzicht — geld hebben vs. besteden, wallets, komende betalingen, inkomsten",
  PORTEFEUILLES: "de wallets/portefeuilles — per pot het saldo, doel, reservering en of ze achterlopen",
  LASTEN: "de lasten/uitgaven — wat staat open, wat is wanneer verschuldigd, wat vraagt aandacht",
  INKOMEN: "de inkomsten — welke stromen, recurring vs. eenmalig, wat nog verwacht/uitstaand",
  FORECAST: "de vooruitblik/forecast — drukpunten, pots onder spanning, saldi-ontwikkeling",
  HEALTHY_MONEY: "gezond omgaan met geld — wat is vastbestemd, wat is vrij besteedbaar, impuls-check",
  DOCUMENTEN: "de documenten — wat ligt klaar, wat ontbreekt, wat vraagt actie",
};
const KEYS = ["Calculator_Gemini_API_Key", "RESERVE_GEMINI_API_KEY", "Gemini_Flash_API_Key", "GIULIA_API_KEY"];
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

const fmt = (n) => `€${Number(n || 0).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dstr = (d) => (d ? String(d).slice(0, 10) : "—");

const SYSTEM = "Je bent Giulia, een persoonlijk OS. Je schrijft editorial blokken voor een persoonlijk financieel besturingssysteem. Ultrakort, punchy, ADHD-vriendelijk — direct opvallend. Menselijk, droog, stijlvol. Nederlands. Schrijf ALLE getallen als cijfers (€1.419,91, 6 wallets, 3 dagen), nóóit uitgeschreven in woorden. Titels zijn KORT en poëtisch/ironisch/humoristisch — geen saaie letterlijke beschrijvingen, maar een speelse rake zin. Wallets hebben twee doelen: Doel 1 = dekking van betalingen (target_balance), Doel 2 = financiële buffer (desired_buffer). Alles boven Doel 1 is buffer / vooruit gespaard. Is Doel 1 bereikt maar Doel 2 nog niet → NIET kritiek, gewoon 'on track'. Pas kritiek als ook Doel 1 niet gehaald wordt.";

function schemaFor() {
  return {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title1: { type: "string" },
      title2: { type: "string" },
      heading1: { type: "string" },
      heading2: { type: "string" },
      body: { type: "string" },
      proposal: { type: "string" },
      itemsLabel: { type: "string" },
      items: { type: "array", items: { type: "object", properties: { n: { type: "string" }, title: { type: "string" }, desc: { type: "string" }, action_type: { type: "string", enum: ["none", "transfer", "pay", "reserve"] }, amount: { type: "number" }, from_id: { type: "string" }, to_id: { type: "string" }, expense_id: { type: "string" } } } },
      restLabel: { type: "string" },
      rest: { type: "string" },
    },
    required: ["title1", "title2", "heading1", "heading2", "body", "proposal", "items", "rest"],
  };
}

async function generateTab(tab, digest) {
  const prompt = `Schrijf een editorial blok voor het Admin-tabblad "${tab}".
Dit tabblad gaat over: ${TAB_SUBJECT[tab]}.

Geef:
- eyebrow: kort label (bv "Personal Admin | Lasten")
- title1, title2: twee KORTE titelregels, poëtisch/ironisch/humoristisch (max ~4 woorden per regel, hoofdletters, geen volledige zinnen, geen letterlijke beschrijving — speels en raak)
- heading1, heading2: twee korte aandachts-headingregels (wat op dit tabblad aandacht vraagt)
- body: DEEL 1 — SAMENVATTING VAN DE ANALYSE van het huidige tabblad (3-5 zinnen, max 90 woorden). Analyseer het thema van het tabblad (Overview = gezamenlijke analyse over alle domeinen). Beschrijf de huidige stand concreet met de getallen uit de data als cijfers. Geen uitgeschreven getallen
- proposal: DEEL 2 — EEN TEKSTUEEL VOORSTEL komend uit de analyse om admin te verbeteren (4-7 zinnen, max 150 woorden). Denk VEEL verder dan triviaal "vul wallet X met €Y". Stel: een betaling (bv Mobiliteit) komt eraan maar er zit te weinig in de wallet — kijk naar ALLE opties om het te laten slagen: is er surplus in een andere wallet om te verplaatsen? welke reserveringen kunnen omhoog? welke lasten kunnen verschuiven? welke inkomsten staan eraan te komen? Adviseer écht financieel, met cijfers als cijfers
- itemsLabel: mono-label (bv "03_actiepunten_")
- items: 1-3 ACTIEPUNTEN — de uitvoerbare vertaling van het voorstel. Elk { n: "01", title: "korte titel", desc: "1 korte zin met bedrag/datum als cijfers", action_type, amount, from_id, to_id, expense_id }. action_type ∈ "transfer" (verplaats amount van from_id wallet naar to_id wallet), "pay" (voer expense_id uit / betaal), "reserve" (verplaats amount van from_id naar to_id om te reserveren), "none" (informatief, geen auto-actie). Gebruik de ECHTE wallet-ID's uit de data voor from_id/to_id en de echte expense-ID voor expense_id. Zonder bruikbare ID's → action_type "none"
- restLabel: "De rest kan wachten"
- rest: 1 korte zin over wat niet dringend is op dit tabblad (cijfers als cijfers)

Baseer je op de data. Kort, krachtig, direct, menselijk, geen SaaS-enthousiasme. Alle getallen als cijfers, nooit uitgeschreven.

DATA:
${digest}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { response_mime_type: "application/json", response_schema: schemaFor(), temperature: 0.85 },
  };

  for (const model of MODELS) {
    for (const keyName of KEYS) {
      const key = process.env[keyName];
      if (!key) continue;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 45000);
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal,
        });
        clearTimeout(t);
        if (!res.ok) { await res.text().catch(() => {}); continue; }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;
        try { return JSON.parse(text); } catch { continue; }
      } catch { clearTimeout(t); continue; }
    }
  }
  return null;
}

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const [portfolios, expenses, incomes, txns, docs] = await Promise.all([
      sr.entities.Portfolio.filter({ archived: false }, "-order", 200).catch(() => []),
      sr.entities.AdminObligation.list("-created_date", 300).catch(() => []),
      sr.entities.Income.list("-created_date", 200).catch(() => []),
      sr.entities.Transaction.list("-created_date", 300).catch(() => []),
      sr.entities.Document.list("-created_date", 100).catch(() => []),
    ]);

    const potName = (pid) => (portfolios.find((p) => p.id === pid) || {}).name || "—";
    const activeP = portfolios.filter((p) => p.active !== false);
    const totalMoney = activeP.reduce((s, p) => s + (Number(p.current_balance) || 0), 0);
    const openExp = expenses.filter((e) => (e.status || "open") !== "done");
    const doneExp = expenses.filter((e) => e.status === "done");
    const incPending = incomes.filter((i) => i.status === "expected" || i.status === "partial");
    const incMonthly = incomes.filter((i) => i.recurring && (i.frequency || "monthly") === "monthly").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const reservedMonthly = activeP.reduce((s, p) => s + (Number(p.monthly_reservation_actual) || 0), 0);

    const lines = [];
    lines.push(`TOTAL MONEY (som saldo actieve wallets): ${fmt(totalMoney)}`);
    lines.push(`INKOMEN recurring/mnd: ${fmt(incMonthly)} · RESERVERINGEN/mnd: ${fmt(reservedMonthly)} · VRIJ ≈ ${fmt(Math.max(0, incMonthly - reservedMonthly))}`);
    lines.push(`Openstaande lasten: ${openExp.length} · Betaald(oit): ${doneExp.length} · Inkomsten: ${incomes.length} (pending: ${incPending.length}) · Transacties: ${txns.length} · Documenten: ${docs.length}`);
    lines.push("", "WALLETS:");
    for (const p of activeP.slice(0, 12)) { const bal = Number(p.current_balance) || 0; const d1 = Number(p.target_balance) || 0; const d2 = Number(p.desired_buffer) || 0; lines.push(`- ${p.name} [id=${p.id}] [${p.kind || "vaste_last"}] saldo ${fmt(p.current_balance)} doel1 ${fmt(p.target_balance)} doel2/buffer ${fmt(p.desired_buffer)} reservering ${fmt(p.monthly_reservation_actual)}/mnd (aanbevolen ${fmt(p.monthly_reservation_recommended)}) doel1_${d1 > 0 ? (bal >= d1 ? "OK" : "NEE") : "-"} doel2_${d2 > 0 ? (bal >= d2 ? "OK" : "NEE") : "-"} bovenDoel1_buffer=${fmt(Math.max(0, bal - d1))} status ${p.status || "on_track"}${p.next_payment_date ? ` volgende ${dstr(p.next_payment_date)} ${fmt(p.next_expected_payment)}` : ""}`); }
    lines.push("", "OPEN LASTEN:");
    for (const e of openExp.slice(0, 20)) lines.push(`- ${e.title} [id=${e.id}] ${fmt(e.expected_amount)} ${e.frequency || "monthly"} ${e.next_payment_date ? `volgende ${dstr(e.next_payment_date)}` : ""} → ${potName(e.portfolio_id)} [id=${e.portfolio_id || "-"}]${e.auto_payment ? " (auto)" : ""}`);
    lines.push("", "INKOMSTEN:");
    for (const i of incomes.slice(0, 15)) lines.push(`- ${i.description || i.category || "inkomen"} ${fmt(i.amount)} ${i.frequency || "monthly"}${i.expected_date ? ` verwacht ${dstr(i.expected_date)}` : ""} status ${i.status || "expected"}${i.recurring ? " (recurring)" : ""}`);
    lines.push("", `DOCUMENTEN: ${docs.length} (${docs.slice(0, 8).map((d) => d.name || d.title).filter(Boolean).join(", ") || "geen"})`);
    const digest = lines.join("\n");

    const results = await Promise.all(TABS.map((tab) => generateTab(tab, digest)));
    const now = new Date().toISOString();
    const existing = await sr.entities.AdminEditorial.list("-created_date", 50).catch(() => []);
    const out = [];
    for (let i = 0; i < TABS.length; i++) {
      const tab = TABS[i];
      const ed = results[i];
      if (!ed) continue;
      const rec = {
        tab,
        eyebrow: ed.eyebrow || "",
        title1: ed.title1 || "",
        title2: ed.title2 || "",
        heading1: ed.heading1 || "",
        heading2: ed.heading2 || "",
        body: ed.body || "",
        proposal: ed.proposal || "",
        items_label: ed.itemsLabel || "",
        items: Array.isArray(ed.items) ? ed.items.slice(0, 3).map((it, idx) => ({ n: it.n || String(idx + 1).padStart(2, "0"), title: it.title || "", desc: it.desc || "", action_type: it.action_type || "none", amount: Number(it.amount) || 0, from_id: it.from_id || "", to_id: it.to_id || "", expense_id: it.expense_id || "" })) : [],
        rest_label: ed.restLabel || "The rest can wait.",
        rest: ed.rest || "",
        generated_at: now,
      };
      const ex = existing.find((e) => e.tab === tab);
      try {
        if (ex) { await sr.entities.AdminEditorial.update(ex.id, rec); out.push({ ...rec, id: ex.id }); }
        else { const c = await sr.entities.AdminEditorial.create(rec); out.push({ ...rec, id: c.id }); }
      } catch {}
    }
    return Response.json({ ok: true, editorials: out, generated: out.length });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}