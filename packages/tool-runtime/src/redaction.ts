const SECRET_NAME_PATTERN =
  /(api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret|access[_-]?key|refresh[_-]?token)/i;

export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item));
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = SECRET_NAME_PATTERN.test(key) ? "[REDACTED]" : redactSecrets(nested);
    }
    return output;
  }

  if (typeof value === "string" && looksLikeSecret(value)) {
    return `${value.slice(0, 4)}...[REDACTED]`;
  }

  return value;
}

function looksLikeSecret(value: string): boolean {
  if (value.length < 24) return false;
  if (/^(sk-|ghp_|github_pat_|xox[baprs]-|AKIA|ASIA)/.test(value)) return true;
  return /^[A-Za-z0-9_\-+/=]{32,}$/.test(value);
}

