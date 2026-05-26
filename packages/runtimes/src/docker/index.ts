import type { RuntimeAdapter } from "@aos/tool-runtime";
import { createLocalRuntime } from "../local/local-runtime.js";

export type DockerRuntimeOptions = {
  cwd: string;
  containerName: string;
};

export function createDockerRuntime(options: DockerRuntimeOptions): RuntimeAdapter {
  const local = createLocalRuntime({ cwd: options.cwd });
  const runCommand = local.runCommand;
  if (!runCommand) throw new Error("Local runtime does not expose runCommand.");
  return {
    ...local,
    name: "docker",
    async runCommand(command, runOptions) {
      const dockerCommand = `docker exec ${options.containerName} sh -lc ${JSON.stringify(command)}`;
      return await runCommand(dockerCommand, runOptions);
    },
  };
}
