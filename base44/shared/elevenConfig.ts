/** elevenConfig.ts — gedeelde helpers voor de ElevenLabs voice-agent
 *  configuratie-functies (configureElevenLabsLLM, configureMattiaLLM).
 *  Geen Deno.serve — plain module, geïmporteerd door beide functions. */

export async function readBody(res) {
  try { return await res.text(); } catch { return ""; }
}

/** Zet platte params ({ key: { type, description, required } }) om naar een
 *  geldige JSON-Schema zoals ElevenLabs verwacht: { type:"object", properties, required }. */
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

/** Secrets kunnen niet in-place worden geüpdatet. Bestaand geheim met deze
 *  naam verwijderen en opnieuw aanmaken, zodat de waarde altijd fris en
 *  correct is (voorkomt een verouderde/wrong-key die de stem-agent stillegt). */
export async function ensureSecret(xiKey, name, value) {
  const listRes = await fetch("https://api.elevenlabs.io/v1/convai/secrets", {
    headers: { "xi-api-key": xiKey },
  });
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
  if (!createRes.ok) {
    throw new Error(`Secret aanmaken faalde (${createRes.status}): ${await readBody(createRes)}`);
  }
  const created = await createRes.json().catch(() => ({}));
  return { secret_id: created.id || created.secret_id };
}