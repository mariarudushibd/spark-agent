/**
 * MCP (Model Context Protocol) Types
 * Defines interfaces for MCP server communication
 */

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  description?: string;
  capabilities?: string[];
}

export interface MCPAction {
  serverId: string;
  name: string;
  parameters: Record<string, unknown>;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
    }>;
    required?: string[];
  };
}
