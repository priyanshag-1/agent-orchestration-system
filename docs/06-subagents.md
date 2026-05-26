# 06. Subagents

Subagents are bounded worker agents.

They use the same agent loop as the parent, but with:

- smaller instructions
- fewer tools
- narrower permissions
- specific output contract
- lower step limit

## Why use subagents

Main agents lose focus when they must inspect too much information. Subagents let the coordinator
delegate bounded research, then merge structured results.

## Pattern

```txt
coordinator
  -> create subagent prompt
  -> restrict tool registry
  -> run same agent loop
  -> require structured final output
  -> merge result into parent context
```

## Build your own

You do not need a special runtime. A subagent is just:

```ts
runAgent({
  provider,
  registry: restrictedRegistry,
  context: restrictedContext,
  messages: subagentMessages,
  maxSteps: 12,
});
```

The important part is the restriction. A read subagent should not have write or shell permissions.

