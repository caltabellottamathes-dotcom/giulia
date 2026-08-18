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
    const cutoff = Date.now() - 4000; // voor recovery: accept giulia-antwoorden die ná nu zijn opgeslagen
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text, tool_calls: [], attachments: atts }]);
    setSending(true);

    // Snelste pad: wacht direct op chatWithGiulia (giulia_giulia-pool, 4 keys,
    // gemini-3.5-flash-lite). Werkt de invoke timeout (ChatWindow), dan
    // herstelt de poll hieronder het opgeslagen antwoord.
    let settled = false;
    try {
      const res = await base44.functions.invoke("chatWithGiulia", {
        message: text,
        source: "chat",
        file_urls: opts.file_urls || atts.map((a) => a.url),
        attachments: atts,
      });
      if (res?.response) {
        settled = true;
        setMessages((prev) => [...prev, { id: `g-${Date.now()}`, role: "assistant", content: res.response, tool_calls: res.actions_executed || [], attachments: [] }]);
      }
    } catch { /* invoke faalde — poll herstelt het opgeslagen antwoord */ }
    if (settled) { setSending(false); return; }

    // Recovery: pols de Message-entiteit tot Giulia's antwoord er staat.
    let n = 0;
    const tick = async () => {
      n++;
      try {
        const list = await base44.entities.Message.filter({ channel: "in-app" }, "-created_date", 8).catch(() => []);
        const fresh = (list || []).find((m) => m.role === "giulia" && new Date(m.created_date).getTime() >= cutoff);
        if (fresh) {
          setMessages((prev) => [...prev, { id: `g-${Date.now()}`, role: "assistant", content: fresh.content || "", tool_calls: Array.isArray(fresh.tool_calls) ? fresh.tool_calls : [], attachments: [] }]);
          setSending(false);
          return;
        }
      } catch { /* ignore */ }
      if (n < 40) {
        setTimeout(tick, 2500);
      } else {
        setSending(false);
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: "Giulia is even bezet — probeer het zo weer.", tool_calls: [], attachments: [] }]);
      }
    };
    setTimeout(tick, 2000);
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