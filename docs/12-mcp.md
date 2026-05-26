# 12. MCP Integration

MCP is a way to attach external tools without hardcoding every integration.

This repo exposes:

- `mcp_query`: list available MCP tools
- `mcp_call`: call a selected MCP tool

## Why keep MCP behind tools

The model still needs:

- permission checks
- logging
- redaction
- timeout handling
- normalized errors

Do not let a model call arbitrary external tools without the same controls as native tools.

## Build your own

Create an `McpClient` with:

```ts
listTools(): Promise<ToolSummary[]>
callTool(name, input): Promise<JsonValue>
```

Attach it to `ToolContext`.

