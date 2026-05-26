# 00. Overview

This repository teaches an agent orchestration system as a set of reusable runtime primitives.
It does not require a VM, hosted sandbox, browser session, or specific LLM provider.

## Mental model

An agent system is a loop:

```txt
user request
  -> provider receives messages + tool specs
  -> provider returns assistant text and/or tool calls
  -> tool runtime validates and executes calls
  -> tool results are appended as messages
  -> loop repeats until done
```

Production systems need more than that loop:

- tool schemas
- permission checks
- runtime adapters
- event logging
- retries and timeouts
- cancellation
- subagents
- background processes
- file mutation controls
- provider adapters
- audit trails

## Package responsibilities

`@aos/tool-runtime` owns tool definitions, validation, permission checks, runtime capabilities,
redaction, and execution.

`@aos/core` owns the provider-neutral agent loop, messages, event logs, and subagent runner.

`@aos/tools` owns concrete tools. Tools are portable because they call runtime capabilities, not
Node, Docker, SSH, or browser APIs directly.

`@aos/runtimes` owns adapters for specific environments.

`@aos/subagents` owns orchestration patterns that run bounded worker agents with restricted tools.

## Build your own

If you do not want to use this code, implement the same layers in this order:

1. Define a `Tool` type with name, schema, description, permissions, and `execute`.
2. Build a `ToolRegistry` that validates input and checks permissions.
3. Define a `RuntimeAdapter` so tools do not depend on one execution environment.
4. Build an agent loop that calls a model, executes tool calls, and appends tool results.
5. Add event logging around every model call and tool call.
6. Add subagents by reusing the same loop with restricted tools and smaller prompts.

