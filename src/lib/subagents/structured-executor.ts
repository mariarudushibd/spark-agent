import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/ai/config';
import { taskManager } from '@/lib/tasks/lifecycle';
import { SubagentTaskSchema, SubagentResultSchema } from '@/schemas/subagent.schema';
import { outputSchemas, OutputType } from '@/schemas/structured-outputs';
import type { SubagentTask, SubagentResult, SubagentConfig } from '@/schemas/subagent.schema';

/**
 * Structured Executor
 * Executes subagent tasks with schema-validated structured outputs
 */

export class StructuredExecutor {
  /**
   * Execute a task with structured output
   */
  async execute<T extends OutputType>(
    task: SubagentTask,
    config: SubagentConfig,
    outputType: T
  ): Promise<SubagentResult & { structuredOutput?: z.infer<typeof outputSchemas[T]> }> {
    // Validate task input
    const validatedTask = SubagentTaskSchema.parse(task);

    // Create tracking task
    const internalTask = taskManager.create({
      name: `Structured: ${validatedTask.name}`,
      description: validatedTask.prompt,
      type: 'subagent',
      metadata: {
        subagentId: config.id,
        outputType,
      },
    });

    taskManager.start(internalTask.id);

    try {
      // Get the appropriate schema
      const schema = outputSchemas[outputType];

      // Build the prompt with system context
      const fullPrompt = this.buildPrompt(config, validatedTask);

      // Execute with structured output
      const { object } = await generateObject({
        model: models.planner,
        schema,
        prompt: fullPrompt,
      });

      taskManager.finish(internalTask.id, object);

      return {
        success: true,
        taskId: internalTask.id,
        output: object,
        structuredOutput: object as z.infer<typeof outputSchemas[T]>,
        metadata: {
          outputType,
          validated: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      taskManager.error(internalTask.id, errorMessage);

      return {
        success: false,
        taskId: internalTask.id,
        error: errorMessage,
      };
    }
  }

  /**
   * Execute with custom schema
   */
  async executeWithSchema<T extends z.ZodType>(
    task: SubagentTask,
    config: SubagentConfig,
    schema: T
  ): Promise<SubagentResult & { structuredOutput?: z.infer<T> }> {
    const validatedTask = SubagentTaskSchema.parse(task);

    const internalTask = taskManager.create({
      name: `Custom: ${validatedTask.name}`,
      description: validatedTask.prompt,
      type: 'subagent',
      metadata: { subagentId: config.id },
    });

    taskManager.start(internalTask.id);

    try {
      const fullPrompt = this.buildPrompt(config, validatedTask);

      const { object } = await generateObject({
        model: models.planner,
        schema,
        prompt: fullPrompt,
      });

      taskManager.finish(internalTask.id, object);

      return {
        success: true,
        taskId: internalTask.id,
        output: object,
        structuredOutput: object,
        metadata: { validated: true },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      taskManager.error(internalTask.id, errorMessage);

      return {
        success: false,
        taskId: internalTask.id,
        error: errorMessage,
      };
    }
  }

  /**
   * Build the full prompt with system context
   */
  private buildPrompt(config: SubagentConfig, task: SubagentTask): string {
    const parts: string[] = [];

    // Add system prompt
    if (config.systemPrompt) {
      parts.push(`<system>\n${config.systemPrompt}\n</system>`);
    }

    // Add static context if configured
    if (config.context?.staticContext) {
      parts.push(`<context>\n${config.context.staticContext}\n</context>`);
    }

    // Add task context
    if (task.context && Object.keys(task.context).length > 0) {
      parts.push(`<task_context>\n${JSON.stringify(task.context, null, 2)}\n</task_context>`);
    }

    // Add the actual prompt
    parts.push(`<task>\n${task.prompt}\n</task>`);

    return parts.join('\n\n');
  }

  /**
   * Validate a result against its expected schema
   */
  validateResult<T extends OutputType>(
    result: unknown,
    outputType: T
  ): { valid: boolean; data?: z.infer<typeof outputSchemas[T]>; errors?: z.ZodError } {
    const schema = outputSchemas[outputType];
    const parseResult = schema.safeParse(result);

    if (parseResult.success) {
      return { valid: true, data: parseResult.data as z.infer<typeof outputSchemas[T]> };
    }

    return { valid: false, errors: parseResult.error };
  }
}

export const structuredExecutor = new StructuredExecutor();
