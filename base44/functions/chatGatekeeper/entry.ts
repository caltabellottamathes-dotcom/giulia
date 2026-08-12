import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * chatGatekeeper — de enige agent die bepaalt wat in de chat van Salvo
 * verschijnt. Alle andere agents loggen naar de Activity-feed (widgets &
 * panelen). Deze agent bekijkt recente activiteit + inkomende berichten en
 * stuurt ALLEEN een chat-bericht als er iets écht belangrijks is of een
 * echt gesprek. Geen routine, geen statusrapportages.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Cursor: timestamp van de laatste Activity die we bekeken
    const cursor = await sr.entities.Memory.filter({ source: "chatGatekeeper_cursor" }).catch(() => []);
    let since = null;
    if (cursor.length) { try { since = new Date(cursor[0].content); } catch {} }

    const all = await sr.entities.Activity.list("-created_date", 60).catch(() => []);
    const recent = since ? all.filter((a) => new Date(a.created_date) > since) : all.slice(0, 20);
    if (!recent.length) return Response.json({ ok: true, skipped: "no activity" });

    const tools = {
      list_activity: tool({
        description: "Recente agent-activiteit sinds de laatste run.",
        inputSchema: { type: "object", properties: {} },
        execute: () => recent.map((a) => ({ source: a.source, description: a.description, when: a.created_date })),
      }),
      list_incoming: tool({
        description: "Recente inkomende berichten (email/whatsapp) die mogelijk een gesprek vereisen.",
        inputSchema: { type: "object", properties: {} },
        execute: () => sr.entities.Message.filter({ direction: "incoming" }, "-created_date", 6).catch(() => []).then((l) => l.map((m) => ({ channel: m.channel, content: m.content }))),
      }),
      send_chat: tool({
        description: "Stuur ECHT een chat-bericht aan Salvo (in-app). ALLEEN voor belangrijke info of een echt gesprek. Niet voor routine.",
        inputSchema: { type: "object", properties: { message: { type: "string" } }, required: ["message"] },
        execute: ({ message }) => sr.entities.Message.create({
          role: "giulia", content: message, channel: "in-app", status: "sent",
          direction: "outgoing", agent_source: "chatGatekeeper",
        }).catch(() => null),
      }),
    };

    const task =
      "Je bent de chat-gatekeeper van Giulia. Salvo krijgt veel te veel chat-berichten en wil daar alleen écht belangrijke informatie of echte gesprekken zien. " +
      "Bekijk de recente agent-activiteit (list_activity) en inkomende berichten (list_incoming). " +
      "Stuur ALLEEN een chat-bericht (send_chat) als er iets is dat Salvo NU moet weten: een dringende aandacht, een echte vraag die hij moet beantwoorden, een belangrijke beslissing, of een binnenkomend bericht dat een gesprek vereist. " +
      "Stuur GEEN routine-rapportages, geen 'ik heb X gedaan', geen statusupdates. Als er niets belangrijks is, stuur dan helemaal niets. " +
      "BELANGRIJK: als je taken of goedkeuringen noemt, maak dit ALTIJD klikbaar met een Markdown-link naar de juiste pagina — bv. '[2 taken](/tasks)' of '[3 goedkeuringen](/approvals)'. Nooit een aantal noemen zonder link. " +
      "Maximaal één kort, concreet bericht in Heldere Nederlandse zinnen.";

    await runGiuliaAgent(base44, "chatGatekeeper", task, tools, 5);

    // Cursor verschuiven naar nu
    const nowIso = new Date().toISOString();
    if (cursor.length) {
      await sr.entities.Memory.update(cursor[0].id, { content: nowIso }).catch(() => {});
    } else {
      await sr.entities.Memory.create({ content: nowIso, source: "chatGatekeeper_cursor", category: "Conversation-derived" }).catch(() => {});
    }

    return Response.json({ ok: true, reviewed: recent.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}