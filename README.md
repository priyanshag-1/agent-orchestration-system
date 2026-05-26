# Agent Orchestration System

Production-grade reference implementation and tutorial for building agentic coding systems.

This project is intentionally runtime-agnostic. The same orchestration core can run on a
local machine, Docker container, SSH host, browser-only worker, serverless runtime, or a
full sandbox/VM.

## What is inside

- Typed tool runtime with schema validation, permission checks, logging, and redaction.
- Agent loop that supports tool calls, event logs, cancellation, and provider adapters.
- Portable tools for filesystem, shell, Git, GitHub, web fetch, MCP, and LSP-style lookup.
- Subagent patterns for parallel repo reading and review-style workers.
- Runtime adapters that keep tools independent from the execution environment.
- Detailed docs explaining how to build your own system without using this code.

## Package Map

```txt
packages/core          Agent loop, provider contract, events, subagent runner
packages/tool-runtime  Tool registry, schemas, permissions, runtime adapter API
packages/tools         Reusable production-style tools
packages/runtimes      Local/Docker/SSH/browser runtime adapter examples
packages/subagents     Repo-reader and review-worker orchestration patterns
examples               Small runnable integrations
docs                   Architecture and build-your-own tutorials
```

## Quick Start

```bash
pnpm install
pnpm build
```

Read `docs/00-overview.md` first if you want the architecture. Read
`docs/18-building-your-own.md` if you want to implement the concepts from scratch.

## Design Goals

- Provider neutral: OpenAI, Anthropic, Gemini, local models, or any compatible adapter.
- Runtime neutral: no VM requirement.
- Tool-first: every capability is a typed, permissioned tool.
- Subagent-ready: bounded workers can run with restricted tools.
- Production-oriented: cancellation, retries, timeouts, event logs, redaction, and auditability.

"# agent-orchestration-system" 
