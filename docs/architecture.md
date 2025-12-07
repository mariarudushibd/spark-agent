# Spark Agent Architecture

## Overview

Spark Agent implements a multi-action planning system that bridges Gemini 3's planning capabilities with MCP servers and subagent task orchestration.

## Components

### 1. AI Planner (`src/lib/ai/planner.ts`)

Uses Vercel AI SDK to interact with Gemini 3 for generating structured multi-action plans.

```
User Prompt → Gemini 3 → MultiActionPlan (structured)
```

### 2. Planner Adapter (`src/lib/planner/adapter.ts`)

Converts abstract plans into executable actions:
- Serializes plans to MCP-compatible messages
- Handles action ordering and dependencies
- Coordinates parallel vs sequential execution

### 3. MCP Client (`src/lib/mcp/client.ts`)

Manages communication with MCP servers:
- Server registration and discovery
- Action execution via HTTP
- Tool capability queries

### 4. Task Manager (`src/lib/tasks/lifecycle.ts`)

Handles task lifecycle with event-driven architecture:
- Create → Start → Update → Finish/Error
- Parent-child task relationships
- Real-time event subscriptions

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Prompt                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Planner (Gemini 3)                        │
│              Generates MultiActionPlan                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Planner Adapter                              │
│           Serializes to MCP Actions / Tasks                     │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│       MCP Client         │    │       Task Manager               │
│   Execute MCP Actions    │    │   Manage Subagent Tasks          │
└──────────────────────────┘    └──────────────────────────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│      MCP Servers         │    │       Spark Agent                │
│   (External Services)    │    │   (Complex Task Execution)       │
└──────────────────────────┘    └──────────────────────────────────┘
```

## Security Considerations

- MCP server authentication via bearer tokens
- Secure credential management through environment variables
- Input validation using Zod schemas

## Extension Points

1. **New MCP Servers**: Register via `mcpClient.registerServer()`
2. **Custom Actions**: Extend `PlanActionSchema` with new target types
3. **Task Handlers**: Add event listeners via `taskManager.onEvent()`
