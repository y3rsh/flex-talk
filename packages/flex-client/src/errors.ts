import type { Run, RunError, RunStatus } from "./types/index.js";

export class FlexApiError extends Error {
  public readonly status: number;
  public readonly errorCode: string | undefined;
  public readonly wrappedErrors: unknown[] | undefined;

  public constructor(
    status: number,
    errorCode: string | undefined,
    message: string,
    wrappedErrors?: unknown[]
  ) {
    super(message);
    this.name = "FlexApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.wrappedErrors = wrappedErrors;
  }
}

export class FlexRunFailedError extends Error {
  public readonly runId: string;
  public readonly run: Run;
  public readonly errors: RunError[];

  public constructor(runId: string, run: Run, errors: RunError[]) {
    super(`Run ${runId} failed: ${errors[0]?.detail ?? "unknown error"}`);
    this.name = "FlexRunFailedError";
    this.runId = runId;
    this.run = run;
    this.errors = errors;
  }
}

export class FlexTimeoutError extends Error {
  public readonly runId: string;
  public readonly lastStatus: RunStatus;

  public constructor(runId: string, lastStatus: RunStatus) {
    super(`Timed out waiting for run ${runId} (last status: ${lastStatus})`);
    this.name = "FlexTimeoutError";
    this.runId = runId;
    this.lastStatus = lastStatus;
  }
}
