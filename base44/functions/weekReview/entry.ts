import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide } from "../../shared/gemini.ts";

/**
 * weekReview (Phase 6 — Self-Learning Loop / Cognitive Review Engine).
 *
 * Evalueert wekelijks de output van GIULIA OS. Verzamelt data van de afgelopen
 * 7 dagen (voltooide + verschoven taken, geregistreerde tijd), stuurt deze naar
 * gemini-3.1-flash-lite (BYOK) voor patroonherkenning, schrijft nieuwe permanente
 * planningsregels weg in Memory en een wekelijkse samenvatting als Insight.
 * Daarna wordt de planningscyclus herstart (weeklyPlanning) zodat de nieuwe
 * kennis direct wordt toegepast op de komende week.
 *
 * Volledig BYOK (GEMINI_API_KEY) — geen Base44 integration credits.
 * Trigger: scheduled cron zondag 18:00 Europe/Amsterdam (workflow Week Review).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // ── STAP 1: Data Verzamelen (afgelopen 7 dagen) ────────────────────
    const today = new Date();
    const lastWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const startDateIso = lastWeek.toISOString();
    const endDateIso = today.toISOString();
    const startMs = new Date(startDateIso).getTime();
    const endMs = new Date(endDateIso).getTime();
    const inRange = (iso) => {
      if (!iso) return false;
      const t = new Date(iso).getTime();
      return t >= startMs && t < endMs;
    };

    const allTasks = await sr.entities.Task.list("-updated_date", 1000).catch(() => []);
    const completedTasks = allTasks.filter((t) => t.status === "completed" && inRange(t.updated_date));
    const delayedTasks = allTasks.filter(
      (t) => ["todo", "in_progress", "waiting"].includes(t.status) && t.deadline && new Date(t.deadline).getTime() < today.getTime()
    );

    const allTimeEntries = await sr.entities.TimeEntry.list("-created_date", 1000).catch(() => []);
    const timeEntries = allTimeEntries.filter((te) => inRange(te.created_date));

    const weeklyDataPayload = JSON.stringify({
      completed_tasks_count: completedTasks.length,
      delayed_tasks_count: delayedTasks.length,
      completed_tasks_details: completedTasks.map((t) => ({ title: t.title, priority: t.priority, estimated: t.estimated_duration })),
      delayed_tasks_details: delayedTasks.map((t) => ({ title: t.title, priority: t.priority, deadline: t.deadline })),
      time_entries: timeEntries.map((te) => ({ task_id: te.task_id, duration: te.duration_minutes })),
    });

    // ── STAP 2: Gemini Analyse (Patroonherkenning) ────────────────────
    const responseSchema = {
      type: "object",
      properties: {
        new_memories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["Routines", "Insights"] },
              content: { type: "string" },
              confidence: { type: "number" },
            },
            required: ["category", "content", "confidence"],
          },
        },
        weekly_insight: {
          type: "object",
          properties: { title: { type: "string" }, content: { type: "string" } },
          required: ["title", "content"],
        },
      },
      required: ["new_memories", "weekly_insight"],
    };

    const geminiPrompt = `You are the cognitive review engine for GIULIA OS. Analyze the following data from the past week.
Look for structural patterns (e.g., are tasks consistently taking longer than estimated? Are certain task types always delayed?).

Return ONLY a valid JSON object matching this schema:
{
  "new_memories": [
    {
      "category": "Routines" or "Insights",
      "content": "A permanent rule for future planning (e.g., 'Admin tasks currently require 30% more time than estimated. Add buffer.')",
      "confidence": number (1-100)
    }
  ],
  "weekly_insight": {
    "title": "String - Short title for the weekly review",
    "content": "String - A short, direct, objective summary of the week for the user. Do not induce guilt. Mention completed vs delayed, and briefly state the new rule you added to Memory."
  }
}

Weekly Data:
${weeklyDataPayload}`;

    const analysisResult = await geminiDecide({
      prompt: geminiPrompt,
      schema: responseSchema,
      model: "gemini-3.5-flash-lite",
      systemText: "You are the cognitive review engine for GIULIA OS. Analyze weekly productivity data and extract permanent planning rules. Output strict JSON only.",
      temperature: 0.4,
    });

    // ── STAP 3: Database Updates (Memory & Insight wegschrijven) ──────
    let memoriesCreated = 0;
    let insightCreated = false;

    if (analysisResult && Array.isArray(analysisResult.new_memories) && analysisResult.new_memories.length > 0) {
      for (const memory of analysisResult.new_memories) {
        await sr.entities.Memory.create({
          category: memory.category,
          content: memory.content,
          confidence: memory.confidence,
          source: "weekReview_gemini_engine",
        }).catch(() => null);
        memoriesCreated++;
      }
    }

    if (analysisResult && analysisResult.weekly_insight) {
      await sr.entities.Insight.create({
        title: analysisResult.weekly_insight.title,
        content: analysisResult.weekly_insight.content,
        category: "Review",
        status: "new",
        confidence: 100,
        source: "weekReview_gemini_engine",
      }).catch(() => null);
      insightCreated = true;
    }

    // ── STAP 4: Herstart de Planningscyclus ──────────────────────────
    let planningRes = null;
    try {
      const res = await base44.functions.invoke("weeklyPlanning", {});
      if (res && typeof res.json === "function") {
        planningRes = await res.json();
      } else {
        planningRes = res && typeof res === "object" && "data" in res ? res.data : res;
      }
      if (planningRes && typeof planningRes === "object") {
        planningRes = JSON.parse(JSON.stringify(planningRes));
      }
    } catch (e) {
      planningRes = { error: String(e?.message || e) };
    }

    return Response.json({
      ok: true,
      week_range: { start: startDateIso, end: endDateIso },
      completed_tasks: completedTasks.length,
      delayed_tasks: delayedTasks.length,
      time_entries: timeEntries.length,
      analysis_received: !!analysisResult,
      memories_created: memoriesCreated,
      insight_created: insightCreated,
      planning_restart: planningRes,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}