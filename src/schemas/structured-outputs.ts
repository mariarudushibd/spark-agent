import { z } from 'zod';

/**
 * Structured Output Schemas
 * Define expected output formats for different task types
 */

// Code generation output
export const CodeOutputSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    language: z.string().optional(),
  })),
  summary: z.string(),
  dependencies: z.array(z.string()).optional(),
  instructions: z.string().optional(),
});

// Research output
export const ResearchOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  findings: z.array(z.object({
    topic: z.string(),
    content: z.string(),
    sources: z.array(z.string()).optional(),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
  })),
  recommendations: z.array(z.string()).optional(),
  references: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
    author: z.string().optional(),
  })).optional(),
});

// Code review output
export const CodeReviewOutputSchema = z.object({
  overallScore: z.number().min(0).max(10),
  summary: z.string(),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'major', 'minor', 'suggestion']),
    category: z.enum(['security', 'performance', 'quality', 'style', 'bug']),
    file: z.string(),
    line: z.number().optional(),
    message: z.string(),
    suggestion: z.string().optional(),
  })),
  positives: z.array(z.string()).optional(),
  testCoverage: z.object({
    percentage: z.number().optional(),
    assessment: z.string(),
  }).optional(),
});

// UI/Design output
export const DesignOutputSchema = z.object({
  components: z.array(z.object({
    name: z.string(),
    description: z.string(),
    code: z.string().optional(),
    preview: z.string().optional(), // base64 or URL
  })),
  colorPalette: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    usage: z.string(),
  })).optional(),
  typography: z.object({
    fontFamily: z.string(),
    scale: z.record(z.string()),
  }).optional(),
  layout: z.string().optional(),
});

// Test output
export const TestOutputSchema = z.object({
  testSuite: z.string(),
  tests: z.array(z.object({
    name: z.string(),
    description: z.string(),
    code: z.string(),
    type: z.enum(['unit', 'integration', 'e2e']),
  })),
  coverage: z.object({
    statements: z.number().optional(),
    branches: z.number().optional(),
    functions: z.number().optional(),
    lines: z.number().optional(),
  }).optional(),
  setup: z.string().optional(),
});

// Generic structured output wrapper
export const StructuredOutputSchema = z.object({
  type: z.enum(['code', 'research', 'review', 'design', 'test', 'custom']),
  data: z.unknown(),
  format: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// Export types
export type CodeOutput = z.infer<typeof CodeOutputSchema>;
export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;
export type CodeReviewOutput = z.infer<typeof CodeReviewOutputSchema>;
export type DesignOutput = z.infer<typeof DesignOutputSchema>;
export type TestOutput = z.infer<typeof TestOutputSchema>;
export type StructuredOutput = z.infer<typeof StructuredOutputSchema>;

// Schema registry for dynamic lookup
export const outputSchemas = {
  code: CodeOutputSchema,
  research: ResearchOutputSchema,
  review: CodeReviewOutputSchema,
  design: DesignOutputSchema,
  test: TestOutputSchema,
} as const;

export type OutputType = keyof typeof outputSchemas;
