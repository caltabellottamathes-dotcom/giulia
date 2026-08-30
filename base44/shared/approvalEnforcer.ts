/**
 * approvalEnforcer.ts — na-loop controle tegen hallucinatie.
 *
 * Als een chat-agent (Giulia of Mattia) in zijn eindantwoord beweert een approval
 * of bericht-concept klaar te hebben gezet zónder create_approval aan te roepen,
 * dwingt deze module alsnog uitvoering af:
 *   1. her-aanzet het model met een expliciete instructie om NU create_approval
 *      aan te roepen;
 *   2. fallback: maak direct een Approval aan via createApproval() uit de
 *      bewering + context, zodat er altijd een echte pending Approval ontstaat.
 *
 * Mutert `executed` in place; retourneert { responseText, forced }.
 */
import { createApproval } from "./codeAgent.ts";
import { geminiGenerate } from "./gemini.ts";

const CLAIM_KEYWORDS = [
  "approval",
  "goedkeuring",
  "bij de approvals",
  "bij de goedkeuring",
  "concept klaar",
  "bericht klaar",
  "ik zet het klaar",
  "ik zet een concept",
  "klaargezet",
  "wacht op goedkeuring",
  "pending approval",
  "voorgesteld bericht",
];

export function claimsApprovalAction(text) {
  if (!text) return false;
  const t = String(text).toLowerCase();
  return CLAIM_KEYWORDS.some((k) => t.includes(k));
}

function hasCreateApprovalExecuted(executed) {
  return (executed || []).some(
    (e) => e.name === "create_approval" && e.ok && !(e.result && e.result && e.result.error)
  );
}

function inferType(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("email") || t.includes("mail") || t.includes("e-mail")) return "email";
  if (t.includes("kalender") || t.includes("agenda")) return "calendar";
  return "whatsapp";
}

function sanitizeResult(r) {
  if (r == null) return { ok: true };
  if (typeof r !== "object") return { value: String(r).slice(0, 500) };
  const out = {};
  try {
    for (const k of Object.keys(r)) {
      const v = r[k];
      if (v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[k] = typeof v === "string" ? v.slice(0, 300) : v;
      } else if (Array.isArray(v)) out[k] = `array[${v.length}]`;
      else if (typeof v === "object") out[k] = "[object]";
      if (Object.keys(out).length >= 12) break;
    }
  } catch { /* ignore */ }
  return out;
}

export async function enforceApprovalClaim({
  finalText, executed, contents, toolsMap, base44, keyName, systemInstruction,
}) {
  if (!claimsApprovalAction(finalText) || hasCreateApprovalExecuted(executed)) {
    return { responseText: finalText, forced: false };
  }

  // 1. Her-aanzet: instrueer het model om NU create_approval aan te roepen.
  try {
    const functionDeclarations = Object.entries(toolsMap).map(([name, t]) => ({
      name,
      description: t.description || "",
      parameters: t.inputSchema || { type: "object", properties: {} },
    }));
    const nudge =
      "Je beweerde zojuist een approval of bericht-concept klaar te hebben gezet, maar je hebt create_approval NIET aangeroepen. Dat mag niet — bewering zonder uitvoering is een leugen. Roep NU create_approval aan met de juiste parameters (type, category, title, content) op basis van wat je zojuist voorstelde. Geef daarna een korte bevestiging.";
    contents.push({ role: "user", parts: [{ text: nudge }] });
    const parts = await geminiGenerate({
      contents,
      tools: [{ functionDeclarations }],
      systemText: systemInstruction,
      keyName,
    });
    if (parts && parts.length) {
      contents.push({ role: "model", parts });
      const fnCalls = parts.filter((p) => p.functionCall);
      for (const p of fnCalls) {
        const name = p.functionCall.name;
        const args = p.functionCall.args || {};
        const t = toolsMap[name];
        let result;
        try { result = t ? await t.execute(args) : { error: "unknown tool" }; }
        catch (e) { result = { error: String((e && e.message) || e) }; }
        executed.push({ name, args, ok: !(result && result.error), result: sanitizeResult(result) });
      }
      if (!fnCalls.length) {
        const textPart = parts.find((p) => p.text);
        if (textPart && textPart.text) finalText = textPart.text;
      }
    }
  } catch { /* ignore — val door naar fallback */ }

  if (hasCreateApprovalExecuted(executed)) return { responseText: finalText, forced: true };

  // 2. Fallback: direct een Approval aanmaken uit de bewering + context.
  try {
    const type = inferType(finalText);
    const a = await createApproval(
      base44,
      type,
      "Concept bericht (auto-afgedwongen)",
      String(finalText || "").slice(0, 2000),
      "Auto-afgedwongen nadat de agent beweerde een approval klaar te zetten zonder create_approval aan te roepen.",
      "salvo",
      { category: "communication" }
    );
    if (a) {
      executed.push({
        name: "create_approval",
        args: { forced_fallback: true, type },
        ok: true,
        result: { id: a.id, forced_fallback: true },
      });
      return { responseText: finalText, forced: true };
    }
  } catch { /* ignore */ }

  return { responseText: finalText, forced: false };
}