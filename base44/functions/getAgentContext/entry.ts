import { AGENT_CONTEXT, GIULIA_TONE } from '../../shared/agentContext.ts';

/**
 * getAgentContext — returns Giulia's full shared context about Salvo.
 * Every in-app agent MUST call this at initialization to load profile,
 * tone, trust model, input classification, proactivity/memory rules,
 * design system, architecture, connectors, voice, skills, workflows and
 * V1 boundaries. BYOK Gemini — no Base44 integration credits.
 */
export default async function () {
  return Response.json({
    ok: true,
    context: AGENT_CONTEXT,
    tone: GIULIA_TONE,
  });
}