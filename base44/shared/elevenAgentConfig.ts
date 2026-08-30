/**
 * elevenAgentConfig.ts — gedeelde helpers voor het configureren van een
 * ElevenLabs Conversational AI-agent met een custom Gemini LLM + client-tools.
 * Gebruikt door configureElevenLabsLLM (Giulia) en configureMattiaVoiceLLM.
 *
 * Plain module — geen Deno.serve. Exporteert alleen pure helpers.
 */

/** Leest een response-body veilig uit (geen throw bij non-JSON). */
export async function readBody(res) {
  try { return await res.text(); } catch { return ""; }
}

/** Zet platte params ({ key: { type, description, required } }) om naar een
 *  geldige JSON-Schema zoals ElevenLabs verwacht. */
export function toJsonSchema(flatParams) {
  if (!flatParams || typeof flatParams !== "object") return undefined;
  const entries = Object.entries(flatParams);
  if (entries.length === 0) return undefined;
  const properties = {};
  const required = [];
  for (const [key, val] of entries) {
    properties[key] = { type: val.type, description: val.description };
    if (val.required) required.push(key);
  }
  const schema = { type: "object", properties };
  if (required.length) schema.required = required;
  return schema;
}

/** Maakt (of vervangt) een ElevenLabs secret aan met de gegeven naam+waarde.
 *  Secrets kunnen niet in-place worden geüpdatet, dus een bestaande met
 *  dezelfde naam wordt eerst verwijderd. Geeft een locator { secret_id }. */
export async function ensureSecret(xiKey, name, value) {
  const listRes = await fetch("https://api.elevenlabs.io/v1/convai/secrets", { headers: { "xi-api-key": xiKey } });
  if (listRes.ok) {
    let list;
    try { list = await listRes.json(); } catch { list = null; }
    const items = Array.isArray(list) ? list : list?.secrets || list?.data || [];
    const found = items.find((s) => s?.name === name);
    if (found) {
      const oldId = found.id || found.secret_id;
      await fetch(`https://api.elevenlabs.io/v1/convai/secrets/${oldId}`, {
        method: "DELETE", headers: { "xi-api-key": xiKey },
      }).catch(() => null);
    }
  }
  const createRes = await fetch("https://api.elevenlabs.io/v1/convai/secrets", {
    method: "POST",
    headers: { "xi-api-key": xiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ name, value, type: "new" }),
  });
  if (!createRes.ok) throw new Error(`Secret aanmaken faalde (${createRes.status}): ${await readBody(createRes)}`);
  const created = await createRes.json().catch(() => ({}));
  return { secret_id: created.id || created.secret_id };
}

/** Verwijdert de ingebouwde `end_call` system-tool en stelt de agent-tools
 *  in op uitsluitend de gegeven client-tools. De end_call-tool laat het
 *  ultrakorte model anders na één antwoord zelf het gesprek beëindigen. */
export function applyClientTools(cfg, tools) {
  cfg.agent = cfg.agent || {};
  cfg.agent.prompt = cfg.agent.prompt || {};
  const prevTools = Array.isArray(cfg.agent.prompt.tools) ? cfg.agent.prompt.tools : [];
  const endCallIds = new Set(
    prevTools.filter((t) => t?.name === "end_call" || t?.type === "system").map((t) => t?.id).filter(Boolean)
  );
  cfg.agent.prompt.tool_ids = (Array.isArray(cfg.agent.prompt.tool_ids) ? cfg.agent.prompt.tool_ids : []).filter(
    (id) => !endCallIds.has(id)
  );
  cfg.agent.prompt.tools = tools.map((t) => ({
    name: t.name,
    description: t.description,
    type: t.type || "client",
    parameters: toJsonSchema(t.params),
    expects_response: !!t.wait_for_response,
  }));
}

/** Stelt de custom Gemini LLM in op de agent-config. */
export function applyCustomLLM(cfg, endpoint, model, secretLocator, temperature = 0.5) {
  cfg.agent = cfg.agent || {};
  cfg.agent.prompt = cfg.agent.prompt || {};
  cfg.agent.prompt.llm = "custom-llm";
  cfg.agent.prompt.custom_llm = {
    url: endpoint,
    model,
    model_id: model,
    api_key: secretLocator,
    api_type: "chat_completions",
    temperature,
  };
}

/** Stelt de system-prompt in op de agent-config. */
export function applySystemPrompt(cfg, systemPrompt) {
  cfg.agent = cfg.agent || {};
  cfg.agent.prompt = cfg.agent.prompt || {};
  cfg.agent.prompt.prompt = systemPrompt;
}

/** PATCH de conversation_config naar ElevenLabs. Geeft true bij succes. */
export async function patchAgent(xiKey, agentId, cfg) {
  const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: { "xi-api-key": xiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_config: cfg }),
  });
  if (!patchRes.ok) {
    throw new Error(`PATCH agent faalde (${patchRes.status}): ${await readBody(patchRes)}`);
  }
  return true;
}

/** Verwijdert managed tools die niet meer gerefereerd worden (voorkomt
 *  accumulatie van wees-tools bij elke herconfiguratie). Geeft het aantal
 *  verwijderde orphans terug. */
export async function cleanupOrphanTools(xiKey, agentId) {
  let deletedOrphans = 0;
  try {
    const afterRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, { headers: { "xi-api-key": xiKey } });
    if (!afterRes.ok) return 0;
    const afterAgent = await afterRes.json();
    const activeIds = new Set(afterAgent.conversation_config?.agent?.prompt?.tool_ids || []);
    const listRes = await fetch("https://api.elevenlabs.io/v1/convai/tools", { headers: { "xi-api-key": xiKey } });
    if (!listRes.ok) return 0;
    const lj = await listRes.json();
    const all = Array.isArray(lj) ? lj : (lj?.tools || lj?.data || []);
    for (const t of all) {
      if (t?.id && !activeIds.has(t.id)) {
        await fetch(`https://api.elevenlabs.io/v1/convai/tools/${t.id}`, { method: "DELETE", headers: { "xi-api-key": xiKey } });
        deletedOrphans++;
      }
    }
  } catch { /* ignore */ }
  return deletedOrphans;
}