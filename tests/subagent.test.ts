import { describe, it, expect, beforeEach } from 'vitest';
import { SubagentRegistry } from '@/lib/subagents/registry';
import { SubagentOrchestrator } from '@/lib/subagents/orchestrator';
import type { Subagent, SubagentTask } from '@/types/subagent';

describe('SubagentRegistry', () => {
  let registry: SubagentRegistry;

  const mockAgent: Subagent = {
    id: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent',
    capabilities: ['code', 'testing'],
    status: 'available',
  };

  beforeEach(() => {
    registry = new SubagentRegistry();
  });

  it('registers and retrieves a subagent', () => {
    registry.register(mockAgent);
    const retrieved = registry.get('test-agent');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Agent');
  });

  it('finds subagents by capability', () => {
    registry.register(mockAgent);
    registry.register({
      ...mockAgent,
      id: 'design-agent',
      capabilities: ['aesthetics'],
    });

    const codeAgents = registry.findByCapability('code');
    const designAgents = registry.findByCapability('aesthetics');

    expect(codeAgents).toHaveLength(1);
    expect(designAgents).toHaveLength(1);
    expect(codeAgents[0].id).toBe('test-agent');
  });

  it('finds best match for multiple capabilities', () => {
    registry.register(mockAgent); // code, testing
    registry.register({
      ...mockAgent,
      id: 'full-agent',
      capabilities: ['code', 'testing', 'aesthetics'],
    });

    const best = registry.findBestMatch(['code', 'testing', 'aesthetics']);
    expect(best?.id).toBe('full-agent');
  });

  it('checks agent availability', () => {
    registry.register(mockAgent);
    registry.register({
      ...mockAgent,
      id: 'busy-agent',
      status: 'busy',
    });

    expect(registry.isAvailable('test-agent')).toBe(true);
    expect(registry.isAvailable('busy-agent')).toBe(false);
  });
});

describe('SubagentOrchestrator', () => {
  it('infers capabilities from action description', () => {
    const orchestrator = new SubagentOrchestrator();
    
    // Access private method via any for testing
    const inferCapabilities = (orchestrator as any).inferCapabilities.bind(orchestrator);

    const codeAction = {
      id: '1',
      name: 'Build Component',
      description: 'Develop a React component',
      target: { type: 'subagent' as const },
      parameters: {},
    };

    const researchAction = {
      id: '2',
      name: 'Research Trends',
      description: 'Search and find current market trends',
      target: { type: 'subagent' as const },
      parameters: {},
    };

    expect(inferCapabilities(codeAction)).toContain('code');
    expect(inferCapabilities(researchAction)).toContain('research');
  });

  it('decomposes plan into subagent tasks', () => {
    const orchestrator = new SubagentOrchestrator();

    const plan = {
      id: 'plan-1',
      name: 'Test Plan',
      description: 'A test plan',
      actions: [
        {
          id: 'action-1',
          name: 'Build UI',
          description: 'Create user interface',
          target: { type: 'subagent' as const, agentId: 'spark-agent' },
          parameters: {},
        },
        {
          id: 'action-2',
          name: 'Call API',
          description: 'Fetch data',
          target: { type: 'mcp' as const, serverId: 'api-server' },
          parameters: {},
        },
      ],
    };

    const tasks = orchestrator.decomposeForSubagents(plan);
    
    expect(tasks).toHaveLength(1); // Only subagent actions
    expect(tasks[0].name).toBe('Build UI');
  });
});
