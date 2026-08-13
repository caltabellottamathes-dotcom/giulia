import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';
import { geminiEmbed } from '../../shared/gemini.ts';

/**
 * GIULIA-CORE (giuliaLeader) - De Blinde Executie Engine.
 *
 * Dit script bevat NUL kunstmatige intelligentie. Geen LLM-calls, geen prompts.
 * Het ontvangt een gestructureerde `ExecutionPayload` array vanuit GIULIA-CONNECT,
 * mapt deze op `giuliaSkills.ts`, en voert ze direct uit op de database.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const actions = body.actions || [];
    const memory_updates = body.memory_updates || [];
    const sr = base44.asServiceRole;

    const results = [];

    // 1. Process Tool Actions
    for (const action of actions) {
      const toolName = action.name;
      const toolArgs = action.args || {};

      const skill = GIULIA_SKILLS.find(s => s.name === toolName);

      if (!skill) {
        results.push({ tool: toolName, status: "error", detail: "Unknown tool" });
        continue;
      }

      try {
        const res = await skill.execute(toolArgs, base44);

        // Log executions secretly if they change state
        if (!["os_query", "list_tasks", "report_to_salvo", "navigate"].includes(toolName) && res && !res.error) {
           await sr.entities.Activity.create({
             action: toolName,
             description: `[GIULIA-CORE] Executed: ${toolName}`,
             source: "GIULIA-CORE",
             timestamp: new Date().toISOString()
           }).catch(() => null);
        }

        results.push({ tool: toolName, status: "success", response: res });
      } catch (err) {
        results.push({ tool: toolName, status: "error", detail: String(err.message || err) });
      }
    }

    // 2. Process Memory Updates (met semantische embedding, luid falend)
    const memoryErrors = [];
    if (memory_updates && memory_updates.length > 0) {
      for (const mem of memory_updates) {
        if (!mem.content) continue;
        try {
          const embedding = await geminiEmbed({ text: String(mem.content).slice(0, 500), keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" });
          await sr.entities.Memory.create({
            content: String(mem.content).slice(0, 500),
            category: mem.category || "Conversation-derived",
            confidence: 0.9, // High confidence since it was an explicit payload
            source: "GIULIA-CORE",
            ...(embedding ? { embedding } : {})
          });
        } catch (e) {
          memoryErrors.push(String((e && e.message) || e));
        }
      }
    }

    // Memory pruning — houdt het geheugen beheersbaar boven de 200 records.
    let pruned = 0;
    try {
      const all = await sr.entities.Memory.list("-created_date", 300).catch(() => []);
      if (all.length > 200) {
        const excess = all.slice(200).filter((m) => m.category === "Conversation-derived");
        const ids = excess.map((m) => m.id).filter(Boolean);
        if (ids.length) {
          for (let i = 0; i < ids.length; i += 100) {
            await sr.entities.Memory.deleteMany({ id: { $in: ids.slice(i, i + 100) } }).catch(() => {});
          }
          pruned = ids.length;
        }
      }
    } catch { /* ignore */ }

    return Response.json({ ok: true, results, memory_errors: memoryErrors, memory_pruned: pruned });

  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}