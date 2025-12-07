import { promises as fs } from 'fs';
import path from 'path';
import type { Plugin, PluginManifest, PluginContext } from '@/types/plugin';
import { pluginRegistry } from './registry';

/**
 * Plugin Loader
 * Discovers and loads plugins from the plugins directory
 */

const DEFAULT_PLUGINS_DIR = '.spark/plugins';

export interface LoaderOptions {
  pluginsDir?: string;
  autoEnable?: boolean;
}

/**
 * Load all plugins from the plugins directory
 */
export async function loadPlugins(
  options: LoaderOptions = {}
): Promise<PluginManifest[]> {
  const pluginsDir = options.pluginsDir || DEFAULT_PLUGINS_DIR;
  const manifests: PluginManifest[] = [];

  try {
    const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
    const pluginDirs = entries.filter((e) => e.isDirectory());

    for (const dir of pluginDirs) {
      try {
        const manifest = await loadPlugin(
          path.join(pluginsDir, dir.name),
          options
        );
        if (manifest) {
          manifests.push(manifest);
        }
      } catch (error) {
        console.warn(`Failed to load plugin: ${dir.name}`, error);
      }
    }
  } catch (error) {
    console.debug(`Plugins directory not found: ${pluginsDir}`);
  }

  return manifests;
}

/**
 * Load a single plugin from a directory
 */
export async function loadPlugin(
  pluginPath: string,
  options: LoaderOptions = {}
): Promise<PluginManifest | null> {
  const manifestPath = path.join(pluginPath, 'manifest.json');

  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest: PluginManifest = JSON.parse(content);

    // Validate manifest
    if (!validateManifest(manifest)) {
      console.warn(`Invalid manifest: ${manifestPath}`);
      return null;
    }

    // Load plugin modules
    const plugins = await loadPluginModules(pluginPath, manifest);

    // Register with the registry
    pluginRegistry.register(manifest, plugins);

    return manifest;
  } catch (error) {
    console.warn(`Failed to load manifest: ${manifestPath}`, error);
    return null;
  }
}

/**
 * Load plugin modules based on manifest
 */
async function loadPluginModules(
  pluginPath: string,
  manifest: PluginManifest
): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  const indexPath = path.join(pluginPath, 'index.js');

  try {
    // Dynamic import of the plugin module
    const module = await import(indexPath);

    // Plugin can export individual plugins or a setup function
    if (typeof module.default === 'function') {
      // Setup function that returns plugins
      const result = await module.default();
      if (Array.isArray(result)) {
        plugins.push(...result);
      } else if (result) {
        plugins.push(result);
      }
    } else if (module.plugins) {
      // Direct plugins export
      plugins.push(...module.plugins);
    } else if (module.default) {
      // Single plugin export
      plugins.push(module.default);
    }
  } catch (error) {
    console.warn(`Failed to load plugin module: ${indexPath}`, error);
  }

  return plugins;
}

/**
 * Validate a plugin manifest
 */
function validateManifest(manifest: unknown): manifest is PluginManifest {
  if (!manifest || typeof manifest !== 'object') return false;

  const m = manifest as Record<string, unknown>;

  if (typeof m.id !== 'string' || !m.id) return false;
  if (typeof m.name !== 'string' || !m.name) return false;
  if (typeof m.version !== 'string' || !m.version) return false;
  if (!Array.isArray(m.provides)) return false;

  return true;
}

/**
 * Create plugin context for execution
 */
export function createPluginContext(
  config: Record<string, unknown> = {}
): PluginContext {
  return {
    spark: {
      version: '1.0.0',
      config,
    },
    logger: {
      debug: (msg, ...args) => console.debug(`[Plugin] ${msg}`, ...args),
      info: (msg, ...args) => console.info(`[Plugin] ${msg}`, ...args),
      warn: (msg, ...args) => console.warn(`[Plugin] ${msg}`, ...args),
      error: (msg, ...args) => console.error(`[Plugin] ${msg}`, ...args),
    },
    storage: createPluginStorage(),
    api: {
      registerCommand: (cmd) => pluginRegistry.register(
        { id: `dynamic-${cmd.name}`, name: cmd.name, version: '1.0.0', description: '', provides: ['command'] },
        [cmd]
      ),
      registerAgent: (agent) => pluginRegistry.register(
        { id: `dynamic-${agent.id}`, name: agent.name, version: '1.0.0', description: '', provides: ['agent'] },
        [agent]
      ),
      registerHook: (hook) => pluginRegistry.register(
        { id: `dynamic-hook-${Date.now()}`, name: 'Hook', version: '1.0.0', description: '', provides: ['hook'] },
        [hook]
      ),
      registerSkill: (skill) => pluginRegistry.register(
        { id: `dynamic-${skill.name}`, name: skill.name, version: '1.0.0', description: '', provides: ['skill'] },
        [skill]
      ),
      registerMCPServer: (server) => pluginRegistry.register(
        { id: `dynamic-${server.id}`, name: server.name, version: '1.0.0', description: '', provides: ['mcp-server'] },
        [server]
      ),
    },
  };
}

/**
 * Create plugin storage (in-memory, can be replaced with persistent storage)
 */
function createPluginStorage() {
  const store = new Map<string, unknown>();

  return {
    get: async <T>(key: string): Promise<T | undefined> => {
      return store.get(key) as T | undefined;
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      store.set(key, value);
    },
    delete: async (key: string): Promise<void> => {
      store.delete(key);
    },
    clear: async (): Promise<void> => {
      store.clear();
    },
  };
}
