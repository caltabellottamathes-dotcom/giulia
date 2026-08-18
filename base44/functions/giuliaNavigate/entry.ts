import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * giuliaNavigate — schrijf een AgentNavigation-record zodat de frontend
 * (useAgentNavigation) Salvo real-time door de app stuurt.
 *   route           → navigeer naar pagina
 *   params.panel    → open schuif-paneel (openModule)
 *   params.section  → scroll naar element-id
 *   params.element  → highlight element-id
 *   label           → korte toast-melding
 *
 * Aangeroepen door de giulia_assistant-agent (Agent SDK) om Salvo door de app
 * te navigeren tijdens het gesprek.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const route = String(body.route || "/");
    const params = body.params && typeof body.params === "object" ? body.params : {};
    const label = String(body.label || "");
    const nav = await base44.asServiceRole.entities.AgentNavigation.create({
      route,
      params,
      label,
      source: "giulia_assistant",
    }).catch(() => null);
    return Response.json({ ok: !!nav, route, params, label });
  } catch (e) {
    return Response.json({ error: String((e && e.message) || e) }, { status: 500 });
  }
}