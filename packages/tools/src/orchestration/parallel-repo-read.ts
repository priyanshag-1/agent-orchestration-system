import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";

export const parallelRepoReadTool = defineTool({
  name: "parallel_repo_read",
  title: "Parallel repo read",
  category: "orchestration",
  permissions: ["filesystem:read"],
  timeoutMs: 180_000,
  description:
    "Delegate focused codebase research questions to parallel read-only subagents and return merged findings with cited files.",
  inputSchema: z.object({
    queries: z
      .array(
        z.object({
          id: z.string().optional(),
          question: z.string(),
          focusPaths: z.array(z.string()).optional(),
        }),
      )
      .min(1)
      .max(12),
    concurrency: z.number().int().positive().max(8).default(4),
  }),
  async execute(input, context) {
    if (!context.orchestration?.parallelRepoRead) {
      throw new Error("parallel_repo_read requires context.orchestration.parallelRepoRead.");
    }

    return await context.orchestration.parallelRepoRead(input, context);
  },
});

