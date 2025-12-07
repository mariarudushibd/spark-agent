import type { SubagentTask, SubagentResult, SubagentCapability } from '@/types/subagent';
import type { PlanAction, MultiActionPlan } from '@/types/plan';
import { subagentRegistry } from './registry';
import { sparkAgent } from './spark-agent';
import { taskManager } from '@/lib/tasks/lifecycle';

/**
 * Subagent Orchestrator
 * 
 * Manages delegation of complex tasks to specialized subagents.
 * Breaks down problems into smaller parts for efficient parallel execution.
 */

export class SubagentOrchestrator {
  constructor() {
    // Register Spark Agent by default
    subagentRegistry.register(sparkAgent.getAgentConfig());
  }

  /**
   * Delegate a task to the most appropriate subagent
   */
  async delegate(task: SubagentTask): Promise<SubagentResult> {
    // Find the best subagent for the required capabilities
    const agent = subagentRegistry.findBestMatch(task.capabilities);

    if (!agent) {
      return {
        success: false,
        taskId: '',
        error: `No subagent found with capabilities: ${task.capabilities.join(', ')}`,
      };
    }

    // Route to the appropriate subagent
    if (agent.id === 'spark-agent') {
      return sparkAgent.execute(task);
    }

    // Generic subagent execution (extensible for future agents)
    return this.executeGenericSubagent(agent.id, task);
  }

  /**
   * Execute multiple subtasks in parallel
   */
  async delegateParallel(tasks: SubagentTask[]): Promise<SubagentResult[]> {
    return Promise.all(tasks.map((task) => this.delegate(task)));
  }

  /**
   * Execute subtasks sequentially with dependency handling
   */
  async delegateSequential(
    tasks: SubagentTask[],
    contextPropagation = true
  ): Promise<SubagentResult[]> {
    const results: SubagentResult[] = [];
    let accumulatedContext: Record<string, unknown> = {};

    for (const task of tasks) {
      // Merge accumulated context if enabled
      const enrichedTask = contextPropagation
        ? { ...task, context: { ...task.context, ...accumulatedContext } }
        : task;

      const result = await this.delegate(enrichedTask);
      results.push(result);

      // Propagate successful results to next task's context
      if (result.success && result.output) {
        accumulatedContext = {
          ...accumulatedContext,
          [`result_${results.length - 1}`]: result.output,
        };
      }
    }

    return results;
  }

  /**
   * Decompose a complex plan into subagent tasks
   */
  decomposeForSubagents(plan: MultiActionPlan): SubagentTask[] {
    return plan.actions
      .filter((action) => action.target.type === 'subagent')
      .map((action) => this.actionToSubagentTask(action));
  }

  /**
   * Convert a plan action to a subagent task
   */
  private actionToSubagentTask(action: PlanAction): SubagentTask {
    const capabilities = this.inferCapabilities(action);

    return {
      id: action.id,
      name: action.name,
      prompt: action.description,
      capabilities,
      context: action.parameters as Record<string, unknown>,
      constraints: {
        maxDuration: action.parameters.timeout as number | undefined,
      },
    };
  }

  /**
   * Infer required capabilities from action parameters
   */
  private inferCapabilities(action: PlanAction): SubagentCapability[] {
    const capabilities: SubagentCapability[] = [];
    const params = action.parameters;

    // Infer from explicit capabilities parameter
    if (Array.isArray(params.capabilities)) {
      return params.capabilities as SubagentCapability[];
    }

    // Infer from action name/description patterns
    const text = `${action.name} ${action.description}`.toLowerCase();

    if (text.includes('code') || text.includes('build') || text.includes('develop')) {
      capabilities.push('code');
    }
    if (text.includes('test') || text.includes('verify')) {
      capabilities.push('testing');
    }
    if (text.includes('design') || text.includes('ui') || text.includes('style')) {
      capabilities.push('aesthetics');
    }
    if (text.includes('research') || text.includes('search') || text.includes('find')) {
      capabilities.push('research');
    }
    if (text.includes('presentation') || text.includes('slide') || text.includes('ppt')) {
      capabilities.push('presentation');
    }
    if (text.includes('image') || text.includes('video') || text.includes('audio')) {
      capabilities.push('multimodal');
    }

    return capabilities.length > 0 ? capabilities : ['code']; // Default to code
  }

  /**
   * Generic subagent execution (placeholder for additional subagents)
   */
  private async executeGenericSubagent(
    agentId: string,
    task: SubagentTask
  ): Promise<SubagentResult> {
    // Placeholder for future subagent implementations
    return {
      success: false,
      taskId: '',
      error: `Subagent ${agentId} execution not implemented`,
    };
  }
}

export const orchestrator = new SubagentOrchestrator();
