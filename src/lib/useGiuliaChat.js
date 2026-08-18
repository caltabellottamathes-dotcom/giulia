import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useGiuliaChat — de chat-aansluiting op GIULIA-GIULIA's eigen brein
 * (chatWithGiulia, BYOK Gemini — géén Base44-integrationcredits / InvokeLLM).
 * Eén gedeeld gesprek: laadt de recente in-app berichtdraad en stuurt nieuwe
 * berichten naar chatWithGiulia, die alle acties uitvoert (entity-CRUD,
 * navigatie via AgentNavigation, delegatie naar achtergrond-functies) en
 * blijft leren via geheugen. Giulia praat als Salvo's beste vriendin:
 * vlot, droog-sarcastisch, uitdagend, stout.
 */
const norm = (m) => ({
  id: m.id,
  role: m.role === "user" ? "user" : "assistant",
  content: m.content || "",
  tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
  attachments: Array.isArray(m.attachments) ? m.attachments : [],
});

export function useGiuliaChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Message.filter({ channel: "in-app" }, "-created_date", 60).catch(() => []);
        const ordered = (list || []).filter((m) => m.content).reverse();
        setMessages(ordered.map(norm));
      } catch { /* ignore */ }
      setReady(true);
    })();
  }, []);

  const send = useCallback(async (content, opts = {}) => {
    const text = (content || "").trim();
    if (!text || sending) return;
    const atts = Array.isArray(opts.attachments) ? opts.attachments : [];
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text, tool_calls: [], attachments: atts }]);
    setSending(true);
    try {
      const res = await base44.functions.invoke("chatWithGiulia", {
        message: text,
        source: "chat",
        file_urls: opts.file_urls || atts.map((a) => a.url),
        attachments: atts,
      });
      const reply = res?.response || "Giulia is even bezet — probeer het zo weer.";
      setMessages((prev) => [...prev, { id: `g-${Date.now()}`, role: "assistant", content: reply, tool_calls: res?.actions_executed || [], attachments: [] }]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: "Giulia is even bezet — probeer het zo weer.", tool_calls: [], attachments: [] }]);
    } finally {
      setSending(false);
    }
  }, [sending]);

  return { messages, send, sending, ready };
}

/**
 * askGiuliaOnce — één shot vraag aan hetzelfde BYOK-brein (chatWithGiulia),
 * gebruikt door widgets die een snelle antwoord nodig hebben.
 */
export async function askGiuliaOnce(content) {
  const text = (content || "").trim();
  if (!text) return null;
  try {
    const res = await base44.functions.invoke("chatWithGiulia", { message: text, source: "chat", persist: false });
    return res?.response || null;
  } catch {
    return null;
  }
}