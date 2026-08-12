import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiResearch } from '../../shared/gemini.ts';

/**
 * researchInsights — proactief onderzoek via de eigen Gemini-sleutel (Google
 * Search-grounding). Geen Base44 integration credits. Geeft 1 of meerdere
 * gestructureerde inzichten terug.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const topic = (body.topic || "").trim();
    const count = Math.max(1, Math.min(5, Number(body.count) || 3));

    const prompt = topic
      ? `Je bent Giulia, een proactieve AI voor een drukke professional. Onderzoek het onderwerp "${topic}" met actuele webcontext. Geef ${count} actionable inzichten (opportuniteit, risico of opvolging). Antwoord UITSLUITEND als één JSON-object: {"insights":[{"title":"","content":"","category":"Opportunity|Risk|Research|Suggestion|Follow-up|Trend","confidence":0.0}]}.`
      : `Je bent Giulia. Geef ${count} proactieve inzichten of suggesties voor vandaag voor een drukke professional. Antwoord UITSLUITEND als één JSON-object: {"insights":[{"title":"","content":"","category":"Opportunity|Risk|Research|Suggestion|Follow-up|Trend","confidence":0.0}]}.`;

    const res = await geminiResearch({
      prompt,
      systemText: "Je spreekt en denkt in het Nederlands. Wees concreet en beknopt.",
      temperature: 0.5,
    });

    const arr = Array.isArray(res?.insights) ? res.insights : [];
    return Response.json({ insights: arr });
  } catch (error) {
    return Response.json({ error: error.message, insights: [] }, { status: 500 });
  }
}