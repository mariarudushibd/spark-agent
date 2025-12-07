import { z } from 'zod';

/**
 * Multi-Action Plan Schema
 * Defines the structure for Gemini 3 multi-action plans
 */

export const ActionTargetSchema = z.object({
  type: z.enum(['mcp', 'subagent']),
  serverId: z.string().optional(),
  agentId: z.string().optional(),
});

export const PlanActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  target: ActionTargetSchema,
  parameters: z.record(z.unknown()),
  order: z.number().optional(),
  dependsOn: z.array(z.string()).optional(),
});

export const MultiActionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actions: z.array(PlanActionSchema),
  metadata: z.record(z.unknown()).optional(),
});

// TypeScript types derived from Zod schemas
export type ActionTarget = z.infer<typeof ActionTargetSchema>;
export type PlanAction = z.infer<typeof PlanActionSchema>;
export type MultiActionPlan = z.infer<typeof MultiActionPlanSchema>;
