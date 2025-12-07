/**
 * Groq API Provider
 * Fast inference for AI applications
 */

export interface GroqConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  messages: GroqMessage[];
  temperature?: number;
  maxCompletionTokens?: number;
  topP?: number;
  stream?: boolean;
  stop?: string | string[] | null;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: GroqMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Available Groq models
export const GROQ_MODELS = {
  'qwen-qwq-32b': 'qwen-qwq-32b',
  'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'gemma2-9b-it': 'gemma2-9b-it',
} as const;

export type GroqModel = keyof typeof GROQ_MODELS;

export class GroqClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: GroqConfig = {}) {
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://api.groq.com/openai/v1';

    if (!this.apiKey) {
      console.warn('Groq API key not configured');
    }
  }

  /**
   * Create a chat completion
   */
  async createCompletion(options: GroqCompletionOptions): Promise<GroqResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'qwen-qwq-32b',
        messages: options.messages,
        temperature: options.temperature ?? 0.6,
        max_completion_tokens: options.maxCompletionTokens ?? 32768,
        top_p: options.topP ?? 0.95,
        stream: false,
        stop: options.stop ?? null,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a streaming chat completion
   */
  async *createCompletionStream(
    options: GroqCompletionOptions
  ): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'qwen-qwq-32b',
        messages: options.messages,
        temperature: options.temperature ?? 0.6,
        max_completion_tokens: options.maxCompletionTokens ?? 32768,
        top_p: options.topP ?? 0.95,
        stream: true,
        stop: options.stop ?? null,
      }),
    });

    if (!response.ok || !response.body) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }
  }

  /**
   * Simple text completion helper
   */
  async complete(
    prompt: string,
    options: Partial<GroqCompletionOptions> = {}
  ): Promise<string> {
    const response = await this.createCompletion({
      ...options,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Chat with system prompt
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    options: Partial<GroqCompletionOptions> = {}
  ): Promise<string> {
    const response = await this.createCompletion({
      ...options,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }
}

export const groqClient = new GroqClient();
