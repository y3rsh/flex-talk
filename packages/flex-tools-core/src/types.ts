import type { FlexClient } from "@y3rsh/flex-client";

export type JsonSchema = Record<string, unknown>;

export interface ToolDefinition<TInput = any, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (ctx: ToolContext, input: TInput) => Promise<TOutput>;
}

export interface ToolContext {
  getClient: (host?: string) => FlexClient;
}

export interface DiscoverToolInput {
  candidates?: string[];
  enableSubnetScan?: boolean;
  subnetPrefixes?: string[];
  requestTimeoutMs?: number;
}

export interface HealthToolInput {
  host: string;
}

export interface CameraTakePictureInput {
  host: string;
  returnBase64?: boolean;
}

export interface RunProtocolInput {
  host: string;
  protocolSource: string;
  filename?: string;
  waitForCompletion?: boolean;
  throwOnFailure?: boolean;
}

export interface RunStatusInput {
  host: string;
  runId: string;
}
