import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

/**
 * AI Provider Configuration
 * Using Vercel AI SDK's unified provider interface
 */

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model configurations
export const models = {
  planner: google('gemini-2.0-flash'),
  executor: google('gemini-2.0-flash'),
  fallback: openai('gpt-4o'),
} as const;
