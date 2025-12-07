import { generatePlan } from '@/lib/ai/planner';
import { plannerAdapter } from '@/lib/planner/adapter';
import { orchestrator } from '@/lib/subagents/orchestrator';
import { taskManager } from '@/lib/tasks/lifecycle';

/**
 * Example: End-to-end Landing Page Workflow
 * 
 * Demonstrates: prompt → Gemini planner → MCP actions + Spark Agent subtasks
 */

export async function buildLandingPageWorkflow(userPrompt: string) {
  console.log('🚀 Starting Landing Page Workflow');
  console.log(`📝 User Prompt: ${userPrompt}`);

  // Step 1: Generate multi-action plan from user prompt
  console.log('\n📋 Generating plan with Gemini...');
  const plan = await generatePlan(userPrompt);
  console.log(`Generated plan: ${plan.name}`);
  console.log(`Actions: ${plan.actions.length}`);

  // Step 2: Subscribe to task events for monitoring
  const unsubscribe = taskManager.onEvent((event) => {
    const icon = {
      created: '📦',
      started: '▶️',
      updated: '🔄',
      finished: '✅',
      error: '❌',
    }[event.type];
    console.log(`${icon} [${event.type}] ${event.task.name}`);
  });

  try {
    // Step 3: Decompose plan into subagent tasks
    const subagentTasks = orchestrator.decomposeForSubagents(plan);
    console.log(`\n🤖 Subagent tasks: ${subagentTasks.length}`);

    // Step 4: Execute the full plan (MCP + Subagents)
    console.log('\n⚡ Executing plan...');
    await plannerAdapter.execute(plan);

    // Step 5: Get results
    const completedTasks = taskManager.getAll('completed');
    const failedTasks = taskManager.getAll('failed');

    console.log('\n📊 Results:');
    console.log(`  ✅ Completed: ${completedTasks.length}`);
    console.log(`  ❌ Failed: ${failedTasks.length}`);

    return {
      success: failedTasks.length === 0,
      plan,
      completedTasks,
      failedTasks,
    };
  } finally {
    unsubscribe();
  }
}

// Example usage
export const examplePrompts = {
  simple: 'Create a landing page for a SaaS product called "TaskFlow" that helps teams manage projects',
  
  complex: `Build a complete landing page for "EcoTrack" - a sustainability tracking app:
    1. Research current sustainability app trends
    2. Design a modern, green-themed UI with hero section, features, and pricing
    3. Implement with Next.js and deploy
    4. Add analytics tracking`,
  
  withIntegrations: `Create a landing page for "PaySimple" payment solution:
    - Integrate Stripe for demo checkout
    - Add authentication with email signup
    - Include live chat widget
    - Mobile-responsive design`,
};
