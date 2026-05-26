import type { JsonValue, ToolExecution } from "@aos/tool-runtime";
import type { AgentMessage } from "./messages.js";

export type AgentEvent =
  | {
      type: "agent.started";
      runId: string;
      timestamp: string;
      metadata?: Record<string, JsonValue> | undefined;
    }
  | {
      type: "agent.message";
      runId: string;
      timestamp: string;
      message: AgentMessage;
    }
  | {
      type: "tool.completed";
      runId: string;
      timestamp: string;
      result: ToolExecution;
    }
  | {
      type: "agent.finished";
      runId: string;
      timestamp: string;
      status: "success" | "max_steps" | "aborted" | "error";
      metadata?: Record<string, JsonValue> | undefined;
    };

export type AgentEventStore = {
  append: (event: AgentEvent) => Promise<void>;
  list: (runId: string) => Promise<AgentEvent[]>;
};

export class InMemoryEventStore implements AgentEventStore {
  private readonly events: AgentEvent[] = [];

  async append(event: AgentEvent): Promise<void> {
    this.events.push(event);
  }

  async list(runId: string): Promise<AgentEvent[]> {
    return this.events.filter((event) => event.runId === runId);
  }
}
