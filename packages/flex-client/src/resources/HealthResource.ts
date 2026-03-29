import type { HttpClient } from "../http.js";
import type { RobotHealth } from "../types/index.js";

interface HealthResponse {
  data: RobotHealth;
}

export class HealthResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async get(): Promise<RobotHealth> {
    const response = await this.http.get<HealthResponse>("/health");
    return response.data;
  }
}
