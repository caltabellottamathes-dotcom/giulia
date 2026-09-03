import { geminiDecide, geminiEmbed } from "./gemini.ts";

/**
 * mattiaBridge.ts — de brug tussen Mattia en Giulia.
 *
 * shareMattiaHighlights: na elke Mattia-conversatie worden blijvende,
 * voor Giulia relevante momenten (plannen, beslissingen, mensen, gevoelens)
 * geëxtraheerd en opgeslagen in Giulia's gedeelde geheugen — zodat Giulia
 * weet wat er in de gesprekken met Mattia speelt (semantic memory + context).
 * Wordt AWAITED door chatWithMattia: een fire-and-forget-aanroep wordt
 * afgebroken zodra het chat-antwoord terugkeert.
 */
export async function shareMattiaHighlights(base44, { userText, mattiaText }) {
  try {
    const convo = `Salvo: ${String(userText || "").slice(0, 2000)}\nMattia: ${String(mattiaText || "").slice(0, 2000)}`;
    if (convo.trim().length < 20) return { saved: 0 };

    const res = await geminiDecide({
      model: "gemini-3.1-flash-lite",
      prompt:
        `Je bent een geheugen-extractor voor GIULIA OS. Analyseer deze uitwisseling tussen Salvo en zijn alter-ego Mattia. ` +
        `Haal ALLEEN blijvende, voor Giulia relevante informatie eruit: plannen/afspraken, beslissingen, nieuwe feiten of voorkeuren, genoemde mensen, en belangrijke gevoelens of moeilijke momenten (neutraal geformuleerd). ` +
        `Bewaar GEEN vluchtige grappen en GEEN seksuele/expliciete inhoud — gevoelsinhoud hooguit neutraal samengevat (bv. "Ontspannen moment met Mattia"). ` +
        `Uitwisseling:\n"""\n${convo}\n"""\n\n` +
        `Antwoord UITSLUITEND als JSON: {"worth_saving": true, "notes": ["korte puntzin", "..."]} of {"worth_saving": false, "notes": []} als er niets blijvends in zit.`,
      schema: {
        type: "object",
        properties: { worth_saving: { type: "boolean" }, notes: { type: "array", items: { type: "string" } } },
        required: ["worth_saving", "notes"],
      },
      keyName: "BACKDESK_GEMINI_API_KEY",
    });
    if (!res || !res.worth_saving || !Array.isArray(res.notes) || !res.notes.length) return { saved: 0 };

    const sr = base44.asServiceRole;
    let saved = 0;
    for (const note of res.notes.slice(0, 3)) {
      const text = String(note).trim();
      if (!text) continue;
      const content = `[Uit gesprek met Mattia] ${text}`.slice(0, 2000);
      const embedding = await geminiEmbed({ text: content, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
      const m = await sr.entities.Memory.create({
        content,
        category: "Conversation-derived",
        source: "mattia_bridge",
        confidence: 0.7,
        ...(embedding ? { embedding } : {}),
      }).catch(() => null);
      if (m) saved++;
    }
    return { saved };
  } catch {
    return { saved: 0 };
  }
}