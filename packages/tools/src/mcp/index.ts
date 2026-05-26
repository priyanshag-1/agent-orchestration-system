import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";

export const mcpQueryTool = defineTool({
  name: "mcp_query",
  title: "List MCP tools",
  category: "mcp",
  permissions: ["mcp:call"],
  description: "List available tools exposed by the configured MCP client.",
  inputSchema: z.object({}),
  async execute(_input, context) {
    if (!context.mcp) throw new Error("No MCP client configured.");
    return {
      tools: await context.mcp.listTools(),
    };
  },
});

export const mcpCallTool = defineTool({
  name: "mcp_call",
  title: "Call MCP tool",
  category: "mcp",
  permissions: ["mcp:call"],
  description: "Call a tool exposed by the configured MCP client.",
  inputSchema: z.object({
    name: z.string(),
    input: z.unknown(),
  }),
  async execute(input, context) {
    if (!context.mcp) throw new Error("No MCP client configured.");
    return await context.mcp.callTool(input.name, input.input as never);
  },
});

export const mcpTools = [mcpQueryTool, mcpCallTool];

