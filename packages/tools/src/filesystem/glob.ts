import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const globTool = defineTool({
  name: "glob",
  title: "Find files",
  category: "filesystem",
  permissions: ["filesystem:read"],
  timeoutMs: 20_000,
  description: "Find files by glob-like path patterns. Use before reading large repositories.",
  inputSchema: z.object({
    patterns: z.array(z.string()).min(1),
    cwd: z.string().optional(),
    maxResults: z.number().int().positive().max(10_000).default(500),
  }),
  async execute(input, context) {
    const findFiles = requireCapability(context.runtime, "glob", "findFiles");
    const files = await findFiles(input.patterns, {
      cwd: input.cwd ?? context.cwd,
      maxResults: input.maxResults,
    });
    return {
      files,
      count: files.length,
      truncated: files.length >= input.maxResults,
    };
  },
});

