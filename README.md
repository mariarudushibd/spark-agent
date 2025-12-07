# Spark Agent

Gemini 3 multi-action planning with MCP servers and Spark Agent integration for complex task orchestration.

## Overview

Spark Agent enables **multi-action workflows** that:
- Work with **any MCP server**
- Leverage **subagent Task creation and coordination**
- Support complex, long-horizon task execution through multi-step planning

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Vercel AI SDK** - Unified LLM provider interface
- **TypeScript** - Type-safe development
- **MCP Protocol** - Model Context Protocol for tool integration

## Vercel AI SDK

The AI SDK provides:
- **Unified Provider Architecture** - Standardized API for OpenAI, Anthropic, Google, and more
- **Streaming Capabilities** - Real-time AI responses
- **Easy Integration** - Seamless Next.js App Router support
- **Model Flexibility** - Swap providers without code changes
- **Tool Support** - Function calls and dynamic UI generation

## Spark Agent Capabilities

| Capability | Description |
|------------|-------------|
| **Code** | Full-stack web apps with Auth, Functions, Database, Stripe |
| **Bug-free** | End-to-end testing simulating user actions |
| **Aesthetics** | Modern, visually stunning web interfaces |
| **PPT** | Flexible layouts and visualization components |
| **Deep Research** | Search, API, browser, and MCP tools |
| **Multimodal** | Understands files, video, audio, images |
| **MCP Ecosystem** | Custom MCPs from scratch or wrapped tools |

## Project Structure

```
spark-agent/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── lib/
│   │   ├── ai/              # AI SDK configuration
│   │   ├── mcp/             # MCP server connectors
│   │   ├── planner/         # Multi-action plan adapter
│   │   └── tasks/           # Task lifecycle API
│   └── types/               # TypeScript definitions
├── schemas/                 # JSON schemas for plans
├── tests/                   # Unit + integration tests
└── docs/                    # Documentation
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Run development server
pnpm dev
```

## Configuration

Set your API keys in `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Roadmap

- [x] Define plan schema
- [ ] Implement planner adapter
- [ ] Develop Task lifecycle API
- [ ] Add MCP server connector
- [ ] Add Spark Agent subagent example
- [ ] Write tests and documentation

## License

MIT
