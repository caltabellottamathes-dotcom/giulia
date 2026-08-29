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

const SYSTEM = "Je bent Giulia, een persoonlijk OS. Je schrijft editorial blokken voor een persoonlijk financieel besturingssysteem. Kort, menselijk, droog, stijlvol. Nederlands.";

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
      itemsLabel: { type: "string" },
      items: { type: "array", items: { type: "object", properties: { n: { type: "string" }, title: { type: "string" }, desc: { type: "string" } } } },
      restLabel: { type: "string" },
      rest: { type: "string" },
    },
    required: ["title1", "title2", "heading1", "heading2", "body", "items", "rest"],
  };
}

async function generateTab(tab, digest) {
  const prompt = `Schrijf een editorial blok voor het Admin-tabblad "${tab}".
Dit tabblad gaat over: ${TAB_SUBJECT[tab]}.

Geef:
- eyebrow: kort label (bv "Personal Admin | Lasten")
- title1, title2: twee korte titelregels (hoofdletters, max ~4 woorden per regel, stijlvol — geen volledige zinnen)
- heading1, heading2: twee korte aandachts-headingregels (wat op dit tabblad aandacht vraagt)
- body: een COMPACTE maar ADHD-interessante copy (2-3 korte alinea's, 140-240 woorden). Wisselende ritme: korte felle zinnen afgewisseld met één iets langere. Alsof Giulia net iets opviel en het je wil vertellen — nieuwsgierig makend, prikkelend, specifiek met de getallen uit de data. Geen bulletlist, geen saaie opsomming. Persoonlijk, scherp, een tikje rusteloos
- itemsLabel: mono-label (bv "03_payments_due_")
- items: 0-3 aandachtspunten, elk { n: "01", title: "korte titel", desc: "1 zin met bedrag/datum" } — concreet, specifiek voor dit tabblad
- restLabel: korte zin (bv "The rest can wait.")
- rest: 1 zin over wat niet dringend is op dit tabblad

Baseer je op de data. Direct, menselijk, geen SaaS-enthousiasme.

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
    for (const p of activeP.slice(0, 12)) lines.push(`- ${p.name} [${p.kind || "vaste_last"}] saldo ${fmt(p.current_balance)} doel ${fmt(p.target_balance)} reservering ${fmt(p.monthly_reservation_actual)}/mnd (aanbevolen ${fmt(p.monthly_reservation_recommended)}) status ${p.status || "on_track"}${p.next_payment_date ? ` volgende ${dstr(p.next_payment_date)} ${fmt(p.next_expected_payment)}` : ""}`);
    lines.push("", "OPEN LASTEN:");
    for (const e of openExp.slice(0, 20)) lines.push(`- ${e.title} ${fmt(e.expected_amount)} ${e.frequency || "monthly"} ${e.next_payment_date ? `volgende ${dstr(e.next_payment_date)}` : ""} → ${potName(e.portfolio_id)}${e.auto_payment ? " (auto)" : ""}`);
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
        items_label: ed.itemsLabel || "",
        items: Array.isArray(ed.items) ? ed.items.slice(0, 3).map((it, idx) => ({ n: it.n || String(idx + 1).padStart(2, "0"), title: it.title || "", desc: it.desc || "" })) : [],
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