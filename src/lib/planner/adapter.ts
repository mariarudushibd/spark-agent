import type { MultiActionPlan, PlanAction } from '@/types/plan';
import type { MCPAction } from '@/types/mcp';
import type { Task } from '@/types/task';
import { mcpClient } from '@/lib/mcp/client';
import { taskManager } from '@/lib/tasks/lifecycle';

/**
 * Planner Adapter
 * Serializes multi-action plans into MCP-compatible messages
 * and coordinates task execution
 */

export class PlannerAdapter {
  /**
   * Convert a plan action to an MCP action
   */
  private toMCPAction(action: PlanAction): MCPAction {
    return {
      serverId: action.target.serverId!,
      name: action.name,
      parameters: action.parameters,
    };
  }

  /**
   * Execute a multi-action plan
   */
  async execute(plan: MultiActionPlan): Promise<void> {
    // Create parent task for the entire plan
    const parentTask = taskManager.create({
      name: plan.name,
      description: plan.description,
      type: 'plan',
      metadata: { planId: plan.id },
    });

    taskManager.start(parentTask.id);

    try {
      // Group actions by execution order
      const actionGroups = this.groupByOrder(plan.actions);

      for (const group of actionGroups) {
        // Execute actions in parallel within each group
        await Promise.all(
          group.map((action) => this.executeAction(action, parentTask.id))
        );
      }

      taskManager.finish(parentTask.id, { status: 'completed' });
    } catch (error) {
      taskManager.error(
        parentTask.id,
        error instanceof Error ? error.message : 'Plan execution failed'
      );
      throw error;
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: PlanAction,
    parentTaskId: string
  ): Promise<void> {
    // Create subtask for this action
    const task = taskManager.create({
      name: action.name,
      description: action.description,
      type: action.target.type,
      parentId: parentTaskId,
      metadata: { actionId: action.id },
    });

    taskManager.start(task.id);

    try {
      if (action.target.type === 'mcp') {
        const mcpAction = this.toMCPAction(action);
        const result = await mcpClient.executeAction(mcpAction);

        if (!result.success) {
          throw new Error(result.error);
        }

        taskManager.finish(task.id, result.data);
      } else if (action.target.type === 'subagent') {
        // Subagent execution handled separately
        await this.executeSubagentAction(action, task);
      }
    } catch (error) {
      taskManager.error(
        task.id,
        error instanceof Error ? error.message : 'Action execution failed'
      );
      throw error;
    }
  }

  /**
   * Execute a subagent action (Spark Agent)
   */
  private async executeSubagentAction(
    action: PlanAction,
    task: Task
  ): Promise<void> {
    // TODO: Implement Spark Agent integration
    // This will handle complex, long-horizon task execution
    taskManager.finish(task.id, { status: 'subagent_pending' });
  }

  /**
   * Group actions by execution order (respecting dependencies)
   */
  private groupByOrder(actions: PlanAction[]): PlanAction[][] {
    const groups: Map<number, PlanAction[]> = new Map();

    for (const action of actions) {
      const order = action.order ?? 0;
      const group = groups.get(order) || [];
      group.push(action);
      groups.set(order, group);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([, actions]) => actions);
  }
}

export const plannerAdapter = new PlannerAdapter();
