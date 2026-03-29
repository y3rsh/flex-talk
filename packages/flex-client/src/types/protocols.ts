export interface RuntimeParam {
  variable_name: string;
  value: string | number | boolean;
}

export interface AnalysisError {
  id?: string;
  detail?: string;
  errorType?: string;
  errorCode?: string;
}

export interface AnalysisSummary {
  id: string;
  status: "pending" | "completed";
  result?: "ok" | "not-ok" | "error" | "parameter-value-required";
}

export interface ProtocolAnalysisSummary {
  id: string;
  status: "pending" | "completed";
  result?: "ok" | "not-ok" | "error" | "parameter-value-required";
  errors?: AnalysisError[];
}

export interface ProtocolAnalysis {
  id: string;
  status: "pending" | "completed";
  result?: "ok" | "not-ok" | "error" | "parameter-value-required";
  createdAt?: string;
  completedAt?: string;
  errors?: AnalysisError[];
}

export interface ProtocolFile {
  id: string;
  name: string;
  role: "main" | "labware" | "data";
}

export interface Protocol {
  id: string;
  createdAt: string;
  files: ProtocolFile[];
  protocolType: "python";
  robotType: "OT-3 Standard";
  metadata: Record<string, unknown>;
  analyses: ProtocolAnalysisSummary[];
  analysisSummaries: AnalysisSummary[];
}
