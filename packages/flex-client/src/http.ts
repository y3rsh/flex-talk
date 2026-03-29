import { FlexApiError } from "./errors.js";

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

interface ErrorLikeResponse {
  errors?: Array<{
    id?: string;
    title?: string;
    detail?: string;
    errorCode?: string;
    source?: string;
    meta?: unknown;
  }>;
}

function buildDefaultHeaders(initHeaders?: HeadersInit): Headers {
  const headers = new Headers(initHeaders);
  headers.set("opentrons-version", "*");
  return headers;
}

function withJsonBody(body: unknown, initHeaders?: HeadersInit): Headers {
  const headers = buildDefaultHeaders(initHeaders);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseErrorPayload(status: number, body: unknown): FlexApiError {
  if (body && typeof body === "object") {
    const structured = body as ErrorLikeResponse;
    const firstError = structured.errors?.[0];
    if (firstError) {
      const message = firstError.detail ?? firstError.title ?? `HTTP ${status}`;
      const wrappedErrors =
        status === 422 && Array.isArray(firstError.meta)
          ? (firstError.meta as unknown[])
          : undefined;
      return new FlexApiError(status, firstError.errorCode, message, wrappedErrors);
    }
  }

  const fallbackMessage =
    typeof body === "string" && body.length > 0 ? body : `HTTP ${status}`;
  return new FlexApiError(status, undefined, fallbackMessage);
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchLike;

  public constructor(baseUrl: string, fetchFn?: FetchLike) {
    this.baseUrl = baseUrl;
    const resolvedFetch = fetchFn ?? globalThis.fetch?.bind(globalThis);
    if (!resolvedFetch) {
      throw new Error(
        "No fetch implementation found. Use Node 18+ or provide one in FlexClient config."
      );
    }
    this.fetchFn = resolvedFetch;
  }

  public async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  public async post<T>(path: string, body?: unknown): Promise<T> {
    const requestInit: RequestInit = {
      method: "POST",
      headers: withJsonBody(body),
    };
    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }
    return this.request<T>(path, requestInit);
  }

  public async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      headers: withJsonBody(body),
      body: JSON.stringify(body),
    });
  }

  public async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      headers: withJsonBody(body),
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  public async postMultipart<T>(path: string, form: FormData): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      headers: buildDefaultHeaders(),
      body: form,
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetchFn(url, {
      ...init,
      headers: buildDefaultHeaders(init.headers),
    });

    const body = await parseBody(response);

    if (!response.ok) {
      throw parseErrorPayload(response.status, body);
    }

    return body as T;
  }
}
