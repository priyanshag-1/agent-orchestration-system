# 03. Tools

Tools in this repo are production-style modules, but each is still portable.

## Core tools

- `read` reads a text file with optional line ranges.
- `ls` lists a directory.
- `glob` finds files by path pattern.
- `grep` searches file contents.
- `write` writes a full file.
- `bash_run` runs commands.
- `bash_background_*` manages long-running processes.
- `git_status`, `git_diff`, `git_commit`, `git_push` wrap Git.
- `github_*` wraps GitHub PR APIs.
- `web_fetch` fetches external URLs.
- `mcp_query` and `mcp_call` bridge MCP servers.
- `lsp_*` bridges semantic code navigation.

## Adding a new tool

1. Pick one clear action.
2. Define the smallest input schema that can express it.
3. Return structured output.
4. Do not read environment variables directly; use `context.env`.
5. Do not call Node APIs directly unless the tool is intentionally runtime-specific.
6. Require the narrowest permission possible.

## Bad tool shape

```txt
name: "do_everything"
permissions: ["*"]
input: freeform string
output: unstructured text
```

## Good tool shape

```txt
name: "github_list_pr_files"
permissions: ["github:read"]
input: owner, repo, pullNumber
output: typed file list
```

