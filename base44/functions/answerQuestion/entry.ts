import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';

/**
 * answerQuestion — verwerkt Salvo's antwoord op een WANTS TO KNOW-vraag.
 * Giulia begrijpt het antwoord, slaat op wat ze moet onthouden (create_memory),
 * werkt entiteiten bij indien nodig, stelt een actie voor (create_approval)
 * of maakt een opvolgvraag. Native Gemini function-calling loop op eigen
 * BYOK-sleutels. Sluit de vraag af (status=answered).
 */
const MAX_STEPS = 6;
const ALLOWED = [
  "create_memory", "update_project", "update_task", "update_contact",
  "update_hobby", "log_hobby_moment", "create_notification",
  "report_to_salvo", "create_giulia_question", "close_giulia_question",
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json();
    const { question_id, answer } = body;
    if (!question_id || !answer) return Response.json({ error: "question_id and answer required" }, { status: 400 });

    const q = await sr.entities.GiuliaQuestion.get(question_id).catch(() => null);
    if (!q) return Response.json({ error: "question not found" }, { status: 404 });

    const toolsMap = {};
    for (const s of GIULIA_SKILLS) {
      if (ALLOWED.includes(s.name)) {
        toolsMap[s.name] = { description: s.description, inputSchema: s.inputSchema, execute: (args) => s.execute(args, base44) };
      }
    }
    const functionDeclarations = Object.entries(toolsMap).map(([name, t]) => ({
      name,
      description: t.description || "",
      parameters: t.inputSchema || { type: "object", properties: {} },
    }));
    const tools = [{ functionDeclarations }];

    const systemInstruction = `${GIULIA_PERSONA}\n\nJe bent Giulia. Salvo heeft een vraag beantwoord uit je "WANTS TO KNOW"-laag. Verwerk het antwoord: begrijp het, sla op wat je moet onthouden (create_memory), werk entiteiten bij indien relevant (update_project/task/contact/hobby), of maak een opvolgvraag (create_giulia_question). Maximaal 2 tool-calls. Geef daarna een korte, menselijke reactie in het Nederlands (1-2 zinnen) die samenvat wat je ervan leerde.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `VRAAG:\n${q.title}\n\n${q.body || ""}\n\nCONTEXT: domain=${q.domain} | kind=${q.kind} | target=${q.target_type}/${q.target_ref || "-"} | priority=${q.priority}\n\nANTWOORD VAN SALVO:\n${String(answer).slice(0, 2000)}` }],
      },
    ];

    const executed = [];
    let responseText = null;
    for (let step = 0; step < MAX_STEPS; step++) {
      const parts = await geminiGenerate({ contents, tools, systemText: systemInstruction, keyName: "GIULIA_GIULIA_GEMINI_API_KEY" });
      if (!parts || !parts.length) break;
      contents.push({ role: "model", parts });
      const fnCalls = parts.filter((p) => p.functionCall);
      if (!fnCalls.length) {
        const textPart = parts.find((p) => p.text);
        responseText = textPart?.text || null;
        break;
      }
      const respParts = [];
      for (const p of fnCalls) {
        const name = p.functionCall.name;
        const args = p.functionCall.args || {};
        const t = toolsMap[name];
        let result;
        try { result = t ? await t.execute(args) : { error: "unknown tool" }; }
        catch (e) { result = { error: String((e && e.message) || e) }; }
        executed.push({ name, ok: !(result && result.error) });
        let safe;
        try { safe = JSON.parse(JSON.stringify(result)); } catch { safe = { value: String(result) }; }
        respParts.push({ functionResponse: { name, response: safe } });
      }
      contents.push({ role: "user", parts: respParts });
    }

    const followup = executed.some((e) => e.name === "create_giulia_question" && e.ok);
    await sr.entities.GiuliaQuestion.update(question_id, {
      status: "answered",
      answer: String(answer).slice(0, 2000),
      followup_created: followup,
    }).catch(() => null);

    return Response.json({ ok: true, response: responseText || "Begrepen.", actions: executed, followup_created: followup });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}