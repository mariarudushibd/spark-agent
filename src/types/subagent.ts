/**
 * Subagent Types
 * 
 * Subagents are specialized AI assistants that operate under
 * a main orchestrator agent to handle specific tasks.
 * 
 * Key characteristics:
 * - Has a specific purpose and expertise area
 * - Uses its own context window separate from the main conversation
 * - Can be configured with specific tools it's allowed to use
 * - Includes a custom system prompt that guides its behavior
 */

export type SubagentCapability =
  | 'code'        // Full-stack development
  | 'testing'     // End-to-end testing
  | 'aesthetics'  // UI/UX design
  | 'presentation'// Slides and documents
  | 'research'    // Deep research and analysis
  | 'multimodal'  // Image, video, audio processing
  | 'mcp';        // MCP ecosystem integration

export type SubagentStatus = 'available' | 'busy' | 'offline';

/**
 * Subagent Configuration
 * Defines a specialized AI assistant for task-specific workflows
 */
export interface SubagentConfig {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Description of the subagent's purpose and expertise */
  description: string;
  
  /** Custom system prompt that guides behavior */
  systemPrompt: string;
  
  /** Capabilities this subagent specializes in */
  capabilities: SubagentCapability[];
  
  /** Specific tools the subagent is allowed to use */
  allowedTools?: string[];
  
  /** Tools explicitly denied to this subagent */
  deniedTools?: string[];
  
  /** Model configuration */
  model?: {
    name: string;
    temperature?: number;
    maxTokens?: number;
  };
  
  /** Context window configuration */
  context?: {
    /** Maximum tokens for context */
    maxTokens?: number;
    /** Whether to inherit parent context */
    inheritParentContext?: boolean;
    /** Specific context to always include */
    staticContext?: string;
  };
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Runtime subagent instance
 */
export interface Subagent extends SubagentConfig {
  status: SubagentStatus;
}

/**
 * Task to be executed by a subagent
 */
export interface SubagentTask {
  id?: string;
  name: string;
  prompt: string;
  capabilities: SubagentCapability[];
  context?: Record<string, unknown>;
  constraints?: {
    maxDuration?: number;     // Max execution time in ms
    maxTokens?: number;       // Max tokens to use
    outputFormat?: string;    // Expected output format
  };
}

/**
 * Result from subagent execution
 */
export interface SubagentResult {
  success: boolean;
  taskId: string;
  output?: unknown;
  artifacts?: SubagentArtifact[];
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Artifact produced by a subagent
 */
export interface SubagentArtifact {
  type: 'file' | 'code' | 'image' | 'data';
  name: string;
  content: string | Buffer;
  mimeType?: string;
}
