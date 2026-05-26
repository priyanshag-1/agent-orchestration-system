# 09. Events And Replay

Event logs make agent systems debuggable.

Every run should record:

- run started
- model request/response metadata
- assistant messages
- tool calls
- tool results
- errors
- run finished

## Why replay matters

When an agent gets stuck, you need to answer:

- Which tool call failed?
- What did the model see before it failed?
- Was the tool input invalid?
- Did the runtime timeout?
- Did a permission gate reject the action?

## Build your own

Start with append-only events:

```ts
type Event =
  | { type: "agent.started" }
  | { type: "agent.message" }
  | { type: "tool.completed" }
  | { type: "agent.finished" };
```

Store them in memory first. Later move to SQLite, Postgres, ClickHouse, S3, or any event store.

