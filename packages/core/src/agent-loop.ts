import type { JsonValue, ToolContext, ToolRegistry } from "@aos/tool-runtime";
import { createId } from "./id.js";
import type { AgentEventStore } from "./events.js";
import type { AgentMessage, ModelProvider } from "./messages.js";

export type AgentRunOptions = {
  provider: ModelProvider;
  registry: ToolRegistry;
  context: ToolContext;
  messages: AgentMessage[];
  eventStore?: AgentEventStore | undefined;
  maxSteps?: number;
  runId?: string;
  metadata?: Record<string, JsonValue> | undefined;
};

export type AgentRunResult = {
  runId: string;
  status: "success" | "max_steps" | "aborted" | "error";
  messages: AgentMessage[];
  steps: number;
};

export async function runAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const runId = options.runId ?? createId("run");
  const maxSteps = options.maxSteps ?? 40;
  const messages = [...options.messages];
  const eventStore = options.eventStore;
  const timestamp = () => (options.context.runtime.now?.() ?? new Date()).toISOString();

  await eventStore?.append({
    type: "agent.started",
    runId,
    timestamp: timestamp(),
    metadata: options.metadata,
  });

  for (let step = 0; step < maxSteps; step++) {
    if (options.context.signal?.aborted) {
      await eventStore?.append({
        type: "agent.finished",
        runId,
        timestamp: timestamp(),
        status: "aborted",
      });
      return { runId, status: "aborted", messages, steps: step };
    }

    const response = await options.provider.complete({
      messages,
      tools: options.registry.modelSpecs(),
      signal: options.context.signal,
    });

    messages.push(response.message);
    await eventStore?.append({
      type: "agent.message",
      runId,
      timestamp: timestamp(),
      message: response.message,
    });

    const toolCalls = response.message.toolCalls ?? [];
    if (toolCalls.length === 0) {
      await eventStore?.append({
        type: "agent.finished",
        runId,
        timestamp: timestamp(),
        status: "success",
        metadata: response.usage ? { usage: response.usage as JsonValue } : undefined,
      });
      return { runId, status: "success", messages, steps: step + 1 };
    }

    for (const call of toolCalls) {
      const result = await options.registry.execute(call, options.context);
      await eventStore?.append({
        type: "tool.completed",
        runId,
        timestamp: timestamp(),
        result,
      });
      messages.push({
        id: createId("msg"),
        role: "tool",
        content: result.ok ? JSON.stringify(result.output) : JSON.stringify(result.error),
        toolResult: result,
      });
    }
  }

  await eventStore?.append({
    type: "agent.finished",
    runId,
    timestamp: timestamp(),
    status: "max_steps",
  });

  return { runId, status: "max_steps", messages, steps: maxSteps };
}
