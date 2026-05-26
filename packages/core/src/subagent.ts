import { ToolRegistry, type AnyToolDefinition, type ToolContext } from "@aos/tool-runtime";
import { runAgent, type AgentRunResult } from "./agent-loop.js";
import { createId } from "./id.js";
import type { AgentEventStore } from "./events.js";
import type { AgentMessage, ModelProvider } from "./messages.js";

export type SubagentOptions = {
  provider: ModelProvider;
  parentRunId?: string | undefined;
  name: string;
  instructions: string;
  userPrompt: string;
  context: ToolContext;
  tools: AnyToolDefinition[];
  eventStore?: AgentEventStore | undefined;
  maxSteps?: number;
};

export async function runSubagent(options: SubagentOptions): Promise<AgentRunResult> {
  const registry = new ToolRegistry().registerMany(options.tools);
  const runId = createId(`sub_${options.name}`);
  const messages: AgentMessage[] = [
    {
      id: createId("msg"),
      role: "system",
      content: options.instructions,
    },
    {
      id: createId("msg"),
      role: "user",
      content: options.userPrompt,
    },
  ];

  return await runAgent({
    provider: options.provider,
    registry,
    context: options.context,
    messages,
    eventStore: options.eventStore,
    maxSteps: options.maxSteps ?? 12,
    runId,
    metadata: {
      subagentName: options.name,
      ...(options.parentRunId ? { parentRunId: options.parentRunId } : {}),
    },
  });
}
