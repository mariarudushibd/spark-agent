import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from './config';
import { MultiActionPlanSchema } from '@/types/plan';

/**
 * Gemini 3 Multi-Action Planner
 * Generates structured action plans from natural language prompts
 */

export async function generatePlan(prompt: string) {
  const { object: plan } = await generateObject({
    model: models.planner,
    schema: MultiActionPlanSchema,
    prompt: `You are a task planning agent. Create a multi-action plan for the following request.
    
Break down the task into discrete, executable actions that can be performed by MCP servers or subagents.

Request: ${prompt}`,
  });

  return plan;
}

export async function refinePlan(
  plan: z.infer<typeof MultiActionPlanSchema>,
  feedback: string
) {
  const { object: refinedPlan } = await generateObject({
    model: models.planner,
    schema: MultiActionPlanSchema,
    prompt: `Refine this plan based on feedback.

Current Plan:
${JSON.stringify(plan, null, 2)}

Feedback: ${feedback}`,
  });

  return refinedPlan;
}
