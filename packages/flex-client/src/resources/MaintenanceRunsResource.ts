import type { HttpClient } from "../http.js";
import type {
  Command,
  EnqueueCommandRequest,
  LabwareOffset,
  LabwareOffsetInput,
  MaintenanceRun,
} from "../types/index.js";

interface MaintenanceRunResponse {
  data: MaintenanceRun;
}

interface MaintenanceRunsResponse {
  data: MaintenanceRun[];
}

interface CommandResponse {
  data: Command;
}

interface CommandsResponse {
  data: Command[];
}

interface LabwareOffsetResponse {
  data: LabwareOffset;
}

export class MaintenanceRunsResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async create(): Promise<MaintenanceRun> {
    const response = await this.http.post<MaintenanceRunResponse>("/maintenance_runs", {
      data: {},
    });
    return response.data;
  }

  public async getCurrent(): Promise<MaintenanceRun | null> {
    const response = await this.http.get<MaintenanceRunsResponse>("/maintenance_runs");
    return response.data[0] ?? null;
  }

  public async get(runId: string): Promise<MaintenanceRun> {
    const response = await this.http.get<MaintenanceRunResponse>(
      `/maintenance_runs/${runId}`
    );
    return response.data;
  }

  public async delete(runId: string): Promise<void> {
    await this.http.delete<unknown>(`/maintenance_runs/${runId}`);
  }

  public async enqueueCommand(
    runId: string,
    request: EnqueueCommandRequest
  ): Promise<Command> {
    const requestBody: EnqueueCommandRequest = {
      ...request,
      waitUntilComplete: request.waitUntilComplete ?? true,
    };

    const response = await this.http.post<CommandResponse>(
      `/maintenance_runs/${runId}/commands`,
      requestBody
    );
    return response.data;
  }

  public async getCommands(runId: string): Promise<Command[]> {
    const response = await this.http.get<CommandsResponse>(
      `/maintenance_runs/${runId}/commands`
    );
    return response.data;
  }

  public async addLabwareOffset(
    runId: string,
    offset: LabwareOffsetInput
  ): Promise<LabwareOffset> {
    const response = await this.http.post<LabwareOffsetResponse>(
      `/maintenance_runs/${runId}/labware_offsets`,
      { data: offset }
    );
    return response.data;
  }
}
