import { defineTool } from "@aos/tool-runtime";
import type { RuntimeAdapter } from "@aos/tool-runtime";
import { z } from "zod";
import { requireCapability } from "../helpers.js";

async function git(command: string, toolName: string, cwd: string, context: { runtime: RuntimeAdapter }) {
  const runCommand = requireCapability(context.runtime, toolName, "runCommand");
  return await runCommand(`git ${command}`, { cwd, timeoutMs: 120_000 });
}

export const gitStatusTool = defineTool({
  name: "git_status",
  title: "Git status",
  category: "git",
  permissions: ["git:read"],
  description: "Get short Git status and current branch.",
  inputSchema: z.object({ cwd: z.string().optional() }),
  async execute(input, context) {
    return await git("status --short --branch", "git_status", input.cwd ?? context.cwd, context);
  },
});

export const gitDiffTool = defineTool({
  name: "git_diff",
  title: "Git diff",
  category: "git",
  permissions: ["git:read"],
  description: "Get Git diff for the current branch or a base ref.",
  inputSchema: z.object({
    cwd: z.string().optional(),
    base: z.string().optional(),
    stat: z.boolean().default(false),
  }),
  async execute(input, context) {
    const args = input.stat ? "diff --stat" : "diff";
    return await git(`${args}${input.base ? ` ${input.base}` : ""}`, "git_diff", input.cwd ?? context.cwd, context);
  },
});

export const gitCommitTool = defineTool({
  name: "git_commit",
  title: "Git commit",
  category: "git",
  permissions: ["git:write"],
  description: "Commit all staged changes with a message.",
  inputSchema: z.object({
    cwd: z.string().optional(),
    message: z.string(),
  }),
  async execute(input, context) {
    return await git(`commit -m ${JSON.stringify(input.message)}`, "git_commit", input.cwd ?? context.cwd, context);
  },
});

export const gitPushTool = defineTool({
  name: "git_push",
  title: "Git push",
  category: "git",
  permissions: ["git:write"],
  description: "Push the current branch.",
  inputSchema: z.object({
    cwd: z.string().optional(),
    remote: z.string().default("origin"),
    branch: z.string().optional(),
  }),
  async execute(input, context) {
    return await git(
      `push ${input.remote}${input.branch ? ` ${input.branch}` : ""}`,
      "git_push",
      input.cwd ?? context.cwd,
      context,
    );
  },
});

export const gitTools = [gitStatusTool, gitDiffTool, gitCommitTool, gitPushTool];
