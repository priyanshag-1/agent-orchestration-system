# 07. Parallel Repo Reader

The parallel repo reader is the most useful orchestration pattern in this repository.

It solves this problem:

> A main agent needs to understand a large codebase quickly without reading hundreds of files into
> the main context.

## Flow

```txt
main agent asks 3-10 focused questions
  -> repo-reader runs one read-only subagent per question
  -> each worker uses grep/glob/read
  -> each worker returns compact structured findings
  -> parent merges summaries and cited files
```

## Worker restrictions

Repo-reader workers should only have:

- `filesystem:read`
- `ls`
- `glob`
- `grep`
- `read`

No shell. No write. No network. No Git push.

## Build your own

1. Accept `queries: string[]`.
2. For each query, spawn a read-only subagent.
3. Limit concurrency to avoid IO spikes.
4. Require JSON output with summary, files, ranges, confidence.
5. Merge duplicate file references.
6. Keep only high-value snippets in parent context.

## Production notes

- Add per-worker timeout.
- Add max files read per worker.
- Add max bytes read per worker.
- Add confidence scoring.
- Deduplicate file ranges before returning to the coordinator.

