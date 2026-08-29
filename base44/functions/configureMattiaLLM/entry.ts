/**
 * configureMattiaLLM
 *
 * Stelt de Mattia voice-agent (ElevenLabs) in met dezelfde rechten als Giulia:
 *   1. System-prompt = MATTIA_VOICE_PROMPT (identiteit + operationeel + STEM-MODUS).
 *   2. Client-tools = ELEVEN_TOOLS (volledig — navigatie + directe acties + delegate).
 *   3. Custom LLM = direct op Gemini's OpenAI-endpoint met de Mattia-sleutel.
 *      Acties lopen via de client-tools in de browser — geen proxy.
 *
 * De browser-side handlers staan in src/lib/voiceClientTools.js (buildVoiceClientTools).
 */
import { ELEVEN_TOOLS } from "../../shared/elevenTools.ts";
import { MATTIA_VOICE_PROMPT } from "../../shared/mattiaPrompt.ts";
import { ensureSecret, readBody, toJsonSchema } from "../../shared/elevenConfig.ts";

const AGENT_ID = "agent_0301m14xfjxhfnh86pd8m19mdgvb";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-3.5-flash-lite";

export default async function (req) {
  try {
    const xiKey = process.env.ELEVENLABS_API_KEY;
    if (!xiKey) return Response.json({ error: "ELEVENLABS_API_KEY niet ingesteld." }, { status: 400 });
    const geminiKey = process.env["MATTIA-MATTIA_Gemini_API_Key"];
    if (!geminiKey) return Response.json({ error: "MATTIA-MATTIA_Gemini_API_Key niet ingesteld." }, { status: 400 });

    const secretLocator = await ensureSecret(xiKey, "MATTIA_GEMINI_API_KEY", geminiKey);

    const getRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      headers: { "xi-api-key": xiKey },
    });
    if (!getRes.ok) {
      return Response.json({ error: `GET agent faalde (${getRes.status}): ${await readBody(getRes)}` }, { status: 502 });
    }
    const agent = await getRes.json();
    const cfg = agent.conversation_config || {};

    cfg.agent = cfg.agent || {};
    cfg.agent.prompt = cfg.agent.prompt || {};
    cfg.agent.prompt.prompt = MATTIA_VOICE_PROMPT;
    cfg.agent.prompt.llm = "custom-llm";
    cfg.agent.prompt.custom_llm = {
      url: GEMINI_ENDPOINT,
      model: GEMINI_MODEL,
      model_id: GEMINI_MODEL,
      api_key: secretLocator,
      api_type: "chat_completions",
      temperature: 0.7,
    };
    cfg.agent.prompt.tool_ids = [];
    cfg.agent.prompt.tools = ELEVEN_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      type: t.type || "client",
      parameters: toJsonSchema(t.params),
      expects_response: !!t.wait_for_response,
    }));

    const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: "PATCH",
      headers: { "xi-api-key": xiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_config: cfg }),
    });
    if (!patchRes.ok) {
      return Response.json({ error: `PATCH agent faalde (${patchRes.status}): ${await readBody(patchRes)}` }, { status: 502 });
    }

    let deletedOrphans = 0;
    try {
      const afterRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, { headers: { "xi-api-key": xiKey } });
      if (afterRes.ok) {
        const listRes = await fetch("https://api.elevenlabs.io/v1/convai/tools", { headers: { "xi-api-key": xiKey } });
        if (listRes.ok) {
          const lj = await listRes.json();
          const all = Array.isArray(lj) ? lj : (lj?.tools || lj?.data || []);
          for (const t of all) {
            if (t?.id) {
              await fetch(`https://api.elevenlabs.io/v1/convai/tools/${t.id}`, { method: "DELETE", headers: { "xi-api-key": xiKey } });
              deletedOrphans++;
            }
          }
        }
      }
    } catch {}

    return Response.json({
      ok: true,
      agent_id: AGENT_ID,
      llm: "custom-llm",
      model: GEMINI_MODEL,
      mode: "direct",
      endpoint: GEMINI_ENDPOINT,
      tools: ELEVEN_TOOLS.map((t) => t.name),
      prompt_chars: MATTIA_VOICE_PROMPT.length,
      orphan_tools_removed: deletedOrphans,
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}