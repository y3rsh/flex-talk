import { FlexRunFailedError, FlexTimeoutError } from "../errors.js";
import type { HttpClient } from "../http.js";
import type {
  AddLabwareOffsetInput,
  Command,
  CommandsPage,
  CreateRunOptions,
  EnqueueCommandRequest,
  ErrorRecoveryPolicy,
  Run,
  RunAction,
  RunActionType,
  RunCurrentState,
  RunError,
  WaitForCompletionOptions,
} from "../types/index.js";

interface RunResponse {
  data: Run;
}

interface RunsResponse {
  data: Run[];
}

interface RunActionResponse {
  data: RunAction;
}

interface RunErrorsResponse {
  data: RunError[];
}

interface RunCurrentStateResponse {
  data: Record<string, unknown>;
}

interface CommandResponse {
  data: Command;
}

interface ErrorRecoveryPolicyResponse {
  data: ErrorRecoveryPolicy;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildCreateBody(options?: CreateRunOptions): { data: Record<string, unknown> } {
  if (!options) {
    return { data: {} };
  }
  return {
    data: {
      ...(options.protocolId ? { protocolId: options.protocolId } : {}),
      ...(options.labwareOffsets ? { labwareOffsets: options.labwareOffsets } : {}),
      ...(options.runtimeParams ? { runtimeParams: options.runtimeParams } : {}),
    },
  };
}

export class RunsResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async create(options?: CreateRunOptions): Promise<Run> {
    const response = await this.http.post<RunResponse>("/runs", buildCreateBody(options));
    return response.data;
  }

  public async list(): Promise<Run[]> {
    const response = await this.http.get<RunsResponse>("/runs");
    return response.data;
  }

  public async get(runId: string): Promise<Run> {
    const response = await this.http.get<RunResponse>(`/runs/${runId}`);
    return response.data;
  }

  public async delete(runId: string): Promise<void> {
    await this.http.delete<unknown>(`/runs/${runId}`);
  }

  public async start(runId: string): Promise<RunAction> {
    return this.sendAction(runId, "play");
  }

  public async pause(runId: string): Promise<RunAction> {
    return this.sendAction(runId, "pause");
  }

  public async resume(runId: string): Promise<RunAction> {
    return this.sendAction(runId, "play");
  }

  public async stop(runId: string): Promise<RunAction> {
    return this.sendAction(runId, "stop");
  }

  public async resumeFromRecovery(runId: string): Promise<RunAction> {
    return this.sendAction(runId, "resume-from-recovery");
  }

  public async waitForCompletion(
    runId: string,
    options: WaitForCompletionOptions = {}
  ): Promise<Run> {
    const {
      pollIntervalMs = 1000,
      timeoutMs,
      throwOnFailure = true,
    } = options;

    const terminalStatuses = new Set(["succeeded", "failed", "stopped"]);
    const startedAt = Date.now();

    while (true) {
      const run = await this.get(runId);
      if (terminalStatuses.has(run.status)) {
        if (throwOnFailure && run.status === "failed") {
          throw new FlexRunFailedError(runId, run, run.errors);
        }
        return run;
      }

      if (timeoutMs !== undefined && Date.now() - startedAt > timeoutMs) {
        throw new FlexTimeoutError(runId, run.status);
      }

      await sleep(pollIntervalMs);
    }
  }

  public async getCurrentState(runId: string): Promise<RunCurrentState> {
    const response = await this.http.get<RunCurrentStateResponse>(
      `/runs/${runId}/current_state`
    );
    return { data: response.data };
  }

  public async enqueueCommand(
    runId: string,
    request: EnqueueCommandRequest
  ): Promise<Command> {
    const response = await this.http.post<CommandResponse>(
      `/runs/${runId}/commands`,
      request
    );
    return response.data;
  }

  public async getCommands(runId: string): Promise<Command[]> {
    const all: Command[] = [];
    let cursor: number | undefined = undefined;

    while (true) {
      const params = new URLSearchParams({ pageLength: "100" });
      if (cursor !== undefined) {
        params.set("cursor", String(cursor));
      }

      const page = await this.http.get<CommandsPage>(
        `/runs/${runId}/commands?${params.toString()}`
      );
      all.push(...page.data);

      if (all.length >= page.meta.totalLength) {
        break;
      }
      cursor = all.length;
    }

    return all;
  }

  public async getCommand(runId: string, commandId: string): Promise<Command> {
    const response = await this.http.get<CommandResponse>(
      `/runs/${runId}/commands/${commandId}`
    );
    return response.data;
  }

  public async getErrors(runId: string): Promise<RunError[]> {
    const response = await this.http.get<RunErrorsResponse>(`/runs/${runId}/errors`);
    return response.data;
  }

  public async addLabwareOffsets(
    runId: string,
    offsets: AddLabwareOffsetInput[]
  ): Promise<Run> {
    const response = await this.http.post<RunResponse>(
      `/runs/${runId}/labware_offsets`,
      { data: offsets }
    );
    return response.data;
  }

  public async getErrorRecoveryPolicy(runId: string): Promise<ErrorRecoveryPolicy> {
    const response = await this.http.get<ErrorRecoveryPolicyResponse>(
      `/runs/${runId}/error_recovery_policy`
    );
    return response.data;
  }

  public async setErrorRecoveryPolicy(
    runId: string,
    policy: ErrorRecoveryPolicy
  ): Promise<void> {
    await this.http.put<unknown>(`/runs/${runId}/error_recovery_policy`, {
      data: policy,
    });
  }

  private async sendAction(runId: string, actionType: RunActionType): Promise<RunAction> {
    const response = await this.http.post<RunActionResponse>(`/runs/${runId}/actions`, {
      data: { actionType },
    });
    return response.data;
  }
}
