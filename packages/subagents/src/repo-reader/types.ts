export type RepoReaderQuery = {
  id: string;
  question: string;
  focusPaths?: string[];
};

export type RepoReaderFinding = {
  queryId: string;
  summary: string;
  files: Array<{
    path: string;
    reason: string;
    ranges?: Array<{ startLine: number; endLine: number }>;
  }>;
  confidence: "low" | "medium" | "high";
};

export type RepoReaderReport = {
  findings: RepoReaderFinding[];
  mergedSummary: string;
};

