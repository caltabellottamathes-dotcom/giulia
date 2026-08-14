import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiChat } from '../../shared/gemini.ts';

/**
 * explainTask — read-only uitleg van één taak. GIULIA-GIULIA legt in menselijke
 * taal uit wat een onduidelijke taak inhoudt en welke volgende stap erbij hoort.
 * Geen tools, geen entity-schrijfacties, geen goedkeuringen — puur uitleg.
 * BYOK Gemini (geen integration credits).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, context, project_title } = body;
    if (!title) return Response.json({ error: "title required" }, { status: 400 });

    const prompt =
      `Leg in max 3 zinnen, in helder en menselijk Nederlands, uit wat deze taak inhoudt ` +
      `en welke concrete volgende stap erbij hoort. Geef alleen uitleg — voer niets uit.\n\n` +
      `Taak: "${title}".` +
      (description ? `\nBeschrijving: ${description}.` : "") +
      (context ? `\nContext: ${context}.` : "") +
      (project_title ? `\nGerelateerd project: ${project_title}.` : "");

    const text = await geminiChat({
      prompt,
      systemText: "Je bent Giulia. Je legt kort, concreet en menselijk uit wat een taak betekent. Geen acties, geen excuses, alleen uitleg.",
      temperature: 0.4,
      keyName: "GIULIA_GIULIA_CHAT_GEMINI_API_KEY",
    });

    return Response.json({ ok: true, explanation: text || "Geen uitleg beschikbaar." });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}