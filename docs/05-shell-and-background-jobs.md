# 05. Shell And Background Jobs

Agents need shell access for tests, builds, linters, package installs, and local servers.

Short commands use `bash_run`.

Long commands use:

- `bash_background_start`
- `bash_background_output`
- `bash_background_kill`
- `bash_background_list`

## Why background jobs exist

Without background management, agents block forever on dev servers:

```bash
pnpm dev
```

The correct pattern is:

1. start server in background
2. poll output until ready
3. run smoke tests
4. kill server or leave it running intentionally

## Build your own

Track:

- process id
- command
- cwd
- stdout buffer
- stderr buffer
- status
- exit code
- start time

Expose a stable process id to the model. Never expose raw OS process handles to the model.

