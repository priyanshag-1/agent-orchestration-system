import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const readTool = defineTool({
  name: "read",
  title: "Read file",
  category: "filesystem",
  permissions: ["filesystem:read"],
  timeoutMs: 10_000,
  description:
    "Read a text file from the current runtime. Supports optional line ranges and byte limits for large files.",
  inputSchema: z.object({
    path: z.string(),
    startLine: z.number().int().positive().optional(),
    endLine: z.number().int().positive().optional(),
    maxBytes: z.number().int().positive().max(1_000_000).optional(),
  }),
  async execute(input, context) {
    const readTextFile = requireCapability(context.runtime, "read", "readTextFile");
    const content = await readTextFile(input.path, input.maxBytes === undefined ? undefined : { maxBytes: input.maxBytes });
    const lines = content.split(/\r?\n/);
    const start = input.startLine ? Math.max(0, input.startLine - 1) : 0;
    const end = input.endLine ? Math.min(lines.length, input.endLine) : lines.length;
    return {
      path: input.path,
      startLine: start + 1,
      endLine: end,
      content: lines.slice(start, end).join("\n"),
      truncated: input.maxBytes !== undefined && content.length >= input.maxBytes,
    };
  },
});
