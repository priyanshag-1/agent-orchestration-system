# 10. Security

Agent tools are dangerous unless controlled.

## Required controls

- permission checks per tool
- runtime path boundaries
- secret redaction
- command timeouts
- cancellation
- network allow/block lists where needed
- audit logs
- separate read-only and write-capable subagents
- human confirmation for destructive actions

## Filesystem safety

Runtimes should prevent path escape:

```txt
runtime root: /workspace/project
blocked path: ../../.ssh/id_rsa
```

## Secrets

Tools should not print secrets. Logs should redact:

- API keys
- tokens
- passwords
- private keys
- client secrets

## Build your own

Make permissions explicit. Do not use one global `canUseTools` boolean.

