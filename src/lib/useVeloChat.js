import { useEffect, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Velo · System — bestaande conversation met de Velo SuperAgent.
 * De Base44-agents-SDK kan via createConversation alleen op agent_name
 * (slug) adreseren, niet op ID. Velo's agent is alleen per ID bekend.
 * Daarom gebruiken we de reeds aangemaakte conversation direct via
 * getConversation / addMessage / subscribeToConversation (SDK, app-token).
 */
const CONV_ID = "6a6cc0034bc0607c481f1602";

export function useVeloChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const convRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        const conv = await base44.agents.getConversation(CONV_ID);
        convRef.current = conv;
        setMessages(conv.messages || []);
      } catch {
        /* negeer — widget toont lege staat */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    const unsub = base44.agents.subscribeToConversation(CONV_ID, (data) => {
      const msgs = data?.messages || [];
      setMessages(msgs);
      if (msgs.length && msgs[msgs.length - 1].role === "assistant") setSending(false);
    });
    return () => unsub();
  }, []);

  const send = useCallback(async (content, opts) => {
    if (!convRef.current || (!content && !(opts?.file_urls?.length))) return;
    setSending(true);
    try {
      await base44.agents.addMessage(convRef.current, {
        role: "user",
        content,
        file_urls: opts?.file_urls || [],
      });
    } catch (e) {
      setSending(false);
      throw e;
    }
  }, []);

  return { messages, send, sending, ready, conversationId: CONV_ID };
}