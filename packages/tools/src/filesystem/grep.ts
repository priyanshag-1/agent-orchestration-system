import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const grepTool = defineTool({
  name: "grep",
  title: "Search file contents",
  category: "filesystem",
  permissions: ["filesystem:read"],
  timeoutMs: 30_000,
  description: "Search text files with a regular expression. Returns file, line number, and matching line.",
  inputSchema: z.object({
    pattern: z.string(),
    cwd: z.string().optional(),
    include: z.array(z.string()).optional(),
    caseSensitive: z.boolean().default(true),
    maxResults: z.number().int().positive().max(10_000).default(500),
  }),
  async execute(input, context) {
    const grep = requireCapability(context.runtime, "grep", "grep");
    const options: { cwd?: string; include?: string[]; maxResults?: number; caseSensitive?: boolean } = {
      cwd: input.cwd ?? context.cwd,
      caseSensitive: input.caseSensitive,
      maxResults: input.maxResults,
    };
    if (input.include !== undefined) options.include = input.include;
    const matches = await grep(input.pattern, options);
    return {
      matches,
      count: matches.length,
      truncated: matches.length >= input.maxResults,
    };
  },
});
