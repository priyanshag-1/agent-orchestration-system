import { createStaticProvider } from "@aos/core";
import { createLocalRuntime } from "@aos/runtimes";
import { runRepoReader } from "@aos/subagents";

const runtime = createLocalRuntime({ cwd: process.cwd() });

const provider = createStaticProvider(
  JSON.stringify({
    summary: "Replace createStaticProvider with a real model provider to run repo reading.",
    files: [],
    confidence: "low",
  }),
);

const report = await runRepoReader({
  provider,
  context: {
    runtime,
    cwd: runtime.cwd,
    env: process.env,
    permissions: new Set(["filesystem:read"]),
  },
  queries: [
    {
      id: "architecture",
      question: "What are the main runtime boundaries?",
    },
    {
      id: "tools",
      question: "Where are tools defined and registered?",
    },
  ],
});

console.log(report.mergedSummary);

