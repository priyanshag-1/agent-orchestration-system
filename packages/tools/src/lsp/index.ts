import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";

export const lspSymbolsTool = defineTool({
  name: "lsp_symbols",
  title: "List symbols",
  category: "lsp",
  permissions: ["lsp:read"],
  description: "List symbols for a source file using the configured LSP client.",
  inputSchema: z.object({ path: z.string() }),
  async execute(input, context) {
    if (!context.lsp) throw new Error("No LSP client configured.");
    return await context.lsp.symbols(input.path);
  },
});

export const lspReferencesTool = defineTool({
  name: "lsp_references",
  title: "Find references",
  category: "lsp",
  permissions: ["lsp:read"],
  description: "Find references to a symbol using the configured LSP client.",
  inputSchema: z.object({
    path: z.string(),
    symbol: z.string(),
  }),
  async execute(input, context) {
    if (!context.lsp) throw new Error("No LSP client configured.");
    return await context.lsp.references(input.path, input.symbol);
  },
});

export const lspDefinitionTool = defineTool({
  name: "lsp_definition",
  title: "Go to definition",
  category: "lsp",
  permissions: ["lsp:read"],
  description: "Find a symbol definition using the configured LSP client.",
  inputSchema: z.object({
    path: z.string(),
    symbol: z.string(),
  }),
  async execute(input, context) {
    if (!context.lsp) throw new Error("No LSP client configured.");
    return await context.lsp.definition(input.path, input.symbol);
  },
});

export const lspTools = [lspSymbolsTool, lspReferencesTool, lspDefinitionTool];

