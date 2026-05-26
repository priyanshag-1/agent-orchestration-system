import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";

const repoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  tokenEnv: z.string().default("GITHUB_TOKEN"),
});

async function githubRequest(path: string, token: string | undefined, init?: RequestInit) {
  if (!token) throw new Error("Missing GitHub token.");
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

export const githubGetPrTool = defineTool({
  name: "github_get_pr",
  title: "Get GitHub PR",
  category: "github",
  permissions: ["github:read"],
  description: "Fetch GitHub pull request metadata.",
  inputSchema: repoSchema.extend({
    pullNumber: z.number().int().positive(),
  }),
  async execute(input, context) {
    return await githubRequest(
      `/repos/${input.owner}/${input.repo}/pulls/${input.pullNumber}`,
      context.env[input.tokenEnv],
    );
  },
});

export const githubListPrFilesTool = defineTool({
  name: "github_list_pr_files",
  title: "List GitHub PR files",
  category: "github",
  permissions: ["github:read"],
  description: "List changed files in a GitHub pull request.",
  inputSchema: repoSchema.extend({
    pullNumber: z.number().int().positive(),
  }),
  async execute(input, context) {
    return await githubRequest(
      `/repos/${input.owner}/${input.repo}/pulls/${input.pullNumber}/files`,
      context.env[input.tokenEnv],
    );
  },
});

export const githubCreateReviewTool = defineTool({
  name: "github_create_review",
  title: "Create GitHub PR review",
  category: "github",
  permissions: ["github:write"],
  description: "Create a pull request review with event APPROVE, REQUEST_CHANGES, or COMMENT.",
  inputSchema: repoSchema.extend({
    pullNumber: z.number().int().positive(),
    body: z.string(),
    event: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]).default("COMMENT"),
  }),
  async execute(input, context) {
    return await githubRequest(
      `/repos/${input.owner}/${input.repo}/pulls/${input.pullNumber}/reviews`,
      context.env[input.tokenEnv],
      {
        method: "POST",
        body: JSON.stringify({ body: input.body, event: input.event }),
      },
    );
  },
});

export const githubTools = [githubGetPrTool, githubListPrFilesTool, githubCreateReviewTool];

