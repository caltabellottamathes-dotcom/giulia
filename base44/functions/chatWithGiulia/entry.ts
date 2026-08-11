import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide } from "../../shared/gemini.ts";

/**
 * chatWithGiulia — the app→Giulia chat bridge, now on BYOK Gemini (no Base44
 * AI credits / Superagent). Persists the user's message and Giulia's reply to
 * the Message entity. Gemini returns a structured object (intent, action,
 * person, deadline, giulia_response) via response_schema; the response is
 * inserted into collections (reply as Message; action+deadline as a Task).
 */
const CHAT_SCHEMA = {
  type: "object",
  properties: {
    intent: { type: "string", description: "Wat Salvo wil (korte label, bijv. 'taak aanmaken', 'vraag', 'afspraak', 'update')." },
    action: { type: "string", description: "Concrete actie/taak die voortkomt uit het bericht, of leeg." },
    person: { type: "string", description: "Naam van betrokken persoon, of leeg." },
    deadline: { type: "string", description: "ISO datum yyyy-mm-dd als genoemd, of leeg." },
    giulia_response: { type: "string", description: "Giulia's antwoord aan Salvo in zijn stijl (Nederlands, kort, concreet)." },
  },
  required: ["intent", "giulia_response"],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const body = await req.json();
    const message = body.message || body.content || "";
    const persist = body.persist !== false;

    if (!message) {
      return Response.json({ error: "No message provided" }, { status: 400 });
    }

    // Persist the user's message (best-effort)
    if (persist) try {
      await base44.entities.Message.create({
        role: "user",
        content: message,
        channel: "in-app",
        status: "sent",
      });
    } catch (e) { /* ignore persistence errors */ }

    const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const contextLine = `Context: vandaag is ${today}.${user?.full_name ? ` Je spreekt met ${user.full_name}.` : ""}`;
    const prompt = `${contextLine}\n\nBericht van Salvo: "${message}"\n\nBegrijp het bericht. Bepaal intent, eventuele action, betrokken person en deadline. Schrijf giulia_response als Giulia's antwoord.`;

    const result = await geminiDecide({
      prompt,
      schema: CHAT_SCHEMA,
      systemText: "Je spreekt met Salvo (Salvatore Caltabellotta). Antwoord in helder Nederlands, kort en concreet.",
    });
    const reply = result?.giulia_response || "Ik kon dat even niet verwerken — probeer het opnieuw.";

    // Persist Giulia's reply (best-effort)
    if (persist) try {
      await base44.entities.Message.create({
        role: "giulia",
        content: reply,
        channel: "in-app",
        status: "sent",
      });
    } catch (e) { /* ignore */ }

    // Insert the structured extraction into collections (light-touch)
    if (result && persist && result.action && String(result.action).trim()) {
      try {
        let contact_id = "";
        if (result.person) {
          const contacts = await base44.entities.Contact.list().catch(() => []);
          const found = contacts.find((c) => (c.name || "").toLowerCase().includes(String(result.person).toLowerCase()));
          if (found) contact_id = found.id;
        }
        await base44.entities.Task.create({
          title: String(result.action).slice(0, 200),
          deadline: result.deadline || undefined,
          contact_id: contact_id || undefined,
          status: "today",
          agent_source: "chatWithGiulia",
        });
      } catch (e) { /* ignore */ }
    }

    return Response.json({
      response: reply,
      structured: result,
      conversation_id: body.conversation_id || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}