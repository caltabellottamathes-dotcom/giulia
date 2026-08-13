import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * manageIdeas — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Stuurt open/oude ideeën als signaal naar GIULIA-CONNECT (chatWithGiulia);
 * GIULIA-GIULIA beslist of een idee actionable is (create_task) of moet blijven liggen.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const ideas = await sr.entities.Idea.filter({ status: "new" }, "-created_date", 40).catch(() => []);
    if (!ideas.length) return Response.json({ ok: true, ideas: 0, skipped: "geen nieuwe ideeën" });

    const context = `Nieuwe ideeën (${ideas.length}):\n` +
      ideas.map((i) => `- id:${i.id} | ${i.title} | ${i.category || ""}`).join("\n");
    const message = `Idee-scan: beoordeel welke ideeën direct actionable zijn — maak daarvoor een taak aan (create_task). Laat de rest liggen als idee.\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_ideas", persist: false }).catch(() => null);

    return Response.json({ ok: true, ideas: ideas.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}