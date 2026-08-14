import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiEmbed, cosineSimilarity } from '../../shared/gemini.ts';

/**
 * manageIdeas — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Stuurt open/oude ideeën als signaal naar GIULIA-CONNECT (chatWithGiulia);
 * GIULIA-GIULIA beslist of een idee actionable is (create_task) of moet blijven liggen.
 *
 * Domein 12 — Heractivering: archived ideeën met een embedding worden
 * vergeleken met recente inkomende berichten. Bij semantische match (>0.75)
 * gaat status terug naar 'exploring' en resurfaced_date wordt gezet, zodat
 * het idee opnieuw opduikt in plaats van dood te blijven liggen.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const ideas = await sr.entities.Idea.filter({ status: "new" }, "-created_date", 40).catch(() => []);

    // Heractivering van gearchiveerde ideeën
    const archived = await sr.entities.Idea.filter({ status: "archived" }, "-created_date", 100).catch(() => []);
    const withEmbedding = archived.filter((i) => Array.isArray(i.embedding) && i.embedding.length);
    let reactivated = 0;
    if (withEmbedding.length) {
      const recentMsgs = await sr.entities.Message.list("-created_date", 15).catch(() => []);
      const recentText = recentMsgs.map((m) => m.content).join(" ").slice(0, 2000);
      if (recentText) {
        const recentEmbedding = await geminiEmbed({ text: recentText, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
        if (recentEmbedding) {
          for (const idea of withEmbedding) {
            const score = cosineSimilarity(recentEmbedding, idea.embedding);
            if (score > 0.75) {
              await sr.entities.Idea.update(idea.id, { status: "exploring", resurfaced_date: new Date().toISOString() }).catch(() => null);
              reactivated++;
            }
          }
        }
      }
    }

    // Nieuwe ideeën zonder embedding krijgen er één (voor toekomstige heractivering).
    for (const idea of ideas) {
      if (!Array.isArray(idea.embedding) || !idea.embedding.length) {
        const emb = await geminiEmbed({ text: `${idea.title} ${idea.content || ""}`, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
        if (emb) await sr.entities.Idea.update(idea.id, { embedding: emb }).catch(() => null);
      }
    }

    if (!ideas.length) return Response.json({ ok: true, ideas: 0, reactivated, skipped: "geen nieuwe ideeën" });

    const context = `Nieuwe ideeën (${ideas.length}):\n` +
      ideas.map((i) => `- id:${i.id} | ${i.title} | ${i.category || ""}`).join("\n");
    const message = `Idee-scan: beoordeel welke ideeën direct actionable zijn — maak daarvoor een taak aan (create_task). Laat de rest liggen als idee.\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_ideas", persist: false }).catch(() => null);

    return Response.json({ ok: true, ideas: ideas.length, reactivated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}