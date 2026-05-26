# 11. Provider Adapters

The core package expects a simple provider contract:

```ts
type ModelProvider = {
  name: string;
  complete(request): Promise<{ message, usage? }>;
};
```

Each provider adapter translates:

- internal messages -> provider message format
- internal tool specs -> provider tool schema
- provider tool calls -> internal `ToolCall[]`
- provider usage -> internal usage metadata

## Build your own

Create one adapter per provider:

- OpenAI Responses adapter
- Anthropic Messages adapter
- Gemini adapter
- local OpenAI-compatible adapter
- custom proxy adapter

Keep provider quirks out of the agent loop.

