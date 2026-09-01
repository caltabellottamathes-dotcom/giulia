import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { bumpRefresh } from "@/lib/refreshBus";

/**
 * useMattiaChat — Mattia chat via het platform agent-runtime (base44.agents,
 * agent "mattia"). De persona, context_files en memory komen rechtstreeks uit
 * mattia.jsonc — NIET uit de trage chatWithMattia + MATTIA_TONE-loop.
 * Token-streaming via subscribeToConversation ⇒ veel sneller antwoord.
 *
 * Eén persistente "Mattia"-conversatie (id in localStorage); historie wordt
 * door het platform bewaard (memory_config in mattia.jsonc).
 */
const AGENT_NAME = "mattia";
const STORAGE_KEY = "mattia_conversation_id";

const norm = (m) => ({
  id: m.id || `m-${Math.random().toString(36).slice(2)}`,
  role: m.role === "user" ? "user" : "assistant",
  content: m.content || "",
  tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
  attachments: Array.isArray(m.attachments) ? m.attachments : [],
});

export function useMattiaChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const convRef = useRef(null);
  const unsubRef = useRef(null);
  const pendingSendRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let conv = null;
        const savedId = localStorage.getItem(STORAGE_KEY);
        if (savedId) {
          try { conv = await base44.agents.getConversation(savedId); } catch { conv = null; }
        }
        if (!conv) {
          const list = await base44.agents.listConversations({ agent_name: AGENT_NAME }).catch(() => []);
          conv = (list && list[0]) || null;
        }
        if (!conv) {
          conv = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "Mattia", description: "Mattia chat" },
          });
        }
        if (cancelled) return;
        localStorage.setItem(STORAGE_KEY, conv.id);
        convRef.current = conv;
        setMessages((conv.messages || []).map(norm));

        unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
          const list = (data && data.messages) || [];
          setMessages(list.map(norm));
          const last = list[list.length - 1];
          if (last && last.role === "assistant" && last.content) {
            setSending(false);
          }
          bumpRefresh();
        });
      } catch { /* ignore */ }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      if (unsubRef.current) { try { unsubRef.current(); } catch { /* ignore */ } }
    };
  }, []);

  const send = useCallback(async (content, opts = {}) => {
    const text = (content || "").trim();
    const atts = Array.isArray(opts.attachments) ? opts.attachments : [];
    const file_urls = opts.file_urls || atts.map((a) => a.url);
    if (!text && !file_urls.length) return;
    if (!convRef.current || sending) return;
    pendingSendRef.current = true;
    setSending(true);
    try {
      await base44.agents.addMessage(convRef.current, {
        role: "user",
        content: text || "(bijlage)",
        ...(file_urls.length ? { file_urls } : {}),
      });
    } catch {
      setSending(false);
    }
    pendingSendRef.current = false;
  }, [sending]);

  return { messages, send, sending, ready };
}

/** askMattiaOnce — één-shot vraag aan Mattia (BYOK), voor widgets. */
export async function askMattiaOnce(content) {
  const text = (content || "").trim();
  if (!text) return null;
  try {
    const res = await base44.functions.invoke("chatWithMattia", { message: text, source: "chat", persist: false });
    return res?.response || null;
  } catch {
    return null;
  }
}