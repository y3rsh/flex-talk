import type { HttpClient } from "../http.js";
import type { ErrorRecoverySettings } from "../types/index.js";

interface ErrorRecoverySettingsResponse {
  data: ErrorRecoverySettings;
}

export class ErrorRecoveryResource {
  private readonly http: HttpClient;

  public constructor(http: HttpClient) {
    this.http = http;
  }

  public async getSettings(): Promise<ErrorRecoverySettings> {
    const response = await this.http.get<ErrorRecoverySettingsResponse>(
      "/error_recovery_settings"
    );
    return response.data;
  }

  public async updateSettings(
    settings: Partial<ErrorRecoverySettings>
  ): Promise<ErrorRecoverySettings> {
    const response = await this.http.patch<ErrorRecoverySettingsResponse>(
      "/error_recovery_settings",
      { data: settings }
    );
    return response.data;
  }

  public async resetSettings(): Promise<void> {
    await this.http.delete<unknown>("/error_recovery_settings");
  }
}
