import type { RuntimeAdapter } from "@aos/tool-runtime";

export function createBrowserOnlyRuntime(): RuntimeAdapter {
  return {
    name: "browser-only",
    cwd: "/",
    now: () => new Date(),
    fetch,
  };
}

