import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, geminiEmbed } from '../../shared/gemini.ts';

/**
 * consolidateMemories — nachtelijke geheugen-hygiëne.
 *
 * Het geheugen groeide vol met kleine, deels irrelevante fragmenten (één
 * notitie per chat-beurt, systeemstarts, losse acties). Deze functie
 * herbeoordeelt alle herinneringen ouder dan 24 uur, in blokken:
 *   - merges : verwante/bijna-dubbele fragmenten → één rijkere samenvatting
 *   - delete : ruis — systeemstatus, vluchtige acties, voorbijgaande zaken
 *   - keep   : blijvend relevante voorkeuren, feiten, mensen, plannen
 * Nieuwe samenvattingen krijgen een verse embedding, zodat de semantische
 * geheugen-zoektool (query_memory) blijft werken.
 * Trigger: workflow "Memory Consolidation" (dagelijks 23:00 Amsterdam).
 */
const CHUNK = 70;
const CUTOFF_MS = 24 * 3600000;
const VALID_CATEGORIES = ["User preferences", "People", "Projects", "Routines", "Important information", "Conversation-derived", "Insights"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const maxChunks = Math.min(Math.max(Number(body.max_chunks) || 8, 1), 8);
    const sr = base44.asServiceRole;
    const cutoff = new Date(Date.now() - CUTOFF_MS).toISOString();

    const all = await sr.entities.Memory.list("-created_date", 500).catch(() => []);
    const pool = (all || []).filter((m) => m.created_date && new Date(m.created_date).toISOString() < cutoff);
    if (!pool.length) return Response.json({ ok: true, skipped: "nothing_older_than_24h" });

    let mergedCreated = 0;
    let deletedCount = 0;
    let keptCount = 0;
    let chunksDone = 0;

    for (let i = 0; i < pool.length && chunksDone < maxChunks; i += CHUNK) {
      const chunk = pool.slice(i, i + CHUNK);
      chunksDone++;
      const validIds = new Set(chunk.map((m) => m.id));
      const listing = chunk
        .map((m, k) => `${k + 1}. [id=${m.id}] (${String(m.created_date).slice(0, 10)}) ${String(m.content).slice(0, 260)}`)
        .join("\n");

      const res = await geminiDecide({
        prompt:
          `Je beheert het geheugen van GIULIA OS, de assistent van Salvo. Hieronder staat een batch herinneringen (meest recente eerst). ` +
          `Beoordeel ELKE herinnering en verwerk elk id precies één keer:\n` +
          `- delete (delete_ids): RUIS — systeemstatus (opstarts, syncs, verwerkingen), losse acties van één moment (winkelen, wandelen, eten), voorbijgaande stemmingen, voorbije korte-termijn-afspraakjes, dubbele varianten van hetzelfde feit, alles wat over een week niemand meer interesseert.\n` +
          `- merge (merges): verwante of bijna-dubbele herinneringen over hetzelfde onderwerp, persoon of gebeurtenis → één vollediger geformuleerde samenvatting (behoud data en namen) bij de ids van de bronnen.\n` +
          `- keep (keep_ids): blijvend relevante voorkeuren, feiten, mensen, beslissingen, plannen en inzichten.\n` +
          `Wees kritisch: het doel is een klein, scherp geheugen — een twijfelgeval is verwijderen.\n\n` +
          `Herinneringen:\n"""\n${listing}\n"""\n\n` +
          `Antwoord UITSLUITEND als JSON: {"merges":[{"summary":"...","category":"User preferences|People|Projects|Routines|Important information|Conversation-derived|Insights","ids":["..."]}], "delete_ids":["..."], "keep_ids":["..."]}`,
        schema: {
          type: "object",
          properties: {
            merges: { type: "array", items: { type: "object", properties: { summary: { type: "string" }, category: { type: "string" }, ids: { type: "array", items: { type: "string" } } }, required: ["summary", "ids"] } },
            delete_ids: { type: "array", items: { type: "string" } },
            keep_ids: { type: "array", items: { type: "string" } },
          },
          required: ["merges", "delete_ids", "keep_ids"],
        },
        temperature: 0.2,
        keyName: "BACKDESK_GEMINI_API_KEY",
      }).catch(() => null);
      if (!res) continue;

      const handled = new Set();
      // 1) Samengevoegde herinneringen: eerst de nieuwe aanmaken, dan bronnen weg
      for (const g of res.merges || []) {
        const ids = (g.ids || []).filter((id) => validIds.has(id) && !handled.has(id));
        if (!ids.length || !g.summary) continue;
        const summary = String(g.summary).slice(0, 1500);
        const cat = VALID_CATEGORIES.includes(g.category) ? g.category : "Conversation-derived";
        const embedding = await geminiEmbed({ text: summary, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
        const created = await sr.entities.Memory.create({
          content: summary,
          category: cat,
          source: "consolidatie",
          confidence: 0.75,
          ...(embedding ? { embedding } : {}),
        }).catch(() => null);
        if (created) mergedCreated++;
        for (const id of ids) {
          handled.add(id);
          await sr.entities.Memory.delete(id).catch(() => null);
          deletedCount++;
        }
      }
      // 2) Ruis verwijderen
      for (const id of res.delete_ids || []) {
        if (!validIds.has(id) || handled.has(id)) continue;
        handled.add(id);
        await sr.entities.Memory.delete(id).catch(() => null);
        deletedCount++;
      }
      keptCount += (res.keep_ids || []).filter((id) => validIds.has(id)).length;
    }

    return Response.json({
      ok: true,
      considered: pool.length,
      chunks_done: chunksDone,
      merged_created: mergedCreated,
      deleted: deletedCount,
      kept: keptCount,
      more_pending: pool.length > chunksDone * CHUNK,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}