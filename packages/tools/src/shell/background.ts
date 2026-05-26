import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

export const bashBackgroundStartTool = defineTool({
  name: "bash_background_start",
  title: "Start background command",
  category: "shell",
  permissions: ["shell:background"],
  description: "Start a long-running command such as a dev server and return its process id.",
  inputSchema: z.object({
    command: z.string(),
    cwd: z.string().optional(),
    env: z.record(z.string()).optional(),
  }),
  async execute(input, context) {
    const startBackgroundCommand = requireCapability(
      context.runtime,
      "bash_background_start",
      "startBackgroundCommand",
    );
    const options: { cwd?: string; env?: Record<string, string> } = {
      cwd: input.cwd ?? context.cwd,
    };
    if (input.env !== undefined) options.env = input.env;
    return await startBackgroundCommand(input.command, options);
  },
});

export const bashBackgroundOutputTool = defineTool({
  name: "bash_background_output",
  title: "Read background output",
  category: "shell",
  permissions: ["shell:background"],
  description: "Read recent output from a background command.",
  inputSchema: z.object({
    id: z.string(),
    sinceBytes: z.number().int().nonnegative().optional(),
    maxBytes: z.number().int().positive().max(500_000).default(50_000),
  }),
  async execute(input, context) {
    const readBackgroundOutput = requireCapability(
      context.runtime,
      "bash_background_output",
      "readBackgroundOutput",
    );
    const options: { sinceBytes?: number; maxBytes?: number } = {
      maxBytes: input.maxBytes,
    };
    if (input.sinceBytes !== undefined) options.sinceBytes = input.sinceBytes;
    return await readBackgroundOutput(input.id, options);
  },
});

export const bashBackgroundKillTool = defineTool({
  name: "bash_background_kill",
  title: "Kill background command",
  category: "shell",
  permissions: ["shell:background"],
  description: "Stop a background command by id.",
  inputSchema: z.object({
    id: z.string(),
  }),
  async execute(input, context) {
    const killBackgroundCommand = requireCapability(
      context.runtime,
      "bash_background_kill",
      "killBackgroundCommand",
    );
    return await killBackgroundCommand(input.id);
  },
});

export const bashBackgroundListTool = defineTool({
  name: "bash_background_list",
  title: "List background commands",
  category: "shell",
  permissions: ["shell:background"],
  description: "List background commands tracked by the runtime.",
  inputSchema: z.object({}),
  async execute(_input, context) {
    const listBackgroundCommands = requireCapability(
      context.runtime,
      "bash_background_list",
      "listBackgroundCommands",
    );
    return {
      processes: await listBackgroundCommands(),
    };
  },
});
