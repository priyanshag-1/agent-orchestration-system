import type { JsonValue, ToolPermission } from "./types.js";

export class ToolRuntimeError extends Error {
  readonly code: string;
  readonly details?: JsonValue;

  constructor(code: string, message: string, details?: JsonValue) {
    super(message);
    this.name = "ToolRuntimeError";
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export class MissingPermissionError extends ToolRuntimeError {
  constructor(toolName: string, permission: ToolPermission) {
    super("missing_permission", `Tool '${toolName}' requires permission '${permission}'.`, {
      toolName,
      permission,
    });
  }
}

export class MissingRuntimeCapabilityError extends ToolRuntimeError {
  constructor(toolName: string, capability: string) {
    super("missing_runtime_capability", `Tool '${toolName}' requires runtime capability '${capability}'.`, {
      toolName,
      capability,
    });
  }
}

export class UnknownToolError extends ToolRuntimeError {
  constructor(toolName: string) {
    super("unknown_tool", `Tool '${toolName}' is not registered.`, { toolName });
  }
}
