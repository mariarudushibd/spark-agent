import type { Subagent, SubagentTask, SubagentResult } from '@/types/subagent';
import { taskManager } from '@/lib/tasks/lifecycle';

/**
 * Spark Agent - Specialized Subagent
 * 
 * Capabilities:
 * - Code: Full-stack web apps with Auth, Functions, Database, Stripe
 * - Bug-free: End-to-end testing simulating user actions
 * - Aesthetics: Modern, visually stunning web interfaces
 * - PPT: Flexible layouts and visualization components
 * - Deep Research: Search, API, browser, and MCP tools
 * - Multimodal: Understands files, video, audio, images
 * - MCP Ecosystem: Custom MCPs from scratch or wrapped tools
 */

export class SparkAgentClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl?: string; apiKey?: string } = {}) {
    this.baseUrl = config.baseUrl || process.env.SPARK_AGENT_URL || 'http://localhost:3001';
    this.apiKey = config.apiKey || process.env.SPARK_AGENT_API_KEY;
  }

  /**
   * Get Spark Agent configuration as a Subagent
   */
  getAgentConfig(): Subagent {
    return {
      id: 'spark-agent',
      name: 'Spark Agent',
      description: 'Specialized AI for complex, long-horizon task execution',
      capabilities: [
        'code',
        'testing',
        'aesthetics',
        'presentation',
        'research',
        'multimodal',
        'mcp',
      ],
      status: 'available',
      metadata: {
        version: '1.0.0',
        provider: 'spark',
      },
    };
  }

  /**
   * Execute a task using Spark Agent
   */
  async execute(task: SubagentTask): Promise<SubagentResult> {
    // Create internal task for tracking
    const internalTask = taskManager.create({
      name: `Spark: ${task.name}`,
      description: task.prompt,
      type: 'subagent',
      metadata: {
        subagentId: 'spark-agent',
        capabilities: task.capabilities,
      },
    });

    taskManager.start(internalTask.id);

    try {
      const response = await fetch(`${this.baseUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          prompt: task.prompt,
          capabilities: task.capabilities,
          context: task.context,
          constraints: task.constraints,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Spark Agent error: ${error}`);
      }

      const result = await response.json();

      taskManager.finish(internalTask.id, result);

      return {
        success: true,
        taskId: internalTask.id,
        output: result.output,
        artifacts: result.artifacts,
        metadata: {
          duration: result.duration,
          tokensUsed: result.tokensUsed,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      taskManager.error(internalTask.id, errorMessage);

      return {
        success: false,
        taskId: internalTask.id,
        error: errorMessage,
      };
    }
  }

  /**
   * Stream execution for long-running tasks
   */
  async *executeStream(task: SubagentTask): AsyncGenerator<SubagentResult> {
    const internalTask = taskManager.create({
      name: `Spark: ${task.name}`,
      description: task.prompt,
      type: 'subagent',
      metadata: { subagentId: 'spark-agent', streaming: true },
    });

    taskManager.start(internalTask.id);

    try {
      const response = await fetch(`${this.baseUrl}/api/execute/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          prompt: task.prompt,
          capabilities: task.capabilities,
          context: task.context,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n').filter(Boolean);

        for (const event of events) {
          try {
            const data = JSON.parse(event);
            taskManager.update(internalTask.id, { metadata: { lastEvent: data } });

            yield {
              success: true,
              taskId: internalTask.id,
              output: data.content,
              metadata: { type: data.type },
            };
          } catch {
            // Skip malformed events
          }
        }
      }

      taskManager.finish(internalTask.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stream error';
      taskManager.error(internalTask.id, errorMessage);

      yield {
        success: false,
        taskId: internalTask.id,
        error: errorMessage,
      };
    }
  }
}

export const sparkAgent = new SparkAgentClient();
