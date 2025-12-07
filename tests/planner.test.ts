import { describe, it, expect } from 'vitest';
import { MultiActionPlanSchema, PlanActionSchema } from '@/types/plan';

describe('MultiActionPlan Schema', () => {
  it('validates a correct plan structure', () => {
    const validPlan = {
      id: 'plan-123',
      name: 'Test Plan',
      description: 'A test multi-action plan',
      actions: [
        {
          id: 'action-1',
          name: 'First Action',
          description: 'Do something first',
          target: {
            type: 'mcp' as const,
            serverId: 'server-1',
          },
          parameters: { key: 'value' },
          order: 1,
        },
      ],
    };

    const result = MultiActionPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
  });

  it('rejects plan without required fields', () => {
    const invalidPlan = {
      id: 'plan-123',
      // missing name, description, actions
    };

    const result = MultiActionPlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });

  it('validates action with subagent target', () => {
    const subagentAction = {
      id: 'action-2',
      name: 'Spark Agent Task',
      description: 'Complex task for Spark Agent',
      target: {
        type: 'subagent' as const,
        agentId: 'spark-agent',
      },
      parameters: {
        prompt: 'Build a landing page',
        capabilities: ['code', 'aesthetics'],
      },
    };

    const result = PlanActionSchema.safeParse(subagentAction);
    expect(result.success).toBe(true);
  });
});
