/**
 * insightHelper.ts — unified insight creation voor alle domeinen.
 *
 * Eén entrypoint: createInsight(base44, { domain, ... }). Routes automatisch
 * naar het juiste entity:
 *   - domain "self"  → SelfInsight (type/category uit SELF-enum, confidence 0-1)
 *   - focus/life/giulia → Insight   (content + category uit Insight-enum, confidence 0-100)
 *
 * Hierdoor hebben FOCUS/LIFE/GIULIA en SELF hetzelfde aanroep-patroon zonder
 * twee verschillende systemen in de call-sites. Dedup-check optioneel via
 * existingInsights + title.
 */
import { dedupeByTitle } from "./domainEngine.ts";

const SELF_TYPES = ["pattern", "balance", "capacity", "imbalance", "overload", "under_recovery", "behavior"];
const SELF_CATEGORIES = ["energy", "mood", "capacity", "routine", "rest", "personal_time", "social", "focus", "development"];
const INSIGHT_CATEGORIES = ["Opportunity", "Risk", "Research", "Suggestion", "Follow-up", "Trend", "Review"];

function mapCategory(selfCategory) {
  const m = {
    energy: "Suggestion", mood: "Suggestion", capacity: "Risk", routine: "Suggestion",
    rest: "Suggestion", personal_time: "Suggestion", social: "Suggestion",
    focus: "Suggestion", development: "Opportunity",
  };
  return m[selfCategory] || "Suggestion";
}

export async function createInsight(base44, opts) {
  const {
    domain, title, type, category, description, confidence = 0.6,
    source, period_start, period_end, project_id, existingInsights,
  } = opts;
  if (!title) return null;
  if (existingInsights && dedupeByTitle(existingInsights, title)) return { skipped: true };

  const sr = base44.asServiceRole;
  try {
    if (domain === "self") {
      return await sr.entities.SelfInsight.create({
        title,
        type: SELF_TYPES.includes(type) ? type : "pattern",
        category: SELF_CATEGORIES.includes(category) ? category : "capacity",
        description: description || "",
        status: "active",
        confidence,
        period_start, period_end,
        agent_source: source || "GIULIA-CORE",
      });
    }
    return await sr.entities.Insight.create({
      title,
      content: description || "",
      category: INSIGHT_CATEGORIES.includes(category) ? category : mapCategory(category),
      status: "new",
      confidence: Math.round(confidence * 100),
      source: source || "GIULIA-CORE",
      project_id,
    });
  } catch {
    return null;
  }
}

/** Lijst recente inzichten per domein (uniforme read-kant). */
export async function listInsights(base44, { domain, limit = 50 } = {}) {
  const sr = base44.asServiceRole;
  try {
    if (domain === "self") return await sr.entities.SelfInsight.list("-created_date", limit);
    return await sr.entities.Insight.list("-created_date", limit);
  } catch {
    return [];
  }
}