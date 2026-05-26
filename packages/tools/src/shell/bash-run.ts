import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const bashRunTool = defineTool({
  name: "bash_run",
  title: "Run shell command",
  category: "shell",
  permissions: ["shell:run"],
  timeoutMs: 120_000,
  description: "Run a shell command and return stdout/stderr/exit code. Use for builds, tests, and diagnostics.",
  inputSchema: z.object({
    command: z.string(),
    cwd: z.string().optional(),
    timeoutMs: z.number().int().positive().max(600_000).default(120_000),
    env: z.record(z.string()).optional(),
  }),
  async execute(input, context) {
    const runCommand = requireCapability(context.runtime, "bash_run", "runCommand");
    const options: { cwd?: string; env?: Record<string, string>; timeoutMs?: number; signal?: AbortSignal } = {
      cwd: input.cwd ?? context.cwd,
      timeoutMs: input.timeoutMs,
    };
    if (input.env !== undefined) options.env = input.env;
    if (context.signal !== undefined) options.signal = context.signal;
    return await runCommand(input.command, options);
  },
});
