import { z } from 'zod';

/**
 * Structured Schemas for Subagents
 * Type-safe validation for configurations and outputs
 */

// Capability enum
export const SubagentCapabilitySchema = z.enum([
  'code',
  'testing',
  'aesthetics',
  'presentation',
  'research',
  'multimodal',
  'mcp',
]);

// Status enum
export const SubagentStatusSchema = z.enum(['available', 'busy', 'offline']);

// Model configuration
export const ModelConfigSchema = z.object({
  name: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

// Context configuration
export const ContextConfigSchema = z.object({
  maxTokens: z.number().positive().optional(),
  inheritParentContext: z.boolean().optional(),
  staticContext: z.string().optional(),
});

// Full subagent configuration schema
export const SubagentConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  systemPrompt: z.string(),
  capabilities: z.array(SubagentCapabilitySchema),
  allowedTools: z.array(z.string()).optional(),
  deniedTools: z.array(z.string()).optional(),
  model: ModelConfigSchema.optional(),
  context: ContextConfigSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Runtime subagent (config + status)
export const SubagentSchema = SubagentConfigSchema.extend({
  status: SubagentStatusSchema,
});

// Task input schema
export const SubagentTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  prompt: z.string().min(1),
  capabilities: z.array(SubagentCapabilitySchema),
  context: z.record(z.unknown()).optional(),
  constraints: z.object({
    maxDuration: z.number().positive().optional(),
    maxTokens: z.number().positive().optional(),
    outputFormat: z.string().optional(),
  }).optional(),
});

// Artifact schema
export const SubagentArtifactSchema = z.object({
  type: z.enum(['file', 'code', 'image', 'data']),
  name: z.string(),
  content: z.union([z.string(), z.instanceof(Buffer)]),
  mimeType: z.string().optional(),
});

// Result schema
export const SubagentResultSchema = z.object({
  success: z.boolean(),
  taskId: z.string(),
  output: z.unknown().optional(),
  artifacts: z.array(SubagentArtifactSchema).optional(),
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Export types
export type SubagentCapability = z.infer<typeof SubagentCapabilitySchema>;
export type SubagentStatus = z.infer<typeof SubagentStatusSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type ContextConfig = z.infer<typeof ContextConfigSchema>;
export type SubagentConfig = z.infer<typeof SubagentConfigSchema>;
export type Subagent = z.infer<typeof SubagentSchema>;
export type SubagentTask = z.infer<typeof SubagentTaskSchema>;
export type SubagentArtifact = z.infer<typeof SubagentArtifactSchema>;
export type SubagentResult = z.infer<typeof SubagentResultSchema>;
