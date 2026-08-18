import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useGiuliaChat — chat-aansluiting op GIULIA-GIULIA's eigen brein
 * (chatWithGiulia, BYOK Gemini — géén Base44-integrationcredits / InvokeLLM).
 *
 * chatWithGiulia is een multi-step Gemini-loop en kan 7–60s duren; de
 * frontend-invoke timeout vaak vóór de functie klaar is. Daarom wachten we
 * NIET synchroon op de response: we vuren de functie af en polsten de
 * Message-entiteit tot Giulia's antwoord is opgeslagen. Zo verschijnt het
 * antwoord zodra het klaar is — in zowel het ChatWindow als de /chat-pagina,
 * zonder "even bezet" tenzij er écht geen antwoord komt.
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
    const cutoff = Date.now() - 4000;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text, tool_calls: [], attachments: atts }]);
    setSending(true);

    let settled = false;

    // Poll de Message-entiteit direct — pakt Giulia's antwoord op zodra het
    // opgeslagen is, ongeacht of de invoke timeout of slaagt. Sneller dan
    // wachten op een timeout.
    const poll = async () => {
      for (let n = 0; n < 50 && !settled; n++) {
        await new Promise((r) => setTimeout(r, 1800));
        try {
          const list = await base44.entities.Message.filter({ channel: "in-app" }, "-created_date", 5).catch(() => []);
          const fresh = (list || []).find((m) => m.role === "giulia" && new Date(m.created_date).getTime() >= cutoff);
          if (fresh && !settled) {
            settled = true;
            setMessages((prev) => [...prev, { id: `g-${Date.now()}`, role: "assistant", content: fresh.content || "", tool_calls: Array.isArray(fresh.tool_calls) ? fresh.tool_calls : [], attachments: [] }]);
            setSending(false);
            return;
          }
        } catch { /* ignore */ }
      }
      if (!settled) {
        setSending(false);
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: "Giulia is even bezet — probeer het zo weer.", tool_calls: [], attachments: [] }]);
      }
    };
    setTimeout(poll, 1200);

    // Probeer ook directe invoke — als die sneller klaar is, gebruik die.
    try {
      const res = await base44.functions.invoke("chatWithGiulia", {
        message: text,
        source: "chat",
        file_urls: opts.file_urls || atts.map((a) => a.url),
        attachments: atts,
      });
      if (res?.response && !settled) {
        settled = true;
        setMessages((prev) => [...prev, { id: `g-${Date.now()}`, role: "assistant", content: res.response, tool_calls: res.actions_executed || [], attachments: [] }]);
        setSending(false);
      }
    } catch { /* invoke faalde — poll herstelt het opgeslagen antwoord */ }
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