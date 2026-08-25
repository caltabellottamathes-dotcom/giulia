import { useEffect, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const AGENT_NAME = "velo";
const CONV_KEY = "velo_conversation_id";

/**
 * useVeloChat — beheert één gesprek met de Velo-system-agent. De
 * conversation-id wordt in sessionStorage bewaard zodat de widget en het
 * module-paneel dezelfde draad delen. Verzendt via base44.agents.addMessage;
 * de live update komt binnen via subscribeToConversation.
 */
export function useVeloChat() {
  const [conversationId, setConversationId] = useState(null);
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
        let conv = null;
        const cid = sessionStorage.getItem(CONV_KEY);
        if (cid) {
          try { conv = await base44.agents.getConversation(cid); } catch { conv = null; }
        }
        if (!conv) {
          conv = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "Velo · System", description: "Systeem & ontwerp chat met Velo" },
          });
        }
        convRef.current = conv;
        sessionStorage.setItem(CONV_KEY, conv.id);
        setConversationId(conv.id);
        setMessages(conv.messages || []);
      } catch {
        /* negeer — widget toont lege staat */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.agents.subscribeToConversation(conversationId, (data) => {
      const msgs = data?.messages || [];
      setMessages(msgs);
      if (msgs.length && msgs[msgs.length - 1].role === "assistant") setSending(false);
    });
    return () => unsub();
  }, [conversationId]);

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

  return { messages, send, sending, ready, conversationId };
}