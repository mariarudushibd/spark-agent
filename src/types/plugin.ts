/**
 * Plugin System Types
 * 
 * Extend Spark with custom commands, agents, hooks, skills, and MCP servers
 */

export type PluginType = 'command' | 'agent' | 'hook' | 'skill' | 'mcp-server';

export type HookEvent =
  | 'task:created'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'plan:generated'
  | 'plan:executed'
  | 'agent:registered'
  | 'mcp:connected';

/**
 * Plugin Manifest - defines plugin metadata and capabilities
 */
export interface PluginManifest {
  /** Unique plugin identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Plugin version (semver) */
  version: string;
  
  /** Description */
  description: string;
  
  /** Author information */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  
  /** Plugin homepage or repository */
  repository?: string;
  
  /** License */
  license?: string;
  
  /** Minimum Spark version required */
  sparkVersion?: string;
  
  /** Plugin types this package provides */
  provides: PluginType[];
  
  /** Dependencies on other plugins */
  dependencies?: Record<string, string>;
  
  /** Plugin configuration schema */
  configSchema?: Record<string, unknown>;
}

/**
 * Command Plugin - adds custom commands
 */
export interface CommandPlugin {
  type: 'command';
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
  execute: (args: string[], context: PluginContext) => Promise<CommandResult>;
}

/**
 * Agent Plugin - adds custom subagents
 */
export interface AgentPlugin {
  type: 'agent';
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  execute: (task: AgentTask, context: PluginContext) => Promise<AgentResult>;
}

/**
 * Hook Plugin - adds lifecycle hooks
 */
export interface HookPlugin {
  type: 'hook';
  events: HookEvent[];
  priority?: number; // Lower = earlier execution
  handler: (event: HookEvent, data: unknown, context: PluginContext) => Promise<void>;
}

/**
 * Skill Plugin - adds reusable skills
 */
export interface SkillPlugin {
  type: 'skill';
  name: string;
  description: string;
  triggers?: string[]; // Keywords that activate this skill
  execute: (input: string, context: PluginContext) => Promise<SkillResult>;
}

/**
 * MCP Server Plugin - adds MCP server connectors
 */
export interface MCPServerPlugin {
  type: 'mcp-server';
  id: string;
  name: string;
  description: string;
  url?: string;
  tools: MCPTool[];
  connect: (config: Record<string, unknown>) => Promise<void>;
  disconnect: () => Promise<void>;
  execute: (action: string, params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Union type for all plugin types
 */
export type Plugin =
  | CommandPlugin
  | AgentPlugin
  | HookPlugin
  | SkillPlugin
  | MCPServerPlugin;

/**
 * Plugin Context - passed to plugin handlers
 */
export interface PluginContext {
  spark: {
    version: string;
    config: Record<string, unknown>;
  };
  logger: PluginLogger;
  storage: PluginStorage;
  api: PluginAPI;
}

export interface PluginLogger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

export interface PluginStorage {
  get: <T>(key: string) => Promise<T | undefined>;
  set: <T>(key: string, value: T) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface PluginAPI {
  registerCommand: (command: CommandPlugin) => void;
  registerAgent: (agent: AgentPlugin) => void;
  registerHook: (hook: HookPlugin) => void;
  registerSkill: (skill: SkillPlugin) => void;
  registerMCPServer: (server: MCPServerPlugin) => void;
}

// Result types
export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface AgentTask {
  prompt: string;
  context?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

export interface SkillResult {
  success: boolean;
  output?: string;
  data?: unknown;
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
