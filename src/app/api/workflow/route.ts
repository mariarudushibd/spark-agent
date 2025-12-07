import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/ai/planner';
import { orchestrator } from '@/lib/subagents/orchestrator';
import { taskManager } from '@/lib/tasks/lifecycle';

/**
 * POST /api/workflow
 * 
 * Execute a multi-action workflow from a natural language prompt
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate plan from prompt
    const plan = await generatePlan(prompt);

    // Decompose into subagent tasks
    const subagentTasks = orchestrator.decomposeForSubagents(plan);

    // Execute based on options
    const results = options?.parallel
      ? await orchestrator.delegateParallel(subagentTasks)
      : await orchestrator.delegateSequential(subagentTasks);

    // Gather task statuses
    const tasks = taskManager.getAll();

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        actionCount: plan.actions.length,
      },
      results,
      tasks: tasks.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        type: t.type,
      })),
    });
  } catch (error) {
    console.error('Workflow error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Workflow failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflow
 * 
 * Get current task statuses
 */
export async function GET() {
  const tasks = taskManager.getAll();

  return NextResponse.json({
    tasks: tasks.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      type: t.type,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    })),
    summary: {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      running: tasks.filter((t) => t.status === 'running').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    },
  });
}
