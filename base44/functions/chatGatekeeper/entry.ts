import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * chatGatekeeper — backdesk-chat uitgeschakeld.
 *
 * Salvo wil geen achtergrondstatusberichten in de chat met Giulia zien —
 * "niet bij elk klein ding dat ze gedaan heeft een bericht sturen". Alles
 * wat Giulia doet staat al op zijn plek en zichtbaar: de Activity-feed
 * ("I Do Process!"), de Approvals ("Waiting on You."), en de afzonderlijke
 * panels. De in-app chat is uitsluitend voor het echte gesprek met Giulia
 * (chatWithGiulia, source="chat"). Deze functie behoudt zijn interface voor
 * de bestaande workflow, maar post nooit meer een bericht.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    // context geldig houden; geen writes, geen chat-berichten.
    void base44.asServiceRole;
    return Response.json({ ok: true, skipped: "backdesk_chat_disabled" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}