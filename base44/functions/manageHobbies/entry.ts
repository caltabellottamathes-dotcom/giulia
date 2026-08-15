import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide } from '../../shared/gemini.ts';

/**
 * manageHobbies — LIFE → HOBBIES backend.
 *  - list / create / update / log_activity / link_project : hobby-CRUD
 *  - detect   : haal interesses uit tekst (Giulia-detectie via BYOK Gemini)
 *  - evaluate : herbereken activity_level voor alle hobby's
 * Alle AI via shared/gemini.ts (BYOK) — geen integration credits.
 */
const DAY = 86400000;

const INTEREST_SCHEMA = {
  type: "object",
  properties: {
    interests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["music", "creative", "cultural", "sport", "learning", "collecting", "other"] },
          confidence: { type: "number" },
          state: { type: "string", enum: ["active", "curious", "new", "saved", "experimenting"] },
          context: { type: "string" },
        },
      },
    },
  },
};

async function classifyInterests(text) {
  if (!text || !String(text).trim()) return [];
  const prompt =
    "Lees de tekst en haal er hobby's, creatieve bezigheden, culturele interesses en dingen die Salvo noemt of waarnaar hij nieuwsgierig is. " +
    "Geef per interesse: title (kort, EN), type, confidence (0..1), state en context.\n\nTekst:\n" +
    String(text).slice(0, 4000);
  const res = await geminiDecide({ prompt, schema: INTEREST_SCHEMA, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY", temperature: 0.25 }).catch(() => null);
  return (res && Array.isArray(res.interests)) ? res.interests : [];
}

async function evaluateHobbyStates(sr) {
  const hobbies = await sr.entities.Hobby.list("-last_activity_date").catch(() => []);
  const now = Date.now();
  const updates = [];
  for (const h of hobbies) {
    if (h.status === "inactive") continue;
    const ds = h.last_activity_date ? Math.floor((now - new Date(h.last_activity_date).getTime()) / DAY) : null;
    const disc = h.discovered_date ? Math.floor((now - new Date(h.discovered_date).getTime()) / DAY) : null;
    let level = h.activity_level || "active";
    if (disc != null && disc <= 7 && (ds == null || ds > 14)) level = "new";
    else if (ds == null) level = "quiet";
    else if (ds <= 14) level = "active";
    else level = "quiet";
    if (level !== h.activity_level) updates.push({ id: h.id, activity_level: level });
  }
  if (updates.length) await sr.entities.Hobby.bulkUpdate(updates).catch(() => {});
  return { evaluated: hobbies.length, updated: updates.length };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const input = (req && req.body && typeof req.body === "object" ? req.body : req) || {};
    const action = input.action;

    switch (action) {
      case "list":
        return await sr.entities.Hobby.list("-last_activity_date").catch(() => []);

      case "create": {
        if (!input.title) return { error: "title required" };
        const today = new Date().toISOString().slice(0, 10);
        const h = await sr.entities.Hobby.create({
          title: input.title,
          type: input.type || "creative",
          current_thread: input.current_thread,
          image: input.image,
          category: input.category,
          activity_level: input.discovered ? "new" : "active",
          discovered_date: input.discovered ? today : undefined,
          status: "active",
          agent_source: input.agent_source || "manageHobbies",
        }).catch(() => null);
        return h ? { id: h.id, title: h.title } : { error: "create failed" };
      }

      case "update": {
        if (!input.id) return { error: "id required" };
        const patch = { ...input };
        delete patch.action; delete patch.id;
        if (patch.activity_level === "archived") patch.status = "inactive";
        if (patch.status === "active" && !patch.activity_level) patch.activity_level = "active";
        const h = await sr.entities.Hobby.update(input.id, patch).catch(() => null);
        return h ? { ok: true } : { error: "not found" };
      }

      case "log_activity": {
        if (!input.hobby_id || !input.title) return { error: "hobby_id + title required" };
        const date = input.date || new Date().toISOString();
        const m = await sr.entities.HobbyMoment.create({
          title: input.title, hobby_id: input.hobby_id, activity: input.activity || "other",
          date, location: input.location, people: input.people, photo: input.photo,
          related_project_id: input.related_project_id, agent_source: "manageHobbies",
        }).catch(() => null);
        if (m) await sr.entities.Hobby.update(input.hobby_id, { last_activity_date: date, activity_level: "active" }).catch(() => null);
        return m ? { id: m.id } : { error: "create failed" };
      }

      case "link_project": {
        if (!input.id || !input.linked_project_id) return { error: "id + linked_project_id required" };
        const h = await sr.entities.Hobby.update(input.id, { linked_project_id: input.linked_project_id }).catch(() => null);
        return h ? { ok: true } : { error: "not found" };
      }

      case "detect":
        return { interests: await classifyInterests(input.text) };

      case "evaluate":
        return await evaluateHobbyStates(sr);

      default:
        return { error: "unknown action", actions: ["list", "create", "update", "log_activity", "link_project", "detect", "evaluate"] };
    }
  } catch (e) {
    return { error: String((e && e.message) || e) };
  }
}