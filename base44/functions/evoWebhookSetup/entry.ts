import { secrets } from "base44:runtime";

/**
 * evoWebhookSetup — controleert en stelt de Evolution API webhook in.
 *-query: GET  → retourneert huidige webhook-config.
 * -set:   POST → stelt webhook URL + events in.
 */
export default async function (req) {
  try {
    const apiUrlRaw = (secrets.get("EVO_API_URL") || "").split("](")[0].trim().replace(/\/+$/, "");
    const apiUrl = apiUrlRaw;
    const instance = secrets.get("EVO_INSTANCE") || "";
    const apiKey = secrets.get("EVO_API_KEY") || "";

    const body = await req.json().catch(() => ({}));
    const action = body.action || "query";

    if (action === "test") {
      // Roep de webhook-URL aan zoals Evolution dat doet
      const testPayload = {
        event: "messages.upsert",
        data: {
          key: { id: "SETUP_TEST_" + Date.now(), fromMe: false, remoteJid: "31600000000@s.whatsapp.net" },
          message: { conversation: "Setup test ping" },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      };
      const webhookUrl = body.webhook_url || "https://giulia-os-flow.base44.app/functions/evoWebhook";
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify(testPayload),
      });
      const text = await res.text();
      return Response.json({ status: res.status, body: text.slice(0, 300), url: webhookUrl });
    }

    if (action === "chats") {
      const res = await fetch(`${apiUrl}/chat/find/${instance}?limit=5`, {
        headers: { apikey: apiKey },
      });
      const data = await res.json().catch(() => null);
      return Response.json({ status: res.status, chats: data });
    }

    if (action === "restart") {
      const res = await fetch(`${apiUrl}/instance/restart/${instance}`, {
        method: "POST",
        headers: { apikey: apiKey },
      });
      const data = await res.json().catch(() => null);
      return Response.json({ status: res.status, restart: data });
    }

    if (action === "status") {
      const res = await fetch(`${apiUrl}/instance/connect/${instance}`, {
        headers: { apikey: apiKey },
      });
      const data = await res.json().catch(() => null);
      return Response.json({ status: res.status, connection: data });
    }

    if (action === "query") {
      const res = await fetch(`${apiUrl}/webhook/find/${instance}`, {
        headers: { apikey: apiKey },
      });
      const data = await res.json().catch(() => null);
      return Response.json({ status: res.status, webhooks: data });
    }

    if (action === "set") {
      const webhookUrl = body.webhook_url || body.url;
      if (!webhookUrl) return Response.json({ error: "webhook_url required" }, { status: 400 });

      // Evolution v2 /webhook/set/{instance} vereist een genest `webhook` object.
      const payload = {
        webhook: {
          url: webhookUrl,
          enabled: true,
          webhookByEvents: true,
          webhookBase64: false,
          events: [
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "CONNECTION_UPDATE",
            "QRCODE_UPDATED",
          ],
        },
      };
      const res = await fetch(`${apiUrl}/webhook/set/${instance}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      return Response.json({ status: res.status, result: data });
    }

    return Response.json({ error: "method not allowed" }, { status: 405 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}