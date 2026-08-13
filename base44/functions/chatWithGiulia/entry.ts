import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * chatWithGiulia — GIULIA-CONNECT. De in-app chat-entry (doorgeefluik).
 *
 * Naamgevingsconventie GIULIA OS:
 *   GIULIA-SYSTEM   = workspace Superagent (platform-beheer)
 *   GIULIA-GIULIA   = in-app agent (giulia_assistant) — het gezicht
 *   GIULIA-CORE     = giuliaLeader — het denkbrein (BYOK Gemini)
 *   GIULIA-CONNECT  = dit — chatWithGiulia — doorgeefluik van GIULIA-GIULIA naar GIULIA-CORE
 *
 * Persisteert Salvo's bericht en delegeert daarna naar GIULIA-CORE
 * (giuliaLeader) — DE enige agent die Gemini aanroept. Giulia interpreteert,
 * voert intern de acties uit (zonder tweede Gemini-loop) en antwoordt.
 * Dit houdt één absoluut brein over alle binnenkomende input.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const message = body.message || body.content || "";
    const persist = body.persist !== false;

    if (!message) return Response.json({ error: "No message provided" }, { status: 400 });

    // Persist Salvo's bericht
    if (persist) try {
      await base44.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent",
      });
    } catch { /* ignore */ }

    // Delegeer naar de enkele leider — giuliaLeader is het enige Gemini-brein.
    const res = await base44.functions.invoke("giuliaLeader", {
      signal: message,
      source: "chat",
      persist,
    }).catch((e) => ({ error: String((e && e.message) || e) }));

    if (res?.error) return Response.json({ error: res.error }, { status: 500 });

    return Response.json({
      response: res.response,
      tool_calls: res.tool_calls || [],
      conversation_id: body.conversation_id || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}