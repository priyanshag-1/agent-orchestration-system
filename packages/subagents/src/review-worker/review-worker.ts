import type { ModelProvider } from "@aos/core";
import { runSubagent } from "@aos/core";
import type { ToolContext } from "@aos/tool-runtime";
import { gitDiffTool, grepTool, readTool } from "@aos/tools";
import type { ReviewFinding, ReviewWorkerReport } from "./types.js";

const reviewWorkerInstructions = `
You are a code review worker.

Review stance:
- Prioritize correctness, security, data loss, auth, concurrency, and missing high-value tests.
- Do not comment on style unless it causes a real bug.
- Return compact JSON: { "summary": string, "findings": ReviewFinding[] }.
`;

export async function runReviewWorker(options: {
  provider: ModelProvider;
  context: ToolContext;
  base?: string;
  parentRunId?: string;
}): Promise<ReviewWorkerReport> {
  const result = await runSubagent({
    provider: options.provider,
    parentRunId: options.parentRunId,
    name: "review_worker",
    instructions: reviewWorkerInstructions,
    userPrompt: `Review the current branch${options.base ? ` against ${options.base}` : ""}.`,
    context: {
      ...options.context,
      permissions: new Set(["filesystem:read", "git:read"]),
    },
    tools: [gitDiffTool, grepTool, readTool],
    maxSteps: 20,
  });

  return parseReport(result.messages.at(-1)?.content ?? "");
}

function parseReport(content: string): ReviewWorkerReport {
  const jsonStart = content.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(content.slice(jsonStart)) as Partial<ReviewWorkerReport>;
      return {
        summary: parsed.summary ?? "",
        findings: normalizeFindings(parsed.findings ?? []),
      };
    } catch {
      // Fall through.
    }
  }

  return {
    summary: content.trim(),
    findings: [],
  };
}

function normalizeFindings(findings: unknown[]): ReviewFinding[] {
  return findings.flatMap((finding) => {
    if (!finding || typeof finding !== "object") return [];
    const value = finding as Partial<ReviewFinding>;
    if (!value.title || !value.file || !value.severity || !value.body) return [];
    return [
      {
        title: value.title,
        severity: value.severity,
        file: value.file,
        ...(value.line === undefined ? {} : { line: value.line }),
        body: value.body,
      },
    ];
  });
}

