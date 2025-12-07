# Spark Plugin System

Extend Spark with custom commands, agents, hooks, skills, and MCP servers through the plugin system.

## Overview

Plugins allow you to:
- Add custom **commands** for the CLI
- Register new **agents** with specialized capabilities
- Attach **hooks** to lifecycle events
- Create reusable **skills** for common tasks
- Connect additional **MCP servers**

## Plugin Structure

```
.spark/plugins/
└── my-plugin/
    ├── manifest.json    # Plugin metadata
    └── index.js         # Plugin code
```

## Manifest Schema

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Description of what this plugin does",
  "author": {
    "name": "Your Name"
  },
  "provides": ["command", "hook", "skill"],
  "sparkVersion": ">=1.0.0"
}
```

## Plugin Types

### Command Plugin

Add custom CLI commands:

```javascript
{
  type: 'command',
  name: 'deploy',
  description: 'Deploy the application',
  usage: 'deploy [environment]',
  execute: async (args, context) => {
    const env = args[0] || 'production';
    // Deployment logic
    return { success: true, output: `Deployed to ${env}` };
  }
}
```

### Agent Plugin

Register specialized subagents:

```javascript
{
  type: 'agent',
  id: 'sql-expert',
  name: 'SQL Expert',
  description: 'Database query specialist',
  capabilities: ['code'],
  systemPrompt: 'You are an SQL expert...',
  execute: async (task, context) => {
    // Agent logic
    return { success: true, output: result };
  }
}
```

### Hook Plugin

Attach to lifecycle events:

```javascript
{
  type: 'hook',
  events: ['task:completed', 'task:failed'],
  priority: 10, // Lower = earlier
  handler: async (event, data, context) => {
    if (event === 'task:failed') {
      context.logger.error('Task failed:', data);
      // Send notification, log to external service, etc.
    }
  }
}
```

**Available Events:**
- `task:created`, `task:started`, `task:completed`, `task:failed`
- `plan:generated`, `plan:executed`
- `agent:registered`, `mcp:connected`

### Skill Plugin

Create reusable skills:

```javascript
{
  type: 'skill',
  name: 'json-formatter',
  description: 'Format and validate JSON',
  triggers: ['format json', 'validate json'],
  execute: async (input, context) => {
    try {
      const formatted = JSON.stringify(JSON.parse(input), null, 2);
      return { success: true, output: formatted };
    } catch {
      return { success: false, error: 'Invalid JSON' };
    }
  }
}
```

### MCP Server Plugin

Connect additional MCP servers:

```javascript
{
  type: 'mcp-server',
  id: 'custom-api',
  name: 'Custom API Server',
  description: 'Connect to custom API',
  tools: [
    { name: 'fetch_data', description: 'Fetch data from API', parameters: {} }
  ],
  connect: async (config) => {
    // Initialize connection
  },
  disconnect: async () => {
    // Cleanup
  },
  execute: async (action, params) => {
    // Execute MCP action
    return result;
  }
}
```

## Plugin Context

All plugin handlers receive a context object:

```javascript
{
  spark: {
    version: '1.0.0',
    config: { /* plugin config */ }
  },
  logger: {
    debug, info, warn, error
  },
  storage: {
    get, set, delete, clear
  },
  api: {
    registerCommand,
    registerAgent,
    registerHook,
    registerSkill,
    registerMCPServer
  }
}
```

## Loading Plugins

```typescript
import { loadPlugins } from '@/lib/plugins/loader';
import { pluginRegistry } from '@/lib/plugins/registry';

// Load all plugins from .spark/plugins/
await loadPlugins();

// Use registered plugins
const command = pluginRegistry.getCommand('deploy');
if (command) {
  const result = await command.execute(['staging'], context);
}
```

## Best Practices

1. **Single Responsibility**: Each plugin should do one thing well
2. **Error Handling**: Always catch and handle errors gracefully
3. **Logging**: Use `context.logger` for consistent output
4. **Configuration**: Use `configSchema` for type-safe config
5. **Dependencies**: Declare plugin dependencies in manifest
