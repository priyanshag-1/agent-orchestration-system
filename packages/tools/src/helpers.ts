import { MissingRuntimeCapabilityError, type RuntimeAdapter } from "@aos/tool-runtime";

export function requireCapability<K extends keyof RuntimeAdapter>(
  runtime: RuntimeAdapter,
  toolName: string,
  capability: K,
): NonNullable<RuntimeAdapter[K]> {
  const value = runtime[capability];
  if (!value) {
    throw new MissingRuntimeCapabilityError(toolName, String(capability));
  }
  return value as NonNullable<RuntimeAdapter[K]>;
}

export function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

