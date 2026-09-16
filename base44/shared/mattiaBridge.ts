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
      prompt:
        `Je bent de geheugen-extractor van GIULIA OS. Beoordeel deze uitwisseling tussen Salvo en zijn alter-ego Mattia. ` +
        `Bewaar alléén wat over een WEEK nog relevant is voor Giulia: blijvende voorkeuren, belangrijke beslissingen, concrete toekomstige plannen, nieuwe feiten over mensen, of een significant levensmoment. ` +
        `NIET bewaren (ruis): losse acties van het moment (wandelen, boodschappen, winkels, eten), vluchtige stemmingen, grappen, systeemstatus, en alles wat al in agenda of taken staat. ` +
        `Geen seksuele/expliciete inhoud — gevoelsinhoud hooguit neutraal samengevat. ` +
        `Toets elke kandidaat met: "moet Giulia dit over een week nog weten?" — bij twijfel NIET bewaren. ` +
        `Uitwisseling:\n"""\n${convo}\n"""\n\n` +
        `Antwoord UITSLUITEND als JSON: {"worth_saving": true, "notes": ["korte puntzin"]} of {"worth_saving": false, "notes": []} als er niets blijvends in zit. Max 1-2 notities, alleen de belangrijkste.`,
      schema: {
        type: "object",
        properties: { worth_saving: { type: "boolean" }, notes: { type: "array", items: { type: "string" } } },
        required: ["worth_saving", "notes"],
      },
      keyName: "BACKDESK_GEMINI_API_KEY",
    });
    if (!res || !res.worth_saving || !Array.isArray(res.notes) || !res.notes.length) return { saved: 0 };

    const sr = base44.asServiceRole;
    // EEN herinnering per uitwisseling — de losse notities per beurt veroorzaakten
    // een vloed aan bijna-dubbele mini-fragmenten in het geheugen.
    const notes = res.notes.slice(0, 2).map((n) => String(n).trim()).filter(Boolean);
    if (!notes.length) return { saved: 0 };
    const content = `[Uit gesprek met Mattia] ${notes.join(" — ")}`.slice(0, 2000);
    const embedding = await geminiEmbed({ text: content, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
    const m = await sr.entities.Memory.create({
      content,
      category: "Conversation-derived",
      source: "mattia_bridge",
      confidence: 0.7,
      ...(embedding ? { embedding } : {}),
    }).catch(() => null);
    return { saved: m ? 1 : 0 };
  } catch {
    return { saved: 0 };
  }
}