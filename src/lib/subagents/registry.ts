import type { Subagent, SubagentCapability } from '@/types/subagent';

/**
 * Subagent Registry
 * Manages registration and discovery of specialized subagents
 */

export class SubagentRegistry {
  private agents: Map<string, Subagent> = new Map();

  /**
   * Register a subagent
   */
  register(agent: Subagent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Unregister a subagent
   */
  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /**
   * Get a subagent by ID
   */
  get(agentId: string): Subagent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Find subagents by capability
   */
  findByCapability(capability: SubagentCapability): Subagent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Find the best subagent for a set of required capabilities
   */
  findBestMatch(requiredCapabilities: SubagentCapability[]): Subagent | undefined {
    let bestMatch: Subagent | undefined;
    let bestScore = 0;

    for (const agent of this.agents.values()) {
      const score = requiredCapabilities.filter((cap) =>
        agent.capabilities.includes(cap)
      ).length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = agent;
      }
    }

    return bestMatch;
  }

  /**
   * Get all registered subagents
   */
  getAll(): Subagent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Check if a subagent is available
   */
  isAvailable(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    return agent?.status === 'available';
  }
}

export const subagentRegistry = new SubagentRegistry();
