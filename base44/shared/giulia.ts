/**
 * giulia.ts — shared helper for Giulia's proactive voice.
 * BYOK: direct Gemini REST call (no Base44 integration credits). Returns null
 * on failure so callers can fall back to a templated message.
 */
import { geminiChat } from "./gemini.ts";

export async function giuliaCompose(base44, task, context) {
  const prompt =
    `Taak: ${task}\n\nHuidige context:\n${context}\n\n` +
    `Schrijf het bericht aan Salvo. Toon: kalm, concreet, proactief, Nederlands. ` +
    `Houd berichten kort (max 3-4 zinnen), actiegericht, warm. Geen opsommingstekens tenzij echt nodig.`;
  return await geminiChat({ prompt });
}