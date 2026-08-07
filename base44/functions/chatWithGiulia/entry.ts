import { secrets } from "base44:runtime";

/**
 * chatWithGiulia — bridge from the app (UI/skin) to the external Giulia
 * Superagent (ID 6a6cc0011ab9e3b32cfc1057). The app is the skin; Giulia is the
 * brain. All app→Giulia traffic flows through this function.
 */
const AGENT_ID = "6a6cc0011ab9e3b32cfc1057";
const DEFAULT_CONVERSATION = "6a6cc0034bc0607c481f1602";
const BASE_URL = "https://app.base44.com/api/agents";

export default async function (req) {
  try {
    const body = await req.json();
    const message = body.message || body.content || "";
    const conversationId = body.conversation_id || DEFAULT_CONVERSATION;

    if (!message) {
      return Response.json({ error: "No message provided" }, { status: 400 });
    }

    const apiKey = secrets.get("BASE44_SERVICE_TOKEN");
    if (!apiKey) {
      return Response.json(
        { error: "BASE44_SERVICE_TOKEN not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${BASE_URL}/${AGENT_ID}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          api_key: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `API error: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json({
      response: data.content || "",
      conversation_id: conversationId,
      message_id: data.id || null,
      credits_charged: data.usage?.credits_charged || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}