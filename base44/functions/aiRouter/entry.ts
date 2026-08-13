/**
 * aiRouter function — het instellingenscherm praat via deze endpoint met de
 * aiRouter-module: status opvragen, AI_MODE wijzigen, tunnel-endpoint
 * instellen, en een testchat sturen (routeert écht via lokaal of Gemini).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import * as aiRouter from "../../shared/aiRouter.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";

    if (action === "status") {
      const status = await aiRouter.getStatus(base44);
      return Response.json(status);
    }

    if (action === "set_mode") {
      const rows = await base44.asServiceRole.entities.AISettings.list();
      if (rows?.length) await base44.asServiceRole.entities.AISettings.update(rows[0].id, { ai_mode: body.ai_mode });
      else await base44.asServiceRole.entities.AISettings.create({ ai_mode: body.ai_mode });
      const status = await aiRouter.getStatus(base44);
      return Response.json(status);
    }

    if (action === "set_tunnel") {
      const rows = await base44.asServiceRole.entities.AISettings.list();
      if (rows?.length) await base44.asServiceRole.entities.AISettings.update(rows[0].id, { local_tunnel_endpoint: body.local_tunnel_endpoint || "" });
      else await base44.asServiceRole.entities.AISettings.create({ local_tunnel_endpoint: body.local_tunnel_endpoint || "" });
      const status = await aiRouter.getStatus(base44);
      return Response.json(status);
    }

    if (action === "chat") {
      const result = await aiRouter.chat({
        messages: body.messages || [{ role: "user", content: body.prompt || "Zeg hallo in één zin." }],
        taskType: body.taskType || "default",
        base44,
      });
      return Response.json(result);
    }

    return Response.json({ error: "Onbekende action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}