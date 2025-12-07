import type { MCPServer, MCPAction, MCPResponse } from '@/types/mcp';

/**
 * MCP Server Client
 * Handles communication with Model Context Protocol servers
 */

export class MCPClient {
  private servers: Map<string, MCPServer> = new Map();

  constructor(private authToken?: string) {}

  /**
   * Register an MCP server
   */
  registerServer(server: MCPServer): void {
    this.servers.set(server.id, server);
  }

  /**
   * Execute an action on the appropriate MCP server
   */
  async executeAction(action: MCPAction): Promise<MCPResponse> {
    const server = this.servers.get(action.serverId);
    
    if (!server) {
      return {
        success: false,
        error: `MCP server not found: ${action.serverId}`,
      };
    }

    try {
      const response = await fetch(`${server.url}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        },
        body: JSON.stringify({
          action: action.name,
          parameters: action.parameters,
        }),
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available tools from all registered servers
   */
  async getAvailableTools(): Promise<Record<string, string[]>> {
    const tools: Record<string, string[]> = {};
    
    for (const [id, server] of this.servers) {
      try {
        const response = await fetch(`${server.url}/tools`);
        const data = await response.json();
        tools[id] = data.tools || [];
      } catch {
        tools[id] = [];
      }
    }
    
    return tools;
  }
}

export const mcpClient = new MCPClient(process.env.MCP_AUTH_TOKEN);
