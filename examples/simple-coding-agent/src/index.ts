import { createStaticProvider, runAgent } from "@aos/core";
import { createLocalRuntime } from "@aos/runtimes";
import { ToolRegistry } from "@aos/tool-runtime";
import { bashRunTool, gitStatusTool, grepTool, listTool, readTool } from "@aos/tools";

const runtime = createLocalRuntime({ cwd: process.cwd() });

const registry = new ToolRegistry().registerMany([listTool, readTool, grepTool, bashRunTool, gitStatusTool]);

const provider = createStaticProvider("This static provider is a placeholder. Replace it with your LLM adapter.");

const result = await runAgent({
  provider,
  registry,
  context: {
    runtime,
    cwd: runtime.cwd,
    env: process.env,
    permissions: new Set(["filesystem:read", "shell:run", "git:read"]),
  },
  messages: [
    {
      id: "msg_user_1",
      role: "user",
      content: "Inspect this repository and tell me what it does.",
    },
  ],
});

console.log(JSON.stringify(result, null, 2));

