import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type { BackgroundProcess, CommandResult } from "@aos/tool-runtime";

type TrackedProcess = BackgroundProcess & {
  child: ChildProcessWithoutNullStreams;
  stdout: Buffer[];
  stderr: Buffer[];
};

export class BackgroundManager {
  private readonly processes = new Map<string, TrackedProcess>();

  start(command: string, cwd: string, env?: Record<string, string>): BackgroundProcess {
    const id = `bg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const child = spawn(command, {
      cwd,
      env: { ...process.env, ...env },
      shell: true,
      windowsHide: true,
    });

    const tracked: TrackedProcess = {
      id,
      command,
      cwd,
      startedAt: new Date().toISOString(),
      status: "running",
      child,
      stdout: [],
      stderr: [],
    };

    child.stdout.on("data", (chunk: Buffer) => tracked.stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => tracked.stderr.push(chunk));
    child.on("exit", (code) => {
      tracked.status = "exited";
      tracked.exitCode = code;
    });

    this.processes.set(id, tracked);
    return stripProcess(tracked);
  }

  output(id: string, options?: { sinceBytes?: number; maxBytes?: number }): CommandResult {
    const tracked = this.require(id);
    const stdout = sliceBuffers(tracked.stdout, options);
    const stderr = sliceBuffers(tracked.stderr, options);
    return {
      exitCode: tracked.exitCode ?? null,
      stdout,
      stderr,
      timedOut: false,
      durationMs: 0,
    };
  }

  kill(id: string): BackgroundProcess {
    const tracked = this.require(id);
    if (tracked.status === "running") {
      tracked.child.kill();
      tracked.status = "killed";
      tracked.exitCode = null;
    }
    return stripProcess(tracked);
  }

  list(): BackgroundProcess[] {
    return [...this.processes.values()].map(stripProcess);
  }

  private require(id: string): TrackedProcess {
    const tracked = this.processes.get(id);
    if (!tracked) throw new Error(`Unknown background process '${id}'.`);
    return tracked;
  }
}

function stripProcess(process: TrackedProcess): BackgroundProcess {
  return {
    id: process.id,
    command: process.command,
    cwd: process.cwd,
    startedAt: process.startedAt,
    status: process.status,
    ...(process.exitCode === undefined ? {} : { exitCode: process.exitCode }),
  };
}

function sliceBuffers(buffers: Buffer[], options?: { sinceBytes?: number; maxBytes?: number }): string {
  const joined = Buffer.concat(buffers);
  const start = options?.sinceBytes ?? 0;
  const end = Math.min(joined.length, start + (options?.maxBytes ?? 50_000));
  return joined.subarray(start, end).toString("utf8");
}

