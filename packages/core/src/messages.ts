import type { JsonValue, ToolCall, ToolExecution, ToolModelSpec } from "@aos/tool-runtime";

export type AgentRole = "system" | "user" | "assistant" | "tool";

export type AgentMessage = {
  id: string;
  role: AgentRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResult?: ToolExecution;
  metadata?: Record<string, JsonValue>;
};

export type ProviderRequest = {
  messages: AgentMessage[];
  tools: ToolModelSpec[];
  signal?: AbortSignal | undefined;
};

export type ProviderResponse = {
  message: AgentMessage;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
  };
};

export type ModelProvider = {
  name: string;
  complete: (request: ProviderRequest) => Promise<ProviderResponse>;
};
