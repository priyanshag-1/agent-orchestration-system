import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const writeTool = defineTool({
  name: "write",
  title: "Write file",
  category: "filesystem",
  permissions: ["filesystem:write"],
  timeoutMs: 10_000,
  description: "Write a full text file. Use patch/edit tools in real products when preserving user edits matters.",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
  async execute(input, context) {
    const writeTextFile = requireCapability(context.runtime, "write", "writeTextFile");
    await writeTextFile(input.path, input.content);
    return {
      path: input.path,
      bytes: Buffer.byteLength(input.content, "utf8"),
    };
  },
});

