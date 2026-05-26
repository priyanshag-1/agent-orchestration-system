import type { ModelProvider } from "@aos/core";
import { runSubagent } from "@aos/core";
import type { ToolContext } from "@aos/tool-runtime";
import { globTool, grepTool, listTool, readTool } from "@aos/tools";
import type { RepoReaderFinding, RepoReaderQuery, RepoReaderReport } from "./types.js";

const repoReaderInstructions = `
You are a focused read-only codebase research worker.

Rules:
- Do not edit files.
- Prefer grep/glob before reading many files.
- Answer only the assigned question.
- Cite files and line ranges when useful.
- End with compact JSON containing: summary, files, confidence.
`;

export type RunRepoReaderOptions = {
  provider: ModelProvider;
  context: ToolContext;
  queries: RepoReaderQuery[];
  parentRunId?: string;
  concurrency?: number;
};

export async function runRepoReader(options: RunRepoReaderOptions): Promise<RepoReaderReport> {
  const concurrency = options.concurrency ?? 4;
  const findings: RepoReaderFinding[] = [];

  for (let index = 0; index < options.queries.length; index += concurrency) {
    const batch = options.queries.slice(index, index + concurrency);
    const batchFindings = await Promise.all(
      batch.map(async (query) => {
        const result = await runSubagent({
          provider: options.provider,
          parentRunId: options.parentRunId,
          name: "repo_reader",
          instructions: repoReaderInstructions,
          userPrompt: buildQueryPrompt(query),
          context: restrictReadOnly(options.context),
          tools: [listTool, globTool, grepTool, readTool],
          maxSteps: 12,
        });
        return parseFinding(query.id, result.messages.at(-1)?.content ?? "");
      }),
    );
    findings.push(...batchFindings);
  }

  return {
    findings,
    mergedSummary: findings.map((finding) => `- ${finding.summary}`).join("\n"),
  };
}

function restrictReadOnly(context: ToolContext): ToolContext {
  return {
    ...context,
    permissions: new Set(["filesystem:read"]),
  };
}

function buildQueryPrompt(query: RepoReaderQuery): string {
  return [
    `Question: ${query.question}`,
    query.focusPaths?.length ? `Focus paths: ${query.focusPaths.join(", ")}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseFinding(queryId: string, content: string): RepoReaderFinding {
  const jsonStart = content.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(content.slice(jsonStart)) as Partial<RepoReaderFinding>;
      return {
        queryId,
        summary: parsed.summary ?? content,
        files: parsed.files ?? [],
        confidence: parsed.confidence ?? "medium",
      };
    } catch {
      // Fall through to text summary.
    }
  }

  return {
    queryId,
    summary: content.trim(),
    files: [],
    confidence: "medium",
  };
}

