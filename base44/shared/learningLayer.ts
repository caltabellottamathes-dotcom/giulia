/**
 * learningLayer.ts — DE ene learning/sync-laag voor het hele GIULIA OS.
 *
 * Elke schrijfactie in het OS (LIFE of FOCUS, chat of automatie) loopt hier
 * doorheen: activity-log, geheugen en Wants-to-Know vragen. Hierdoor delen
 * alle widgets, panelen en pagina's dezelfde bron en "leren" ze continu —
 * de frontend abonneert zich via useLearningSync op de Activity-feed en
 * ververst zodra er ergens in het systeem iets verandert.
 *
 * Giulia-Giulia (brein) en Giulia-CORE (executor) gebruiken dezelfde laag;
 * LIFE-modules (Household, Personal Admin, Hobbies, Social) en FOCUS-modules
 * (Tasks, Projects, People, Agenda) volgen daardoor dezelfde regels.
 */
import { geminiEmbed } from "./gemini.ts";
import { reportToSalvo } from "./codeAgent.ts";

export const LEARNING_DOMAINS = ["focus", "life", "self"];

/** logActivity — de ene bron voor "er is iets veranderd". Elke aanroep
 *  schrijft één Activity-record waarop useLearningSync abonneert. */
export async function logActivity(base44, source, message, meta) {
  if (!message) return null;
  const m = meta || {};
  return reportToSalvo(base44, source || "GIULIA-CORE", message, m.threadId)
    .then((a) => a)
    .catch(() => null);
}

/** remember — geheugen opslaan met embedding (één entry-point, LIFE+FOCUS). */
export async function remember(base44, { content, category, source }) {
  if (!content) return null;
  const sr = base44.asServiceRole;
  const embedding = await geminiEmbed({ text: content, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
  return sr.entities.Memory.create({
    content: String(content).slice(0, 2000),
    category: category || "Conversation-derived",
    ...(embedding ? { embedding } : {}),
    agent_source: source || "GIULIA-CORE",
  }).catch(() => null);
}

/** askQuestion — Wants-to-Know vraag aanmaken (één entry-point). */
export async function askQuestion(base44, { title, body, kind, domain, priority, options, target_type, target_ref, source, confidence }) {
  return base44.asServiceRole.entities.GiuliaQuestion.create({
    title: String(title).slice(0, 140),
    body: String(body || "").slice(0, 800),
    kind: kind || "fill_the_gap",
    domain: domain || "projects",
    priority: priority || "useful",
    options: Array.isArray(options) ? options.slice(0, 4) : [],
    target_type: target_type || "general",
    target_ref: target_ref || "",
    status: "open",
    confidence: typeof confidence === "number" ? confidence : 0.6,
    agent_source: source || "GIULIA-CORE",
  }).catch(() => null);
}

/** touchDomain — werk een LIFE of FOCUS item bij én log activity (één laag).
 *  Wrapper voor sr.entities[X].update + logActivity, zodat elke update een
 *  sync-signaal afgeeft voor geabonneerde widgets/panelen. */
export async function touchDomain(base44, entityName, id, patch, source, activityMsg) {
  const sr = base44.asServiceRole;
  const updated = await sr.entities[entityName].update(id, patch).catch(() => null);
  if (activityMsg) await logActivity(base44, source, activityMsg, { action: "update" });
  return updated;
}