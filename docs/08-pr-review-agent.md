# 08. PR Review Agent

A PR review agent is a specialized workflow, not just a chat prompt.

## Data needed

- PR metadata
- changed files
- diff
- existing comments
- CI/check status
- repository rules
- review policy

## Flow

```txt
fetch PR overview
  -> inspect changed files
  -> delegate review groups if needed
  -> collect findings
  -> dedupe findings
  -> decide review outcome
  -> post review/comment
```

## What to review

Prioritize:

- auth bypasses
- data loss
- broken migrations
- concurrency bugs
- secret exposure
- billing/idempotency bugs
- unsafe command execution
- missing tests only when tests catch real risk

## Build your own

You need tools for:

- `github_get_pr`
- `github_list_pr_files`
- `git_diff`
- `read`
- `grep`
- `github_create_review`

Then add a finding schema:

```ts
type Finding = {
  severity: "critical" | "high" | "medium" | "low";
  file: string;
  line?: number;
  title: string;
  body: string;
};
```

