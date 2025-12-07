/**
 * Subagent Types
 * 
 * Subagents are specialized AI assistants that operate under
 * a main orchestrator agent to handle specific tasks.
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

export interface Subagent {
  id: string;
  name: string;
  description: string;
  capabilities: SubagentCapability[];
  status: SubagentStatus;
  metadata?: Record<string, unknown>;
}

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

export interface SubagentResult {
  success: boolean;
  taskId: string;
  output?: unknown;
  artifacts?: SubagentArtifact[];
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SubagentArtifact {
  type: 'file' | 'code' | 'image' | 'data';
  name: string;
  content: string | Buffer;
  mimeType?: string;
}
