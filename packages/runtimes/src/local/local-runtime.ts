import { execFile } from "node:child_process";
import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { CommandResult, DirectoryEntry, GrepMatch, RuntimeAdapter } from "@aos/tool-runtime";
import { BackgroundManager } from "./background-manager.js";

const execFileAsync = promisify(execFile);

export type LocalRuntimeOptions = {
  cwd?: string;
  backgroundManager?: BackgroundManager;
};

export function createLocalRuntime(options: LocalRuntimeOptions = {}): RuntimeAdapter {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const background = options.backgroundManager ?? new BackgroundManager();

  return {
    name: "local",
    cwd,
    now: () => new Date(),
    async readTextFile(filePath, readOptions) {
      const absolute = resolveInside(cwd, filePath);
      const buffer = await readFile(absolute);
      const limited = readOptions?.maxBytes ? buffer.subarray(0, readOptions.maxBytes) : buffer;
      return limited.toString("utf8");
    },
    async writeTextFile(filePath, content) {
      const absolute = resolveInside(cwd, filePath);
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, content, "utf8");
    },
    async listDirectory(filePath) {
      const absolute = resolveInside(cwd, filePath);
      const entries = await readdir(absolute);
      const results: DirectoryEntry[] = [];
      for (const entry of entries) {
        const entryPath = path.join(absolute, entry);
        const stat = await lstat(entryPath);
        results.push({
          name: entry,
          path: path.relative(cwd, entryPath).replaceAll("\\", "/"),
          type: stat.isDirectory() ? "directory" : stat.isFile() ? "file" : stat.isSymbolicLink() ? "symlink" : "other",
        });
      }
      return results;
    },
    async findFiles(patterns, findOptions) {
      const root = resolveInside(cwd, findOptions?.cwd ?? ".");
      const maxResults = findOptions?.maxResults ?? 500;
      const regexes = patterns.map(globToRegex);
      const files: string[] = [];
      await walk(root, async (file) => {
        const relative = path.relative(root, file).replaceAll("\\", "/");
        if (regexes.some((regex) => regex.test(relative))) {
          files.push(path.relative(cwd, file).replaceAll("\\", "/"));
        }
        return files.length < maxResults;
      });
      return files;
    },
    async grep(pattern, grepOptions) {
      const root = resolveInside(cwd, grepOptions?.cwd ?? ".");
      const flags = grepOptions?.caseSensitive === false ? "i" : "";
      const regex = new RegExp(pattern, flags);
      const includeRegexes = grepOptions?.include?.map(globToRegex) ?? [];
      const maxResults = grepOptions?.maxResults ?? 500;
      const matches: GrepMatch[] = [];

      await walk(root, async (file) => {
        const relativeToRoot = path.relative(root, file).replaceAll("\\", "/");
        if (includeRegexes.length && !includeRegexes.some((include) => include.test(relativeToRoot))) {
          return matches.length < maxResults;
        }

        const content = await safeReadText(file);
        if (content === undefined) return matches.length < maxResults;

        const lines = content.split(/\r?\n/);
        for (const [index, line] of lines.entries()) {
          if (regex.test(line)) {
            matches.push({
              file: path.relative(cwd, file).replaceAll("\\", "/"),
              line: index + 1,
              text: line,
            });
            if (matches.length >= maxResults) return false;
          }
        }
        return matches.length < maxResults;
      });

      return matches;
    },
    async runCommand(command, runOptions) {
      const started = Date.now();
      const commandCwd = resolveInside(cwd, runOptions?.cwd ?? ".");
      try {
        const { stdout, stderr } = await execFileAsync(command, {
          cwd: commandCwd,
          shell: true,
          timeout: runOptions?.timeoutMs,
          env: { ...process.env, ...runOptions?.env },
          signal: runOptions?.signal,
          windowsHide: true,
        });
        return {
          exitCode: 0,
          stdout: String(stdout),
          stderr: String(stderr),
          timedOut: false,
          durationMs: Date.now() - started,
        };
      } catch (error) {
        const err = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: number | string };
        return {
          exitCode: typeof err.code === "number" ? err.code : null,
          stdout: String(err.stdout ?? ""),
          stderr: String(err.stderr ?? err.message),
          timedOut: err.code === "ETIMEDOUT",
          durationMs: Date.now() - started,
        };
      }
    },
    async startBackgroundCommand(command, backgroundOptions) {
      return background.start(command, resolveInside(cwd, backgroundOptions?.cwd ?? "."), backgroundOptions?.env);
    },
    async readBackgroundOutput(id, outputOptions) {
      return background.output(id, outputOptions);
    },
    async killBackgroundCommand(id) {
      return background.kill(id);
    },
    async listBackgroundCommands() {
      return background.list();
    },
    fetch,
  };
}

function resolveInside(root: string, target: string): string {
  const resolved = path.resolve(root, target);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes runtime root: ${target}`);
  }
  return resolved;
}

async function walk(root: string, onFile: (file: string) => Promise<boolean>): Promise<boolean> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const keepGoing = await walk(fullPath, onFile);
      if (!keepGoing) return false;
    } else if (entry.isFile()) {
      const keepGoing = await onFile(fullPath);
      if (!keepGoing) return false;
    }
  }
  return true;
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("**", "\0").replaceAll("*", "[^/]*");
  return new RegExp(`^${escaped.replaceAll("\0", ".*")}$`);
}

async function safeReadText(file: string): Promise<string | undefined> {
  try {
    const buffer = await readFile(file);
    if (buffer.includes(0)) return undefined;
    return buffer.toString("utf8");
  } catch {
    return undefined;
  }
}

