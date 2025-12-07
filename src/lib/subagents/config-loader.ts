import { promises as fs } from 'fs';
import path from 'path';
import type { SubagentConfig, Subagent } from '@/types/subagent';

/**
 * Subagent Configuration Loader
 * 
 * Loads subagent definitions from .gemini/agents directory
 * Each subagent is defined in a separate .json or .yaml file
 */

const DEFAULT_AGENTS_DIR = '.gemini/agents';

export interface LoaderOptions {
  agentsDir?: string;
  validateSchema?: boolean;
}

/**
 * Load all subagent configurations from the agents directory
 */
export async function loadSubagentConfigs(
  options: LoaderOptions = {}
): Promise<SubagentConfig[]> {
  const agentsDir = options.agentsDir || DEFAULT_AGENTS_DIR;
  const configs: SubagentConfig[] = [];

  try {
    const files = await fs.readdir(agentsDir);
    const configFiles = files.filter(
      (f) => f.endsWith('.json') || f.endsWith('.yaml') || f.endsWith('.yml')
    );

    for (const file of configFiles) {
      try {
        const config = await loadConfigFile(path.join(agentsDir, file));
        if (config && validateConfig(config)) {
          configs.push(config);
        }
      } catch (error) {
        console.warn(`Failed to load subagent config: ${file}`, error);
      }
    }
  } catch (error) {
    // Directory doesn't exist or is not readable
    console.debug(`Agents directory not found: ${agentsDir}`);
  }

  return configs;
}

/**
 * Load a single config file
 */
async function loadConfigFile(filePath: string): Promise<SubagentConfig | null> {
  const content = await fs.readFile(filePath, 'utf-8');

  if (filePath.endsWith('.json')) {
    return JSON.parse(content);
  }

  // For YAML files, would need yaml parser
  // For now, only support JSON
  console.warn(`YAML config files not yet supported: ${filePath}`);
  return null;
}

/**
 * Validate a subagent configuration
 */
function validateConfig(config: unknown): config is SubagentConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;

  // Required fields
  if (typeof c.id !== 'string' || !c.id) return false;
  if (typeof c.name !== 'string' || !c.name) return false;
  if (typeof c.description !== 'string') return false;
  if (typeof c.systemPrompt !== 'string') return false;
  if (!Array.isArray(c.capabilities)) return false;

  return true;
}

/**
 * Convert a config to a runtime subagent
 */
export function configToSubagent(config: SubagentConfig): Subagent {
  return {
    ...config,
    status: 'available',
  };
}

/**
 * Watch for config file changes (for hot reloading)
 */
export async function watchConfigs(
  callback: (configs: SubagentConfig[]) => void,
  options: LoaderOptions = {}
): Promise<() => void> {
  const agentsDir = options.agentsDir || DEFAULT_AGENTS_DIR;

  // Initial load
  const initialConfigs = await loadSubagentConfigs(options);
  callback(initialConfigs);

  // Watch for changes
  const watcher = fs.watch(agentsDir, async () => {
    const configs = await loadSubagentConfigs(options);
    callback(configs);
  });

  // Return cleanup function
  return async () => {
    (await watcher).close();
  };
}
