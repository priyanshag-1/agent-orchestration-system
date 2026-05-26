import type { z } from "zod";
import { MissingPermissionError, ToolRuntimeError, UnknownToolError } from "./errors.js";
import { redactSecrets } from "./redaction.js";
import type {
  AnyToolDefinition,
  JsonValue,
  ToolCall,
  ToolContext,
  ToolDefinition,
  ToolExecution,
  ToolModelSpec,
} from "./types.js";

export function defineTool<InputSchema extends z.ZodTypeAny, Output extends JsonValue>(
  tool: ToolDefinition<InputSchema, Output>,
): ToolDefinition<InputSchema, Output> {
  return tool;
}

export class ToolRegistry {
  private readonly tools = new Map<string, AnyToolDefinition>();

  register(tool: AnyToolDefinition): this {
    if (this.tools.has(tool.name)) {
      throw new ToolRuntimeError("duplicate_tool", `Tool '${tool.name}' is already registered.`, {
        toolName: tool.name,
      });
    }
    this.tools.set(tool.name, tool);
    return this;
  }

  registerMany(tools: AnyToolDefinition[]): this {
    for (const tool of tools) {
      this.register(tool);
    }
    return this;
  }

  get(name: string): AnyToolDefinition {
    const tool = this.tools.get(name);
    if (!tool) throw new UnknownToolError(name);
    return tool;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): AnyToolDefinition[] {
    return [...this.tools.values()];
  }

  modelSpecs(): ToolModelSpec[] {
    return this.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.inputSchema),
    }));
  }

  async execute(call: ToolCall, context: ToolContext): Promise<ToolExecution> {
    const started = performance.now();
    try {
      const tool = this.get(call.name);
      for (const permission of tool.permissions) {
        if (!context.permissions.has(permission)) {
          throw new MissingPermissionError(tool.name, permission);
        }
      }

      const input = tool.inputSchema.parse(call.input);
      context.logger?.event("tool.start", {
        callId: call.id,
        toolName: tool.name,
        input: redactSecrets(input),
      });

      const output = await withTimeout(tool.execute(input, context), tool.timeoutMs, context.signal);
      const durationMs = Math.round(performance.now() - started);

      context.logger?.event("tool.end", {
        callId: call.id,
        toolName: tool.name,
        status: "success",
        durationMs,
      });

      return {
        callId: call.id,
        toolName: tool.name,
        ok: true,
        output,
        durationMs,
      };
    } catch (error) {
      const durationMs = Math.round(performance.now() - started);
      const normalized = normalizeToolError(error);
      context.logger?.error("tool.end", {
        callId: call.id,
        toolName: call.name,
        status: "error",
        durationMs,
        error: normalized,
      });
      return {
        callId: call.id,
        toolName: call.name,
        ok: false,
        error: normalized,
        durationMs,
      };
    }
  }
}

function normalizeToolError(error: unknown): { code: string; message: string; details?: JsonValue } {
  if (error instanceof ToolRuntimeError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    };
  }

  if (error instanceof Error) {
    return {
      code: "tool_error",
      message: error.message,
    };
  }

  return {
    code: "unknown_error",
    message: String(error),
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number, signal?: AbortSignal): Promise<T> {
  if (!timeoutMs && !signal) return promise;

  return await new Promise<T>((resolve, reject) => {
    let settled = false;
    const timeout = timeoutMs
      ? setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(new ToolRuntimeError("tool_timeout", `Tool timed out after ${timeoutMs}ms.`));
        }, timeoutMs)
      : undefined;

    const abort = () => {
      if (settled) return;
      settled = true;
      reject(new ToolRuntimeError("tool_aborted", "Tool execution was aborted."));
    };

    signal?.addEventListener("abort", abort, { once: true });

    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        signal?.removeEventListener("abort", abort);
        resolve(value);
      },
      (error: unknown) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        signal?.removeEventListener("abort", abort);
        reject(error);
      },
    );
  });
}

function zodToJsonSchema(schema: z.ZodTypeAny): JsonValue {
  const shape = "shape" in schema._def ? schema._def.shape() : undefined;
  if (!shape || typeof shape !== "object") {
    return { type: "object", properties: {}, additionalProperties: false };
  }

  const properties: Record<string, JsonValue> = {};
  const required: string[] = [];
  for (const [key, value] of Object.entries(shape as Record<string, z.ZodTypeAny>)) {
    properties[key] = zodFieldToJsonSchema(value);
    if (value.isOptional() === false) required.push(key);
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

function zodFieldToJsonSchema(schema: z.ZodTypeAny): JsonValue {
  const typeName = schema._def.typeName as string;
  if (typeName === "ZodString") return { type: "string" };
  if (typeName === "ZodNumber") return { type: "number" };
  if (typeName === "ZodBoolean") return { type: "boolean" };
  if (typeName === "ZodArray") return { type: "array", items: {} };
  if (typeName === "ZodEnum") return { type: "string", enum: schema._def.values as string[] };
  if (typeName === "ZodOptional" || typeName === "ZodNullable") {
    return zodFieldToJsonSchema(schema._def.innerType as z.ZodTypeAny);
  }
  return { type: "object" };
}

