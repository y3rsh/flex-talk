import type { HttpClient } from "../http.js";
import type { Protocol, ProtocolAnalysis, RuntimeParam } from "../types/index.js";

interface ProtocolResponse {
  data: Protocol;
}

interface ProtocolsResponse {
  data: Protocol[];
}

interface AnalysisResponse {
  data: ProtocolAnalysis;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runtimeParamsToBody(runtimeParams: RuntimeParam[] | undefined): unknown {
  if (!runtimeParams || runtimeParams.length === 0) {
    return { data: {} };
  }
  return { data: { runtimeParams } };
}

export class ProtocolsResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async upload(
    source: string | Buffer | File,
    filename = "protocol.py"
  ): Promise<Protocol> {
    const form = new FormData();
    const file = (() => {
      if (source instanceof File) {
        return source;
      }
      const content = typeof source === "string" ? source : source.toString("utf-8");
      return new File([content], filename, { type: "text/x-python" });
    })();
    form.append("files", file, filename);

    const response = await this.http.postMultipart<ProtocolResponse>(
      "/protocols",
      form
    );
    return response.data;
  }

  public async list(): Promise<Protocol[]> {
    const response = await this.http.get<ProtocolsResponse>("/protocols");
    return response.data;
  }

  public async get(protocolId: string): Promise<Protocol> {
    const response = await this.http.get<ProtocolResponse>(`/protocols/${protocolId}`);
    return response.data;
  }

  public async delete(protocolId: string): Promise<void> {
    await this.http.delete<unknown>(`/protocols/${protocolId}`);
  }

  public async analyze(
    protocolId: string,
    runtimeParams?: RuntimeParam[]
  ): Promise<ProtocolAnalysis> {
    const created = await this.http.post<AnalysisResponse>(
      `/protocols/${protocolId}/analyses`,
      runtimeParamsToBody(runtimeParams)
    );

    let analysis = created.data;
    while (analysis.status !== "completed") {
      await sleep(1000);
      analysis = await this.getAnalysis(protocolId, analysis.id);
    }
    return analysis;
  }

  public async getAnalysis(
    protocolId: string,
    analysisId: string
  ): Promise<ProtocolAnalysis> {
    const response = await this.http.get<AnalysisResponse>(
      `/protocols/${protocolId}/analyses/${analysisId}`
    );
    return response.data;
  }
}
