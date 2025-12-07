# Subagent Architecture

## Overview

Subagents are specialized AI assistants that operate under a main orchestrator agent to handle specific tasks. This architecture breaks down complex problems into smaller, manageable parts for greater efficiency, accuracy, and context management.

## What are Subagents?

Subagents in Gemini Code are pre-configured AI personalities that can be invoked to handle specific types of tasks. Each subagent:

- **Has a specific purpose and expertise area**
- **Uses its own context window** separate from the main conversation
- **Can be configured with specific tools** it's allowed to use
- **Includes a custom system prompt** that guides its behavior

When Gemini Code encounters a task that matches a subagent's expertise, it can delegate that task to the specialized subagent, which works independently and returns results.

## Benefits

1. **Specialization**: Each subagent focuses on specific capabilities
2. **Parallel Execution**: Independent tasks run simultaneously
3. **Context Management**: Separate context windows prevent token overflow
4. **Tool Isolation**: Control which tools each subagent can access
5. **Scalability**: Add new subagents without modifying core logic

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Request                                  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Gemini 3 Planner                               │
│            Generates MultiActionPlan                            │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Subagent Orchestrator                           │
│    ┌─────────────────────────────────────────────────────┐      │
│    │           Capability-Based Routing                  │      │
│    └─────────────────────────────────────────────────────┘      │
└──────────┬──────────────────┬──────────────────┬────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │   Spark    │    │  Research  │    │   Code     │
    │   Agent    │    │   Agent    │    │  Reviewer  │
    ├────────────┤    ├────────────┤    ├────────────┤
    │ • code     │    │ • research │    │ • code     │
    │ • testing  │    │ • analysis │    │ • testing  │
    │ • aesthet. │    │            │    │            │
    │ • research │    │            │    │            │
    └────────────┘    └────────────┘    └────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │  Context   │    │  Context   │    │  Context   │
    │  Window 1  │    │  Window 2  │    │  Window 3  │
    └────────────┘    └────────────┘    └────────────┘
```

## Subagent Configuration

Subagents are defined in `.gemini/agents/` directory as JSON files:

```json
{
  "id": "spark-agent",
  "name": "Spark Agent",
  "description": "Specialized AI for complex development tasks",
  "systemPrompt": "You are Spark Agent, a specialized AI...",
  "capabilities": ["code", "testing", "aesthetics"],
  "allowedTools": ["file_read", "file_write", "terminal"],
  "deniedTools": [],
  "model": {
    "name": "gemini-2.0-flash",
    "temperature": 0.7,
    "maxTokens": 8192
  },
  "context": {
    "maxTokens": 32000,
    "inheritParentContext": true
  }
}
```

### Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | Purpose and expertise |
| `systemPrompt` | string | Custom prompt guiding behavior |
| `capabilities` | array | List of capabilities |
| `allowedTools` | array | Tools this subagent can use |
| `deniedTools` | array | Explicitly blocked tools |
| `model` | object | Model configuration |
| `context` | object | Context window settings |

## Available Capabilities

| Capability | Description | Use Cases |
|------------|-------------|----------|
| `code` | Full-stack development | Web apps, APIs, components |
| `testing` | End-to-end testing | User flow simulation |
| `aesthetics` | UI/UX design | Modern interfaces |
| `presentation` | Slides & docs | PPT, reports |
| `research` | Deep research | Market analysis, trends |
| `multimodal` | Media processing | Images, video, audio |
| `mcp` | MCP integration | Custom tool creation |

## Built-in Subagents

### Spark Agent
- **Capabilities**: code, testing, aesthetics, research, multimodal, mcp
- **Best for**: Complex full-stack development, long-horizon tasks

### Research Agent
- **Capabilities**: research
- **Best for**: Deep investigation, trend analysis, report generation

### Code Review Agent
- **Capabilities**: code, testing
- **Best for**: Code quality, security analysis, best practices

## Usage

### Basic Delegation

```typescript
import { orchestrator } from '@/lib/subagents/orchestrator';

const result = await orchestrator.delegate({
  name: 'Build Landing Page',
  prompt: 'Create a modern SaaS landing page',
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
], true); // Context flows from step 1 to step 2
```

## Loading Custom Subagents

```typescript
import { loadSubagentConfigs, configToSubagent } from '@/lib/subagents/config-loader';
import { subagentRegistry } from '@/lib/subagents/registry';

// Load all configs from .gemini/agents/
const configs = await loadSubagentConfigs();

// Register each as a runtime subagent
configs.forEach(config => {
  subagentRegistry.register(configToSubagent(config));
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

## Best Practices

1. **Single Responsibility**: Each subagent should focus on one domain
2. **Minimal Tools**: Only grant tools the subagent actually needs
3. **Clear Prompts**: System prompts should be specific and actionable
4. **Context Limits**: Set appropriate token limits to prevent overflow
5. **Error Handling**: Subagents should gracefully handle failures
