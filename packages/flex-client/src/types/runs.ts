import type { Command, EnqueueCommandRequest } from "./commands.js";
import type { ErrorRecoveryPolicy } from "./errorRecovery.js";
import type { LabwareOffset } from "./labwareOffsets.js";
import type { RuntimeParam } from "./protocols.js";

export type RunStatus =
  | "idle"
  | "running"
  | "paused"
  | "stop-requested"
  | "stopped"
  | "finishing"
  | "succeeded"
  | "failed";

export interface RunError {
  id: string;
  createdAt: string;
  errorType: string;
  errorCode: string;
  detail: string;
  errorInfo: Record<string, unknown>;
  wrappedErrors: RunError[];
}

export interface Run {
  id: string;
  createdAt: string;
  status: RunStatus;
  current: boolean;
  actions: RunAction[];
  errors: RunError[];
  pipettes: RunPipette[];
  labware: RunLabware[];
  modules: RunModule[];
  liquids: RunLiquid[];
  protocolId?: string;
  labwareOffsets: LabwareOffset[];
}

export type RunActionType = "play" | "pause" | "stop" | "resume-from-recovery";

export interface RunAction {
  id: string;
  createdAt: string;
  actionType: RunActionType;
}

export interface RunPipette {
  id: string;
  mount: string;
  pipetteName: string;
}

export interface RunLabware {
  id: string;
  definitionUri?: string;
  location?: Record<string, unknown>;
}

export interface RunModule {
  id: string;
  model?: string;
  location?: Record<string, unknown>;
}

export interface RunLiquid {
  id: string;
  displayName?: string;
}

export interface RunCurrentState {
  data: Record<string, unknown>;
}

export interface CreateRunOptions {
  protocolId?: string;
  labwareOffsets?: LabwareOffset[];
  runtimeParams?: RuntimeParam[];
}

export interface WaitForCompletionOptions {
  pollIntervalMs?: number;
  timeoutMs?: number;
  throwOnFailure?: boolean;
}

export interface CommandsPage {
  data: Command[];
  meta: {
    totalLength: number;
  };
}

export type AddLabwareOffsetInput = Omit<LabwareOffset, "id" | "createdAt">;

export interface RunsResourceApi {
  create(options?: CreateRunOptions): Promise<Run>;
  list(): Promise<Run[]>;
  get(runId: string): Promise<Run>;
  delete(runId: string): Promise<void>;
  start(runId: string): Promise<RunAction>;
  pause(runId: string): Promise<RunAction>;
  resume(runId: string): Promise<RunAction>;
  stop(runId: string): Promise<RunAction>;
  resumeFromRecovery(runId: string): Promise<RunAction>;
  waitForCompletion(
    runId: string,
    options?: WaitForCompletionOptions
  ): Promise<Run>;
  getCurrentState(runId: string): Promise<RunCurrentState>;
  enqueueCommand(runId: string, request: EnqueueCommandRequest): Promise<Command>;
  getCommands(runId: string): Promise<Command[]>;
  getCommand(runId: string, commandId: string): Promise<Command>;
  getErrors(runId: string): Promise<RunError[]>;
  addLabwareOffsets(runId: string, offsets: AddLabwareOffsetInput[]): Promise<Run>;
  getErrorRecoveryPolicy(runId: string): Promise<ErrorRecoveryPolicy>;
  setErrorRecoveryPolicy(runId: string, policy: ErrorRecoveryPolicy): Promise<void>;
}
