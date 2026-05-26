export type ReviewFinding = {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  file: string;
  line?: number;
  body: string;
};

export type ReviewWorkerReport = {
  findings: ReviewFinding[];
  summary: string;
};

