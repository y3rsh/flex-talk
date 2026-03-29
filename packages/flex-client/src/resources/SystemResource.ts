import type { HttpClient } from "../http.js";
import type { SystemTime } from "../types/index.js";

interface SystemTimeResponse {
  data: SystemTime;
}

export class SystemResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async getTime(): Promise<SystemTime> {
    const response = await this.http.get<SystemTimeResponse>("/system/time");
    return response.data;
  }

  public async setTime(utcTime: string): Promise<SystemTime> {
    const response = await this.http.put<SystemTimeResponse>("/system/time", {
      data: { utcTime },
    });
    return response.data;
  }
}
