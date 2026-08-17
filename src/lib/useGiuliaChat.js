import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useGiuliaChat — de enige chat-aansluiting op de giulia_assistant-agent.
 * Eén gedeeld, persistent gesprek (singleton) dat door zowel de /chat-pagina
 * als het globale ChatWindow-panel wordt gebruikt. Vervangt chatWithGiulia
 * als chat-luik: de agent praat rechtstreeks met Salvo en stuurt CORE aan via
 * haar entity-tools + backend-functies.
 *
 * De agent verwerkt asynchroon; subscribeToConversation streamt elke token.
 */
const AGENT = "giulia_assistant";
let _convPromise = null;

async function ensureConversation() {
  if (!_convPromise) {
    _convPromise = (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT });
        if (list && list.length) return list[0];
      } catch { /* ignore */ }
      return base44.agents.createConversation({ agent_name: AGENT, metadata: { name: "Giulia" } });
    })();
  }
  return _convPromise;
}

const norm = (m) => ({
  id: m.id,
  role: m.role === "user" ? "user" : "assistant",
  content: m.content || "",
  tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
  attachments: Array.isArray(m.attachments) ? m.attachments : [],
});

export function useGiuliaChat() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const conv = await ensureConversation();
      if (!alive) return;
      setConversationId(conv.id);
      const full = await base44.agents.getConversation(conv.id).catch(() => conv);
      if (!alive) return;
      setMessages((full?.messages || []).map(norm));
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    try {
      unsubRef.current = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages((data?.messages || []).map(norm));
      });
    } catch { /* ignore */ }
    return () => { try { unsubRef.current?.(); } catch { /* ignore */ } };
  }, [conversationId]);

  const send = useCallback(async (content, opts = {}) => {
    const text = (content || "").trim();
    if (!text) return;
    const conv = await ensureConversation();
    const atts = Array.isArray(opts.attachments) ? opts.attachments : [];
    setMessages((prev) => [...prev, { id: `pending-${Date.now()}`, role: "user", content: text, tool_calls: [], attachments: atts }]);
    setSending(true);
    try {
      await base44.agents.addMessage(conv, {
        role: "user",
        content: text,
        ...(opts.file_urls && opts.file_urls.length ? { file_urls: opts.file_urls } : {}),
      });
    } finally {
      setSending(false);
    }
  }, []);

  return { messages, send, sending, ready, conversationId };
}