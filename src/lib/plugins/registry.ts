import type {
  Plugin,
  PluginManifest,
  CommandPlugin,
  AgentPlugin,
  HookPlugin,
  SkillPlugin,
  MCPServerPlugin,
  HookEvent,
  PluginContext,
} from '@/types/plugin';

/**
 * Plugin Registry
 * Central registry for all installed plugins
 */

export interface RegisteredPlugin {
  manifest: PluginManifest;
  plugins: Plugin[];
  enabled: boolean;
}

export class PluginRegistry {
  private packages: Map<string, RegisteredPlugin> = new Map();
  private commands: Map<string, CommandPlugin> = new Map();
  private agents: Map<string, AgentPlugin> = new Map();
  private hooks: Map<HookEvent, HookPlugin[]> = new Map();
  private skills: Map<string, SkillPlugin> = new Map();
  private mcpServers: Map<string, MCPServerPlugin> = new Map();

  /**
   * Register a plugin package
   */
  register(manifest: PluginManifest, plugins: Plugin[]): void {
    if (this.packages.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already registered`);
    }

    this.packages.set(manifest.id, {
      manifest,
      plugins,
      enabled: true,
    });

    // Register individual plugins by type
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  /**
   * Register a single plugin
   */
  private registerPlugin(plugin: Plugin): void {
    switch (plugin.type) {
      case 'command':
        this.commands.set(plugin.name, plugin);
        break;
      case 'agent':
        this.agents.set(plugin.id, plugin);
        break;
      case 'hook':
        for (const event of plugin.events) {
          const hooks = this.hooks.get(event) || [];
          hooks.push(plugin);
          // Sort by priority
          hooks.sort((a, b) => (a.priority || 100) - (b.priority || 100));
          this.hooks.set(event, hooks);
        }
        break;
      case 'skill':
        this.skills.set(plugin.name, plugin);
        break;
      case 'mcp-server':
        this.mcpServers.set(plugin.id, plugin);
        break;
    }
  }

  /**
   * Unregister a plugin package
   */
  unregister(pluginId: string): boolean {
    const pkg = this.packages.get(pluginId);
    if (!pkg) return false;

    for (const plugin of pkg.plugins) {
      this.unregisterPlugin(plugin);
    }

    this.packages.delete(pluginId);
    return true;
  }

  /**
   * Unregister a single plugin
   */
  private unregisterPlugin(plugin: Plugin): void {
    switch (plugin.type) {
      case 'command':
        this.commands.delete(plugin.name);
        break;
      case 'agent':
        this.agents.delete(plugin.id);
        break;
      case 'hook':
        for (const event of plugin.events) {
          const hooks = this.hooks.get(event) || [];
          this.hooks.set(
            event,
            hooks.filter((h) => h !== plugin)
          );
        }
        break;
      case 'skill':
        this.skills.delete(plugin.name);
        break;
      case 'mcp-server':
        this.mcpServers.delete(plugin.id);
        break;
    }
  }

  /**
   * Enable/disable a plugin package
   */
  setEnabled(pluginId: string, enabled: boolean): boolean {
    const pkg = this.packages.get(pluginId);
    if (!pkg) return false;
    pkg.enabled = enabled;
    return true;
  }

  // Getters
  getCommand(name: string): CommandPlugin | undefined {
    return this.commands.get(name);
  }

  getAgent(id: string): AgentPlugin | undefined {
    return this.agents.get(id);
  }

  getHooks(event: HookEvent): HookPlugin[] {
    return this.hooks.get(event) || [];
  }

  getSkill(name: string): SkillPlugin | undefined {
    return this.skills.get(name);
  }

  getMCPServer(id: string): MCPServerPlugin | undefined {
    return this.mcpServers.get(id);
  }

  // List all
  listCommands(): CommandPlugin[] {
    return Array.from(this.commands.values());
  }

  listAgents(): AgentPlugin[] {
    return Array.from(this.agents.values());
  }

  listSkills(): SkillPlugin[] {
    return Array.from(this.skills.values());
  }

  listMCPServers(): MCPServerPlugin[] {
    return Array.from(this.mcpServers.values());
  }

  listPackages(): RegisteredPlugin[] {
    return Array.from(this.packages.values());
  }

  /**
   * Execute hooks for an event
   */
  async executeHooks(
    event: HookEvent,
    data: unknown,
    context: PluginContext
  ): Promise<void> {
    const hooks = this.getHooks(event);
    for (const hook of hooks) {
      try {
        await hook.handler(event, data, context);
      } catch (error) {
        context.logger.error(`Hook error for ${event}:`, error);
      }
    }
  }
}

export const pluginRegistry = new PluginRegistry();
