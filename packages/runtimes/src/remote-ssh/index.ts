import type { RuntimeAdapter } from "@aos/tool-runtime";
import { createLocalRuntime } from "../local/local-runtime.js";

export type SshRuntimeOptions = {
  host: string;
  user: string;
  cwd: string;
  identityFile?: string;
};

export function createSshRuntime(options: SshRuntimeOptions): RuntimeAdapter {
  const local = createLocalRuntime({ cwd: process.cwd() });
  const runCommand = local.runCommand;
  if (!runCommand) throw new Error("Local runtime does not expose runCommand.");
  const sshTarget = `${options.user}@${options.host}`;
  const identity = options.identityFile ? ` -i ${JSON.stringify(options.identityFile)}` : "";

  return {
    ...local,
    name: "remote-ssh",
    cwd: options.cwd,
    async runCommand(command, runOptions) {
      const remoteCommand = `cd ${shellQuote(options.cwd)} && ${command}`;
      return await runCommand(`ssh${identity} ${sshTarget} ${JSON.stringify(remoteCommand)}`, runOptions);
    },
  };
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
