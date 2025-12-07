# Subagent Architecture

## Overview

Subagents are specialized AI assistants that operate under a main orchestrator agent to handle specific tasks. This architecture breaks down complex problems into smaller, manageable parts for greater efficiency and accuracy.

## Benefits

1. **Specialization**: Each subagent focuses on specific capabilities
2. **Parallel Execution**: Independent tasks run simultaneously
3. **Context Management**: Better handling of large, complex tasks
4. **Scalability**: Add new subagents without modifying core logic

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Gemini 3 Planner                           │
│            Generates MultiActionPlan                         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Subagent Orchestrator                        │
│    ┌─────────────────────────────────────────────────┐      │
│    │           Capability-Based Routing               │      │
│    └─────────────────────────────────────────────────┘      │
└──────────┬──────────────────┬──────────────────┬────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │   Spark    │    │  Research  │    │  Custom    │
    │   Agent    │    │   Agent    │    │   Agent    │
    ├────────────┤    ├────────────┤    ├────────────┤
    │ • code     │    │ • research │    │ • custom   │
    │ • testing  │    │ • analysis │    │   caps     │
    │ • aesthet. │    │ • data     │    │            │
    │ • present. │    │            │    │            │
    └────────────┘    └────────────┘    └────────────┘
```

## Spark Agent Capabilities

| Capability | Description | Use Cases |
|------------|-------------|----------|
| `code` | Full-stack development | Web apps, APIs, components |
| `testing` | End-to-end testing | User flow simulation |
| `aesthetics` | UI/UX design | Modern interfaces |
| `presentation` | Slides & docs | PPT, reports |
| `research` | Deep research | Market analysis, trends |
| `multimodal` | Media processing | Images, video, audio |
| `mcp` | MCP integration | Custom tool creation |

## Usage

### Basic Delegation

```typescript
import { orchestrator } from '@/lib/subagents/orchestrator';

const result = await orchestrator.delegate({
  name: 'Build Landing Page',
  prompt: 'Create a modern SaaS landing page with pricing section',
  capabilities: ['code', 'aesthetics'],
});
```

### Parallel Execution

```typescript
const results = await orchestrator.delegateParallel([
  { name: 'Research', prompt: 'Find competitor features', capabilities: ['research'] },
  { name: 'Design', prompt: 'Create mockups', capabilities: ['aesthetics'] },
]);
```

### Sequential with Context Propagation

```typescript
const results = await orchestrator.delegateSequential([
  { name: 'Research', prompt: 'Analyze market', capabilities: ['research'] },
  { name: 'Build', prompt: 'Implement based on research', capabilities: ['code'] },
], true); // Context from step 1 flows to step 2
```

## Registering Custom Subagents

```typescript
import { subagentRegistry } from '@/lib/subagents/registry';

subagentRegistry.register({
  id: 'my-custom-agent',
  name: 'Custom Agent',
  description: 'Specialized for specific tasks',
  capabilities: ['custom-capability'],
  status: 'available',
});
```

## API Endpoint

```bash
# Execute workflow
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a todo app with authentication",
    "options": { "parallel": false }
  }'

# Check task status
curl http://localhost:3000/api/workflow
```
