# 13. Building Your Own System

You can build this architecture without using any code from this repository.

## Step 1: Define messages

```ts
type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ToolCall[];
};
```

## Step 2: Define tools

```ts
type Tool = {
  name: string;
  description: string;
  schema: unknown;
  permissions: string[];
  execute(input, context): Promise<unknown>;
};
```

## Step 3: Build the registry

The registry should:

- store tools by name
- validate input
- check permissions
- execute with timeout
- normalize errors

## Step 4: Build runtime adapters

The adapter hides the environment:

```ts
type Runtime = {
  readFile?: (path) => Promise<string>;
  runCommand?: (command) => Promise<CommandResult>;
  fetch?: typeof fetch;
};
```

## Step 5: Build the loop

The loop repeatedly calls the provider and executes tool calls.

## Step 6: Add subagents

Subagents are the same loop with restricted tools.

## Step 7: Add production controls

Add:

- event logs
- redaction
- retries
- cancellation
- rate limits
- background process management
- persistent sessions
- provider usage tracking
- human confirmation for destructive tools

## Step 8: Add product workflows

Examples:

- coding agent
- PR review agent
- repo research agent
- browser automation agent
- customer support agent
- incident response agent

