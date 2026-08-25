import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";

/**
 * veloChat — proxy naar de Velo SuperAgent (leeft in een andere Base44-app,
 * dus de app-scoped agents-SDK kan er niet bij). We benaderen de
 * account-level REST API met de VELO_API_KEY. De conversation (VELO_CONV_ID)
 * dient als de SYSTEM-chatdraad.
 *
 *   GET  /api/agents/{agent_id}/conversations/{conv_id}        → { messages: [...] }
 *   POST /api/agents/{agent_id}/conversations/{conv_id}/messages  → voegt bericht toe
 *
 * - content == ""  → alleen huidige messages laden (init).
 * - content != ""   → user-bericht versturen + pollen tot de assistant-reply erbij staat.
 */
const API_BASE = "https://app.base44.com/api/agents";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = secrets.get("VELO_API_KEY");
    const agentId = secrets.get("VELO_AGENT_ID");
    const convId = secrets.get("VELO_CONV_ID");
    if (!apiKey || !agentId || !convId) {
      return Response.json({ error: "missing_secrets" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const content = String(body?.content || "").trim();

    const getMessages = async () => {
      const res = await fetch(`${API_BASE}/${agentId}/conversations/${convId}`, {
        headers: { api_key: apiKey },
      });
      if (!res.ok) throw new Error(`get_conv_${res.status}`);
      const conv = await res.json();
      return Array.isArray(conv?.messages) ? conv.messages : [];
    };

    if (!content) {
      return Response.json({ messages: (await getMessages()).slice(-50) });
    }

    const before = await getMessages();
    const sendRes = await fetch(`${API_BASE}/${agentId}/conversations/${convId}/messages`, {
      method: "POST",
      headers: { api_key: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content }),
    });
    if (!sendRes.ok) {
      const details = await sendRes.text().catch(() => "");
      return Response.json({ error: "send_failed", details }, { status: 502 });
    }

    // Poll tot de nieuwe assistant-reply erbij staat (user + assistant = +2).
    let messages = before;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        messages = await getMessages();
      } catch {
        continue;
      }
      const last = messages[messages.length - 1];
      if (messages.length >= before.length + 2 && last?.role === "assistant") break;
    }
    return Response.json({ messages: messages.slice(-50) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}