import type { Command, EnqueueCommandRequest } from "./commands.js";
import type { LabwareOffset, LabwareOffsetInput } from "./labwareOffsets.js";

export interface MaintenanceRun {
  id: string;
  createdAt: string;
  status: string;
  current: boolean;
}

export interface MaintenanceRunsResourceApi {
  create(): Promise<MaintenanceRun>;
  getCurrent(): Promise<MaintenanceRun | null>;
  get(runId: string): Promise<MaintenanceRun>;
  delete(runId: string): Promise<void>;
  enqueueCommand(runId: string, request: EnqueueCommandRequest): Promise<Command>;
  getCommands(runId: string): Promise<Command[]>;
  addLabwareOffset(runId: string, offset: LabwareOffsetInput): Promise<LabwareOffset>;
}
