import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const listTool = defineTool({
  name: "ls",
  title: "List directory",
  category: "filesystem",
  permissions: ["filesystem:read"],
  timeoutMs: 10_000,
  description: "List files and folders at a path.",
  inputSchema: z.object({
    path: z.string().default("."),
  }),
  async execute(input, context) {
    const listDirectory = requireCapability(context.runtime, "ls", "listDirectory");
    const entries = await listDirectory(input.path);
    return {
      path: input.path,
      entries,
    };
  },
});

