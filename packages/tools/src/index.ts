export * from "./filesystem/index.js";
export * from "./git/index.js";
export * from "./github/index.js";
export * from "./lsp/index.js";
export * from "./mcp/index.js";
export * from "./shell/index.js";
export * from "./web/index.js";

import { globTool, grepTool, listTool, readTool, writeTool } from "./filesystem/index.js";
import { gitTools } from "./git/index.js";
import { githubTools } from "./github/index.js";
import { lspTools } from "./lsp/index.js";
import { mcpTools } from "./mcp/index.js";
import {
  bashBackgroundKillTool,
  bashBackgroundListTool,
  bashBackgroundOutputTool,
  bashBackgroundStartTool,
  bashRunTool,
} from "./shell/index.js";
import { webTools } from "./web/index.js";

export const filesystemTools = [readTool, writeTool, listTool, globTool, grepTool];

export const shellTools = [
  bashRunTool,
  bashBackgroundStartTool,
  bashBackgroundOutputTool,
  bashBackgroundKillTool,
  bashBackgroundListTool,
];

export const defaultTools = [
  ...filesystemTools,
  ...shellTools,
  ...gitTools,
  ...githubTools,
  ...webTools,
  ...mcpTools,
  ...lspTools,
];

