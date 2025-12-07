import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { GroqClient, GROQ_MODELS } from './providers/groq';

/**
 * AI Provider Configuration
 * Using Vercel AI SDK's unified provider interface + custom providers
 */

// Vercel AI SDK Providers
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Groq Provider (fast inference)
export const groq = new GroqClient({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model configurations
export const models = {
  // Primary models (Gemini)
  planner: google('gemini-2.0-flash'),
  executor: google('gemini-2.0-flash'),
  
  // Fallback models
  fallback: openai('gpt-4o'),
  
  // Fast inference (Groq)
  fast: {
    provider: 'groq',
    model: GROQ_MODELS['qwen-qwq-32b'],
  },
  
  // Reasoning models
  reasoning: {
    provider: 'groq',
    model: GROQ_MODELS['qwen-qwq-32b'],
    temperature: 0.6,
    maxTokens: 32768,
  },
} as const;

// Provider selection helper
export type Provider = 'google' | 'openai' | 'anthropic' | 'groq';

export function getProvider(name: Provider) {
  switch (name) {
    case 'google':
      return google;
    case 'openai':
      return openai;
    case 'anthropic':
      return anthropic;
    case 'groq':
      return groq;
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
