import { describe, it, expect } from 'vitest';
import {
  SubagentConfigSchema,
  SubagentTaskSchema,
  SubagentResultSchema,
} from '@/schemas/subagent.schema';
import {
  CodeOutputSchema,
  ResearchOutputSchema,
  CodeReviewOutputSchema,
} from '@/schemas/structured-outputs';

describe('Subagent Schemas', () => {
  it('validates a complete subagent config', () => {
    const config = {
      id: 'test-agent',
      name: 'Test Agent',
      description: 'A test agent',
      systemPrompt: 'You are a test agent',
      capabilities: ['code', 'testing'],
      allowedTools: ['file_read'],
      model: {
        name: 'gemini-2.0-flash',
        temperature: 0.7,
      },
      context: {
        maxTokens: 32000,
        inheritParentContext: true,
      },
    };

    const result = SubagentConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('rejects invalid capability', () => {
    const config = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      systemPrompt: 'Test',
      capabilities: ['invalid_capability'],
    };

    const result = SubagentConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('validates task with constraints', () => {
    const task = {
      name: 'Build Feature',
      prompt: 'Create a login form',
      capabilities: ['code', 'aesthetics'],
      constraints: {
        maxDuration: 60000,
        maxTokens: 4096,
        outputFormat: 'json',
      },
    };

    const result = SubagentTaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });
});

describe('Structured Output Schemas', () => {
  it('validates code output', () => {
    const output = {
      files: [
        {
          path: 'src/components/Button.tsx',
          content: 'export const Button = () => <button>Click</button>',
          language: 'typescript',
        },
      ],
      summary: 'Created a Button component',
      dependencies: ['react'],
      instructions: 'Import and use the Button component',
    };

    const result = CodeOutputSchema.safeParse(output);
    expect(result.success).toBe(true);
  });

  it('validates research output', () => {
    const output = {
      title: 'Market Analysis',
      summary: 'Overview of current trends',
      findings: [
        {
          topic: 'AI Adoption',
          content: 'AI adoption is increasing',
          sources: ['source1.com'],
          confidence: 'high',
        },
      ],
      recommendations: ['Focus on AI integration'],
    };

    const result = ResearchOutputSchema.safeParse(output);
    expect(result.success).toBe(true);
  });

  it('validates code review output', () => {
    const output = {
      overallScore: 7.5,
      summary: 'Good code quality with minor issues',
      issues: [
        {
          severity: 'minor',
          category: 'style',
          file: 'src/index.ts',
          line: 10,
          message: 'Consider using const',
          suggestion: 'Replace let with const',
        },
      ],
      positives: ['Good naming conventions'],
    };

    const result = CodeReviewOutputSchema.safeParse(output);
    expect(result.success).toBe(true);
  });

  it('rejects invalid review score', () => {
    const output = {
      overallScore: 15, // Invalid: max is 10
      summary: 'Test',
      issues: [],
    };

    const result = CodeReviewOutputSchema.safeParse(output);
    expect(result.success).toBe(false);
  });
});
