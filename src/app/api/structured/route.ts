import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { structuredExecutor } from '@/lib/subagents/structured-executor';
import { subagentRegistry } from '@/lib/subagents/registry';
import { SubagentTaskSchema } from '@/schemas/subagent.schema';
import { outputSchemas, OutputType } from '@/schemas/structured-outputs';

// Request schema
const RequestSchema = z.object({
  task: SubagentTaskSchema,
  subagentId: z.string().optional(),
  outputType: z.enum(['code', 'research', 'review', 'design', 'test']),
});

/**
 * POST /api/structured
 * Execute a task with structured output validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, subagentId, outputType } = RequestSchema.parse(body);

    // Get subagent config
    const subagent = subagentId
      ? subagentRegistry.get(subagentId)
      : subagentRegistry.findBestMatch(task.capabilities);

    if (!subagent) {
      return NextResponse.json(
        { error: 'No suitable subagent found' },
        { status: 404 }
      );
    }

    // Execute with structured output
    const result = await structuredExecutor.execute(
      task,
      subagent,
      outputType as OutputType
    );

    return NextResponse.json({
      success: result.success,
      taskId: result.taskId,
      subagentId: subagent.id,
      outputType,
      output: result.structuredOutput,
      error: result.error,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/structured/schemas
 * Get available output schemas
 */
export async function GET() {
  const schemas = Object.entries(outputSchemas).map(([name, schema]) => ({
    name,
    // Convert Zod schema to JSON Schema for documentation
    description: getSchemaDescription(name as OutputType),
  }));

  return NextResponse.json({ schemas });
}

function getSchemaDescription(type: OutputType): string {
  const descriptions: Record<OutputType, string> = {
    code: 'Generated code files with dependencies and instructions',
    research: 'Research findings with sources and recommendations',
    review: 'Code review with issues, scores, and suggestions',
    design: 'UI components with colors, typography, and layout',
    test: 'Test suite with unit, integration, and e2e tests',
  };
  return descriptions[type];
}
