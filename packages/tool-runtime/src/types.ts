import type { z } from "zod";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ToolPermission =
  | "filesystem:read"
  | "filesystem:write"
  | "shell:run"
  | "shell:background"
  | "network:fetch"
  | "git:read"
  | "git:write"
  | "github:read"
  | "github:write"
  | "mcp:call"
  | "lsp:read"
  | "browser:control"
  | (string & {});

export type ToolCategory =
  | "filesystem"
  | "shell"
  | "git"
  | "github"
  | "web"
  | "mcp"
  | "lsp"
  | "browser"
  | "orchestration"
  | "review"
  | "custom";

export type CommandResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
};

export type BackgroundProcess = {
  id: string;
  command: string;
  cwd: string;
  startedAt: string;
  status: "running" | "exited" | "killed";
  exitCode?: number | null;
};

export type DirectoryEntry = {
  name: string;
  path: string;
  type: "file" | "directory" | "symlink" | "other";
};

export type GrepMatch = {
  file: string;
  line: number;
  text: string;
};

export type RuntimeAdapter = {
  name: string;
  cwd: string;
  now?: () => Date;
  readTextFile?: (path: string, options?: { maxBytes?: number }) => Promise<string>;
  writeTextFile?: (path: string, content: string) => Promise<void>;
  listDirectory?: (path: string) => Promise<DirectoryEntry[]>;
  findFiles?: (patterns: string[], options?: { cwd?: string; maxResults?: number }) => Promise<string[]>;
  grep?: (
    pattern: string,
    options?: { cwd?: string; include?: string[]; maxResults?: number; caseSensitive?: boolean },
  ) => Promise<GrepMatch[]>;
  runCommand?: (
    command: string,
    options?: { cwd?: string; env?: Record<string, string>; timeoutMs?: number; signal?: AbortSignal },
  ) => Promise<CommandResult>;
  startBackgroundCommand?: (
    command: string,
    options?: { cwd?: string; env?: Record<string, string> },
  ) => Promise<BackgroundProcess>;
  readBackgroundOutput?: (id: string, options?: { sinceBytes?: number; maxBytes?: number }) => Promise<CommandResult>;
  killBackgroundCommand?: (id: string) => Promise<BackgroundProcess>;
  listBackgroundCommands?: () => Promise<BackgroundProcess[]>;
  fetch?: typeof fetch;
};

export type ToolLogger = {
  event: (name: string, metadata?: Record<string, unknown>) => void;
  warn: (name: string, metadata?: Record<string, unknown>) => void;
  error: (name: string, metadata?: Record<string, unknown>) => void;
};

export type McpClient = {
  listTools: () => Promise<Array<{ name: string; description?: string; inputSchema?: JsonValue }>>;
  callTool: (name: string, input: JsonValue) => Promise<JsonValue>;
};

export type LspClient = {
  symbols: (path: string) => Promise<JsonValue>;
  references: (path: string, symbol: string) => Promise<JsonValue>;
  definition: (path: string, symbol: string) => Promise<JsonValue>;
};

export type ToolContext = {
  runtime: RuntimeAdapter;
  cwd: string;
  env: Record<string, string | undefined>;
  permissions: ReadonlySet<ToolPermission>;
  signal?: AbortSignal;
  logger?: ToolLogger;
  mcp?: McpClient;
  lsp?: LspClient;
};

export type ToolModelSpec = {
  name: string;
  description: string;
  parameters: JsonValue;
};

export type ToolCall = {
  id: string;
  name: string;
  input: unknown;
};

export type ToolExecution = {
  callId: string;
  toolName: string;
  ok: boolean;
  output?: JsonValue;
  error?: {
    code: string;
    message: string;
    details?: JsonValue;
  };
  durationMs: number;
};

export type ToolDefinition<InputSchema extends z.ZodTypeAny, Output> = {
  name: string;
  title: string;
  description: string;
  category: ToolCategory;
  inputSchema: InputSchema;
  permissions: ToolPermission[];
  timeoutMs?: number;
  execute: (input: z.infer<InputSchema>, context: ToolContext) => Promise<Output>;
};

export type AnyToolDefinition = ToolDefinition<z.ZodTypeAny, JsonValue>;

